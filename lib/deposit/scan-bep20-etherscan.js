import { ethers } from "ethers";
import { USDT_BEP20_CONTRACT } from "@/lib/deposit/constants";

const ETHERSCAN_V2 = "https://api.etherscan.io/v2/api";
const BSC_CHAIN_ID = "56";

/**
 * Incoming USDT BEP20 via Etherscan API v2 (BSC chainid=56).
 * Free key: https://bscscan.com/myapikey (same key works on v2).
 */
export async function scanBep20ViaEtherscan(toAddress, apiKey) {
  if (!toAddress || !apiKey) return [];

  const url = new URL(ETHERSCAN_V2);
  url.searchParams.set("chainid", BSC_CHAIN_ID);
  url.searchParams.set("module", "account");
  url.searchParams.set("action", "tokentx");
  url.searchParams.set("contractaddress", USDT_BEP20_CONTRACT);
  url.searchParams.set("address", ethers.getAddress(toAddress));
  url.searchParams.set("page", "1");
  url.searchParams.set("offset", "100");
  url.searchParams.set("sort", "desc");
  url.searchParams.set("apikey", apiKey);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    console.warn("BEP20 Etherscan scan HTTP:", res.status);
    return [];
  }

  const json = await res.json();
  if (json.status !== "1" || !Array.isArray(json.result)) {
    if (json.message && json.message !== "No transactions found") {
      console.warn("BEP20 Etherscan scan:", json.message);
    }
    return [];
  }

  const dest = ethers.getAddress(toAddress).toLowerCase();
  const deposits = [];

  for (const tx of json.result) {
    if ((tx.to || "").toLowerCase() !== dest) continue;
    const decimals = Number(tx.tokenDecimal ?? 18);
    const raw = BigInt(tx.value || "0");
    const amount = Number(raw) / 10 ** decimals;
    if (amount <= 0) continue;

    const confirmations = Number(tx.confirmations || 0);
    deposits.push({
      network: "bep20",
      txHash: tx.hash,
      fromAddress: tx.from || "",
      toAddress: tx.to,
      amount,
      confirmations: confirmations > 0 ? confirmations : 20,
      blockTime: tx.timeStamp
        ? new Date(Number(tx.timeStamp) * 1000)
        : new Date(),
    });
  }

  return deposits;
}
