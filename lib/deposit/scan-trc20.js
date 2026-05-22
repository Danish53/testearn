import { TRONGRID_API, USDT_TRC20_CONTRACT } from "@/lib/deposit/constants";

function tronHeaders() {
  const key = process.env.TRONGRID_API_KEY;
  return key ? { "TRON-PRO-API-KEY": key } : {};
}

/** Fetch incoming USDT TRC20 transfers to address (confirmed). */
export async function scanTrc20Deposits(toAddress) {
  if (!toAddress) return [];

  const url = new URL(
    `${TRONGRID_API}/v1/accounts/${toAddress}/transactions/trc20`
  );
  url.searchParams.set("only_confirmed", "true");
  url.searchParams.set("only_to", "true");
  url.searchParams.set("limit", "50");
  url.searchParams.set("contract_address", USDT_TRC20_CONTRACT);

  const res = await fetch(url.toString(), {
    headers: tronHeaders(),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const body = await res.text();
    console.warn("TRC20 scan failed:", res.status, body.slice(0, 200));
    return [];
  }

  const json = await res.json();
  const rows = json.data || [];
  const dest = toAddress.trim();

  return rows
    .filter((tx) => (tx.to || "").trim() === dest)
    .map((tx) => {
      const decimals = Number(tx.token_info?.decimals ?? 6);
      const raw = BigInt(tx.value || "0");
      const amount = Number(raw) / 10 ** decimals;
      return {
        network: "trc20",
        txHash: tx.transaction_id,
        fromAddress: tx.from || "",
        toAddress: tx.to,
        amount,
        confirmations: 20,
        blockTime: tx.block_timestamp ? new Date(tx.block_timestamp) : new Date(),
      };
    })
    .filter((d) => d.amount > 0);
}
