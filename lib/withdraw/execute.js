import { ethers } from "ethers";
import { decryptSecret } from "@/lib/wallet/decrypt";
import { BSC_RPC_URL, USDT_BEP20_CONTRACT } from "@/lib/deposit/constants";
import { WITHDRAW_DRY_RUN } from "@/lib/withdraw/constants";

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];

async function sendBep20Usdt(privateKey, toAddress, receiveAmount) {
  const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(USDT_BEP20_CONTRACT, ERC20_ABI, wallet);
  const value = ethers.parseUnits(receiveAmount.toFixed(6), 18);
  const tx = await contract.transfer(toAddress, value);
  const receipt = await tx.wait();
  return receipt.hash;
}

async function sendTrc20Usdt(privateKey, toAddress, receiveAmount) {
  const mod = await import("tronweb");
  const TronWeb = mod.default?.TronWeb ?? mod.TronWeb ?? mod.default;
  const tronWeb = new TronWeb({
    fullHost: "https://api.trongrid.io",
    privateKey: privateKey.replace(/^0x/, ""),
  });
  const contractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
  const amountSun = Math.floor(receiveAmount * 1e6);
  const contract = await tronWeb.contract().at(contractAddress);
  const txid = await contract.transfer(toAddress, amountSun).send();
  return typeof txid === "string" ? txid : txid?.txid || String(txid);
}

/** Execute on-chain USDT transfer from user hot wallet. */
export async function executeWithdrawalTransfer(user, withdrawal) {
  if (WITHDRAW_DRY_RUN) {
    return {
      txHash: `dry-run-${withdrawal.network}-${Date.now()}`,
      dryRun: true,
    };
  }

  const encrypted = user.wallet?.encryptedPrivateKey;
  if (!encrypted) {
    throw new Error("User wallet keys not found");
  }

  const privateKey = decryptSecret(encrypted);
  const { network, toAddress, receiveAmount } = withdrawal;

  if (network === "bep20") {
    const hash = await sendBep20Usdt(privateKey, toAddress, receiveAmount);
    return { txHash: hash, dryRun: false };
  }

  if (network === "trc20") {
    const hash = await sendTrc20Usdt(privateKey, toAddress, receiveAmount);
    return { txHash: hash, dryRun: false };
  }

  throw new Error("Unsupported network");
}
