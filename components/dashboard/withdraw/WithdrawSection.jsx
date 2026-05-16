"use client";

import { useState } from "react";
import { ArrowUpFromLine, Info } from "lucide-react";
import { DEMO_USER } from "@/components/dashboard/demo-data";
import { DASH } from "@/components/dashboard/dashboard-ui";
import PageHeader from "@/components/dashboard/PageHeader";

export default function WithdrawSection() {
  const [network, setNetwork] = useState("trc20");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);

  const balance = DEMO_USER.balance;
  const fee = 1;
  const num = parseFloat(amount) || 0;
  const receive = Math.max(0, num - fee);

  function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    window.setTimeout(() => setBusy(false), 1200);
  }

  return (
    <div className={DASH.wrap}>
      <PageHeader
        icon={ArrowUpFromLine}
        title="Withdraw"
        lead="Request a payout to your external USDT address. Admin approval and on-chain send — demo form ready for API."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={DASH.card}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Available
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-solar-accent">
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className={`${DASH.card} flex gap-3`}>
          <Info className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
          <p className="text-xs leading-relaxed text-slate-400">
            Min withdraw $20 · Max $5,000/day · Processing 1–24h after approval
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={DASH.card}>
        <div className="space-y-4">
          <div>
            <p className={DASH.label}>Network</p>
            <div className="flex flex-wrap gap-2">
              {["trc20", "bep20"].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setNetwork(id)}
                  className={`${DASH.tab} ${network === id ? DASH.tabActive : DASH.tabIdle}`}
                >
                  {id === "trc20" ? "TRC20" : "BEP20"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="withdraw-amount" className={DASH.label}>
              Amount (USDT)
            </label>
            <input
              id="withdraw-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={DASH.input}
              placeholder="0.00"
            />
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-solar-accent hover:underline"
              onClick={() => setAmount(String(balance))}
            >
              Max: ${balance.toFixed(2)}
            </button>
          </div>
          <div>
            <label htmlFor="withdraw-address" className={DASH.label}>
              Destination address
            </label>
            <input
              id="withdraw-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${DASH.input} font-mono`}
              placeholder={network === "trc20" ? "T…" : "0x…"}
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Network fee</span>
              <span className="tabular-nums">${fee.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex justify-between font-semibold text-white">
              <span>You receive</span>
              <span className="tabular-nums text-solar-accent">${receive.toFixed(2)}</span>
            </div>
          </div>
          <button type="submit" disabled={busy} className={DASH.btnPrimary}>
            {busy ? "Submitting…" : "Request withdrawal"}
          </button>
        </div>
      </form>
    </div>
  );
}
