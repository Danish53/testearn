import { ethers } from "ethers";
import { USDT_BEP20_CONTRACT } from "@/lib/deposit/constants";

const ETHERSCAN_V2 = "https://api.etherscan.io/v2/api";
const BSC_CHAIN_ID = "56";

function apiKey() {
  return process.env.BSCSCAN_API_KEY || process.env.ETHERSCAN_API_KEY || "";
}

async function etherscanGet(params, key) {
  const url = new URL(ETHERSCAN_V2);
  url.searchParams.set("chainid", BSC_CHAIN_ID);
  url.searchParams.set("apikey", key);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  if (json.status !== "1" || !Array.isArray(json.result)) return [];
  return json.result;
}

/**
 * Detect incoming BNB (native) and non-USDT BEP20 tokens — not credited on platform.
 */
export async function detectWrongBep20Sends(toAddress) {
  const key = apiKey();
  if (!key || !toAddress) return [];

  const dest = ethers.getAddress(toAddress).toLowerCase();
  const alerts = [];
  const seen = new Set();

  const push = (item) => {
    const k = `${item.alertType}:${item.txHash}`;
    if (seen.has(k)) return;
    seen.add(k);
    alerts.push(item);
  };

  async function fetchPages(action, extra = {}) {
    const rows = [];
    for (const page of ["1", "2"]) {
      const batch = await etherscanGet(
        {
          module: "account",
          action,
          address: ethers.getAddress(toAddress),
          page,
          offset: "100",
          sort: "desc",
          ...extra,
        },
        key
      );
      rows.push(...batch);
    }
    return rows;
  }

  const nativeTxs = await fetchPages("txlist");

  for (const tx of nativeTxs) {
    if ((tx.to || "").toLowerCase() !== dest) continue;
    if (String(tx.isError) === "1") continue;
    const value = BigInt(tx.value || "0");
    if (value <= 0n) continue;
    const bnb = Number(ethers.formatEther(value));
    if (bnb <= 0) continue;
    push({
      network: "bep20",
      alertType: "wrong_bnb",
      txHash: tx.hash,
      assetSymbol: "BNB",
      amount: bnb,
      message: `You sent ${bnb} BNB (coin) to your deposit address. This platform only credits USDT. Send USDT on BSC (BEP20) to the same address.`,
    });
  }

  const tokenTxs = await fetchPages("tokentx");

  const usdt = USDT_BEP20_CONTRACT.toLowerCase();

  for (const tx of tokenTxs) {
    if ((tx.to || "").toLowerCase() !== dest) continue;
    if ((tx.contractAddress || "").toLowerCase() === usdt) continue;

    const decimals = Number(tx.tokenDecimal ?? 18);
    const raw = BigInt(tx.value || "0");
    const amount = Number(raw) / 10 ** decimals;
    if (amount <= 0) continue;

    const symbol = (tx.tokenSymbol || "TOKEN").toUpperCase();
    push({
      network: "bep20",
      alertType: "wrong_token",
      txHash: tx.hash,
      assetSymbol: symbol,
      amount,
      message: `You sent ${amount} ${symbol} (not USDT) to your deposit address. Only USDT on BNB Smart Chain is credited to your balance.`,
    });
  }

  return alerts;
}
