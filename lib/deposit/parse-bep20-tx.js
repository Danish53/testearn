import { ethers } from "ethers";
import { USDT_BEP20_CONTRACT } from "@/lib/deposit/constants";
import { createBscProvider, getBscRpcUrls } from "@/lib/deposit/bsc-rpc";

const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

/**
 * Read a BSC tx by hash — detect USDT to deposit address or mistaken native BNB.
 */
export async function parseBep20DepositTx(txHash, expectedToAddress) {
  const hash = String(txHash || "").trim();
  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return { ok: false, message: "Invalid transaction hash" };
  }
  if (!expectedToAddress) {
    return { ok: false, message: "Deposit address not found" };
  }

  const provider = createBscProvider(getBscRpcUrls()[0]);
  const expected = ethers.getAddress(expectedToAddress).toLowerCase();

  const [receipt, tx] = await Promise.all([
    provider.getTransactionReceipt(hash),
    provider.getTransaction(hash),
  ]);

  if (!receipt || !tx) {
    return { ok: false, message: "Transaction not found on BNB Smart Chain" };
  }

  if (tx.to?.toLowerCase() === expected && tx.value > 0n) {
    const bnb = Number(ethers.formatEther(tx.value));
    return {
      ok: false,
      wrongAsset: "bnb",
      bnbAmount: bnb,
      message: `This transaction sent ${bnb} BNB (coin), not USDT. Open USDT in Trust Wallet, network BSC, and send USDT again.`,
    };
  }

  const latest = await provider.getBlockNumber();
  const iface = new ethers.Interface([
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ]);

  let match = null;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== USDT_BEP20_CONTRACT.toLowerCase()) continue;
    if (log.topics[0] !== TRANSFER_TOPIC) continue;
    try {
      const parsed = iface.parseLog(log);
      if (parsed.args.to.toLowerCase() !== expected) continue;
      const amount = Number(ethers.formatUnits(parsed.args.value, 18));
      if (amount <= 0) continue;
      match = {
        network: "bep20",
        txHash: hash,
        fromAddress: parsed.args.from,
        toAddress: parsed.args.to,
        amount,
        confirmations: Math.max(0, latest - receipt.blockNumber + 1),
        blockTime: new Date(),
      };
      break;
    } catch {
      /* skip */
    }
  }

  if (!match) {
    return {
      ok: false,
      message:
        "No USDT transfer to your deposit address in this transaction. Confirm you sent USDT (BEP20) on BNB Smart Chain.",
    };
  }

  return { ok: true, incoming: match };
}
