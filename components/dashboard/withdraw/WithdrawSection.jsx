"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpFromLine, CheckCircle2, Info, Loader2 } from "lucide-react";
import { DASH } from "@/components/dashboard/dashboard-ui";
import PageHeader from "@/components/dashboard/PageHeader";
import { setUser } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const FEE = 1;
const MIN_WITHDRAW = 20;

function statusLabel(status) {
  const map = {
    pending: "Pending approval",
    approved: "Approved",
    processing: "Sending on-chain…",
    completed: "Completed",
    rejected: "Rejected",
    failed: "Failed",
  };
  return map[status] || status;
}

export default function WithdrawSection() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [network, setNetwork] = useState("trc20");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recent, setRecent] = useState([]);

  const balance = user?.balance ?? 0;
  const num = parseFloat(amount) || 0;
  const receive = Math.max(0, Math.round((num - FEE) * 100) / 100);

  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/withdraw/history", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setRecent(data.withdrawals || []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: num,
          toAddress: address.trim(),
          network,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Withdrawal failed");
        return;
      }
      if (data.user) dispatch(setUser(data.user));
      setSuccess(data.message || "Request submitted");
      setAmount("");
      setAddress("");
      await loadRecent();
    } catch {
      setError("Could not submit withdrawal");
    } finally {
      setBusy(false);
    }
  }

  const canSubmit =
    num >= MIN_WITHDRAW && num <= balance && address.trim().length > 0 && !busy;

  return (
    <div className={DASH.wrap}>
      <PageHeader
        icon={ArrowUpFromLine}
        title="Withdraw USDT"
        lead="Enter amount and your external wallet (Trust Wallet, Binance, etc.). Balance is validated, then admin approves or auto-processing sends on-chain."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={DASH.card}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Available balance
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-solar-accent">
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          {(user?.pendingWithdrawal ?? 0) > 0 ? (
            <p className="mt-2 text-xs text-amber-300">
              ${user.pendingWithdrawal.toFixed(2)} pending in withdrawals
            </p>
          ) : null}
        </div>
        <div className={`${DASH.card} flex gap-3`}>
          <Info className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
          <p className="text-xs leading-relaxed text-slate-400">
            Min ${MIN_WITHDRAW} USDT · Fee ${FEE} · Max $5,000/day · Auto-approve when enabled in
            server config, otherwise admin approval then blockchain transfer.
          </p>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          {success}
        </p>
      ) : null}

      <form onSubmit={(e) => void handleSubmit(e)} className={DASH.card}>
        <div className="space-y-4">
          <div>
            <p className={DASH.label}>Network type</p>
            <div className="flex flex-wrap gap-2">
              {["trc20", "bep20"].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setNetwork(id)}
                  className={`${DASH.tab} ${network === id ? DASH.tabActive : DASH.tabIdle}`}
                >
                  USDT · {id === "trc20" ? "TRC20 · Tron" : "BEP20 · BSC"}
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
              min={MIN_WITHDRAW}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={DASH.input}
              placeholder="0.00"
              required
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
              External wallet address
            </label>
            <input
              id="withdraw-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${DASH.input} font-mono text-sm`}
              placeholder={network === "trc20" ? "T… (Trust Wallet / Binance)" : "0x…"}
              required
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Network fee</span>
              <span className="tabular-nums">${FEE.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex justify-between font-semibold text-white">
              <span>You receive on-chain</span>
              <span className="tabular-nums text-solar-accent">${receive.toFixed(2)}</span>
            </div>
          </div>
          <button type="submit" disabled={!canSubmit} className={DASH.btnPrimary}>
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Processing…
              </span>
            ) : (
              "Request withdrawal"
            )}
          </button>
        </div>
      </form>

      {recent.length > 0 ? (
        <div className={DASH.card}>
          <h2 className="text-sm font-semibold text-white">Recent withdrawal requests</h2>
          <ul className="mt-4 space-y-2">
            {recent.slice(0, 6).map((w) => (
              <li
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-white">
                    -${Number(w.amount).toFixed(2)} → {w.network.toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-500">{statusLabel(w.status)}</p>
                </div>
                {w.txHash ? (
                  <span className="font-mono text-[10px] text-slate-500">
                    {w.txHash.slice(0, 10)}…
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
