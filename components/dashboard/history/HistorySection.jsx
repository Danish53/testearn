"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { History, Loader2 } from "lucide-react";
import { depositToHistoryRow } from "@/lib/history/map-deposit";
import { commissionToHistoryRow } from "@/lib/history/map-commission";
import { profitToHistoryRow, purchaseToHistoryRow } from "@/lib/history/map-investment";
import { withdrawalToHistoryRow } from "@/lib/history/map-withdraw";
import { DASH } from "@/components/dashboard/dashboard-ui";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge, { txStatusTone } from "@/components/dashboard/StatusBadge";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "deposit", label: "Deposits" },
  { id: "withdraw", label: "Withdrawals" },
  { id: "package", label: "Packages" },
  { id: "earning", label: "Earnings" },
  { id: "referral", label: "Referral" },
];

function formatAmount(amount, status) {
  if (status === "rejected" && amount === 0) return "$0.00";
  const sign = amount >= 0 ? "+" : "";
  return `${sign}$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default function HistorySection() {
  const [filter, setFilter] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [depRes, wdrRes, invRes, refRes] = await Promise.all([
        fetch("/api/deposit/history", { credentials: "include" }),
        fetch("/api/withdraw/history", { credentials: "include" }),
        fetch("/api/investment/history", { credentials: "include" }),
        fetch("/api/referral/commissions", { credentials: "include" }),
      ]);

      const depData = depRes.ok ? await depRes.json() : { deposits: [] };
      const wdrData = wdrRes.ok ? await wdrRes.json() : { withdrawals: [] };
      const invData = invRes.ok ? await invRes.json() : { purchases: [], profits: [] };
      const refData = refRes.ok ? await refRes.json() : { commissions: [] };

      if (!depRes.ok && !wdrRes.ok && !invRes.ok && !refRes.ok) {
        setError("Could not load transaction history");
        setRows([]);
        return;
      }

      const combined = [
        ...(depData.deposits || []).map(depositToHistoryRow),
        ...(wdrData.withdrawals || []).map(withdrawalToHistoryRow),
        ...(invData.purchases || []).map(purchaseToHistoryRow),
        ...(invData.profits || []).map(profitToHistoryRow),
        ...(refData.commissions || []).map(commissionToHistoryRow),
      ];
      combined.sort((a, b) => b.sortAt - a.sortAt);
      setRows(combined);
    } catch {
      setError("Could not load transaction history");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.type === filter);
  }, [filter, rows]);

  return (
    <div className={DASH.wrap}>
      <PageHeader
        icon={History}
        title="Transaction history"
        lead="Deposits and withdrawals in one ledger — updated when blockchain payments are detected or payouts are processed."
      />

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`${DASH.tab} ${filter === f.id ? DASH.tabActive : DASH.tabIdle}`}
          >
            {f.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void loadAll()}
          disabled={loading}
          className={`${DASH.btnSecondary} ml-auto min-h-[40px] px-4 py-2 text-xs`}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <section className={DASH.panel}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 sm:px-6">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="hidden px-4 py-3 sm:table-cell">Network</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center sm:px-6">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-solar-accent" aria-hidden />
                    <p className="mt-3 text-sm text-slate-500">Loading history…</p>
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={`${tx.type}-${tx.id}`} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-4 py-3 sm:px-6">
                      <p className="font-medium text-white">{tx.date}</p>
                      <p className="text-xs text-slate-500">{tx.time}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{tx.label}</p>
                      <p className="font-mono text-xs text-slate-500" title={tx.txHash}>
                        {tx.txHash}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 sm:table-cell">{tx.network}</td>
                    <td
                      className={`px-4 py-3 text-right font-semibold tabular-nums ${
                        tx.amount > 0
                          ? "text-emerald-400"
                          : tx.amount < 0
                            ? "text-slate-300"
                            : "text-red-300"
                      }`}
                    >
                      {formatAmount(tx.amount, tx.status)}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <StatusBadge status={tx.status} tone={txStatusTone(tx.status)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-slate-500 sm:px-6">
            {filter === "all"
              ? "No transactions yet — deposits, packages, profits, and withdrawals appear here."
              : filter === "deposit"
                ? "No deposits yet — use the Deposit page to add USDT."
                : filter === "withdraw"
                  ? "No withdrawals yet — use the Withdraw page to request a payout."
                  : filter === "package"
                    ? "No package activations yet — invest from the Packages page."
                    : filter === "earning"
                      ? "No daily profits yet — activate a VIP plan first."
                      : filter === "referral"
                        ? "No referral commissions yet — grow your team and their VIP purchases."
                        : "No transactions in this category yet."}
          </p>
        ) : null}
      </section>
    </div>
  );
}
