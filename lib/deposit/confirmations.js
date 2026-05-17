import { ethers } from "ethers";
import { BSC_RPC_URL, MIN_CONFIRMATIONS } from "@/lib/deposit/constants";

/** Current BEP20 confirmation count for a tx hash (0 if not mined). */
export async function getBep20Confirmations(txHash) {
  if (!txHash) return 0;
  try {
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt?.blockNumber) return 0;
    const latest = await provider.getBlockNumber();
    return Math.max(0, latest - receipt.blockNumber + 1);
  } catch (err) {
    console.warn("BEP20 confirmations:", err.message);
    return 0;
  }
}

export function isDepositConfirmed(network, confirmations) {
  if (network === "trc20") return true;
  return confirmations >= MIN_CONFIRMATIONS;
}
