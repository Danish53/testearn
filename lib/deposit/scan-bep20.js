import { ethers } from "ethers";
import { USDT_BEP20_CONTRACT } from "@/lib/deposit/constants";
import {
  createBscProvider,
  getBscRpcUrls,
  isBscRateLimitError,
  sleep,
} from "@/lib/deposit/bsc-rpc";

const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

/** ~24h on BSC. Override with BEP20_BLOCK_LOOKBACK for older deposits. */
const DEFAULT_LOOKBACK = Number(process.env.BEP20_BLOCK_LOOKBACK) || 28800;
const CHUNK_SIZE = 2000;
const CHUNK_DELAY_MS = 400;
const MAX_RETRIES = 3;

async function fetchLogsWithRetry(filter, rpcUrls, rpcIndex) {
  let lastErr;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const url = rpcUrls[(rpcIndex + attempt) % rpcUrls.length];
    const provider = createBscProvider(url);
    try {
      const logs = await provider.getLogs(filter);
      return { logs, nextRpcIndex: (rpcIndex + attempt + 1) % rpcUrls.length };
    } catch (err) {
      lastErr = err;
      if (isBscRateLimitError(err)) {
        await sleep(CHUNK_DELAY_MS * (attempt + 2));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

/** Fetch incoming USDT BEP20 Transfer events (newest blocks first, RPC-safe). */
export async function scanBep20Deposits(toAddress) {
  if (!toAddress) return [];

  const rpcUrls = getBscRpcUrls();
  const provider = createBscProvider(rpcUrls[0]);
  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latest - DEFAULT_LOOKBACK);
  const toPadded = ethers.zeroPadValue(ethers.getAddress(toAddress), 32);

  const ranges = [];
  for (let start = fromBlock; start <= latest; start += CHUNK_SIZE) {
    ranges.push([start, Math.min(start + CHUNK_SIZE - 1, latest)]);
  }
  ranges.reverse();

  const logs = [];
  let rpcIndex = 0;
  let chunksFailed = 0;

  for (const [start, end] of ranges) {
    try {
      const result = await fetchLogsWithRetry(
        {
          address: USDT_BEP20_CONTRACT,
          topics: [TRANSFER_TOPIC, null, toPadded],
          fromBlock: start,
          toBlock: end,
        },
        rpcUrls,
        rpcIndex
      );
      logs.push(...result.logs);
      rpcIndex = result.nextRpcIndex;
    } catch (err) {
      chunksFailed += 1;
      console.warn(`BEP20 scan ${start}-${end}:`, err.message);
    }
    await sleep(CHUNK_DELAY_MS);
  }

  if (chunksFailed > 0) {
    console.warn(
      `BEP20 scan: ${chunksFailed}/${ranges.length} chunk(s) failed for ${toAddress} — try BSC_RPC_URL with a dedicated API key`
    );
  }

  const iface = new ethers.Interface([
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ]);

  const seen = new Set();
  const deposits = [];
  for (const log of logs) {
    const key = `${log.transactionHash}:${log.index}`;
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      const parsed = iface.parseLog(log);
      const amount = Number(ethers.formatUnits(parsed.args.value, 18));
      const confirmations = latest - log.blockNumber + 1;
      deposits.push({
        network: "bep20",
        txHash: log.transactionHash,
        fromAddress: parsed.args.from,
        toAddress: parsed.args.to,
        amount,
        confirmations,
        blockTime: new Date(),
      });
    } catch {
      /* skip malformed log */
    }
  }

  return deposits.filter((d) => d.amount > 0);
}
