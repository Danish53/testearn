import { ethers } from "ethers";
import { BSC_RPC_URL, USDT_BEP20_CONTRACT } from "@/lib/deposit/constants";

const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");
const BLOCK_LOOKBACK = 8000;

/** Fetch incoming USDT BEP20 Transfer events to address. */
export async function scanBep20Deposits(toAddress) {
  if (!toAddress) return [];

  const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latest - BLOCK_LOOKBACK);
  const toPadded = ethers.zeroPadValue(ethers.getAddress(toAddress), 32);

  let logs = [];
  try {
    logs = await provider.getLogs({
      address: USDT_BEP20_CONTRACT,
      topics: [TRANSFER_TOPIC, null, toPadded],
      fromBlock,
      toBlock: latest,
    });
  } catch (err) {
    console.warn("BEP20 scan getLogs:", err.message);
    return [];
  }

  const iface = new ethers.Interface([
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ]);

  const deposits = [];
  for (const log of logs) {
    try {
      const parsed = iface.parseLog(log);
      const amount = Number(ethers.formatUnits(parsed.args.value, 18));
      const block = await provider.getBlock(log.blockNumber);
      const confirmations = latest - log.blockNumber + 1;
      deposits.push({
        network: "bep20",
        txHash: log.transactionHash,
        fromAddress: parsed.args.from,
        toAddress: parsed.args.to,
        amount,
        confirmations,
        blockTime: block?.timestamp ? new Date(block.timestamp * 1000) : new Date(),
      });
    } catch {
      /* skip malformed log */
    }
  }

  return deposits.filter((d) => d.amount > 0);
}
