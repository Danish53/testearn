import { ethers } from "ethers";

const FALLBACK_RPCS = [
  "https://bsc.publicnode.com",
  "https://bsc-dataseed.binance.org",
  "https://bsc-dataseed1.binance.org",
  "https://bsc-dataseed2.binance.org",
  "https://bsc-dataseed3.binance.org",
  "https://bsc-dataseed4.binance.org",
];

/** Comma-separated BSC_RPC_URL values, else built-in fallbacks. */
export function getBscRpcUrls() {
  const raw = process.env.BSC_RPC_URL || "";
  const fromEnv = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const list = fromEnv.length > 0 ? fromEnv : FALLBACK_RPCS;
  return [...new Set(list)];
}

export function isBscRateLimitError(err) {
  const msg = String(err?.message || err || "");
  const code = err?.error?.code ?? err?.code;
  return code === -32005 || /rate limit|too many requests|limit exceeded/i.test(msg);
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createBscProvider(url) {
  return new ethers.JsonRpcProvider(url, 56, { staticNetwork: true });
}
