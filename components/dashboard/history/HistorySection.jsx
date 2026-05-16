"use client";

import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { DEMO_TRANSACTIONS } from "@/components/dashboard/demo-data";
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

function formatAmount(amount) {
  const sign = amount >= 0 ? "+" : "";
  return `${sign}$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default function HistorySection() {
  const [filter, setFilter] = useState("all");

  const rows = useMemo(() => {
    if (filter === "all") return DEMO_TRANSACTIONS;
    return DEMO_TRANSACTIONS.filter((t) => t.type === filter);
  }, [filter]);

  return (
    <div className={DASH.wrap}>
      <PageHeader
        icon={History}
        title="Transaction history"
        lead="Deposits, withdrawals, VIP activations, daily profits, and referral commissions in one ledger."
      />

      <div className="flex flex-wrap gap-2">
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
      </div>

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
              {rows.map((tx) => (
                <tr key={tx.id} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-4 py-3 sm:px-6">
                    <p className="font-medium text-white">{tx.date}</p>
                    <p className="text-xs text-slate-500">{tx.time}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{tx.label}</p>
                    <p className="font-mono text-xs text-slate-500">{tx.txHash}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 sm:table-cell">{tx.network}</td>
                  <td
                    className={`px-4 py-3 text-right font-semibold tabular-nums ${
                      tx.amount >= 0 ? "text-emerald-400" : "text-slate-300"
                    }`}
                  >
                    {formatAmount(tx.amount)}
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <StatusBadge status={tx.status} tone={txStatusTone(tx.status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-slate-500 sm:px-6">
            No transactions in this category.
          </p>
        ) : null}
      </section>
    </div>
  );
}
