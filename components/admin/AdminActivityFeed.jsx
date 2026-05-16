import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { ADMIN } from "@/components/admin/admin-ui";
import { formatUsd } from "@/lib/dashboard/format";

function shortHash(hash) {
  if (!hash) return "—";
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

function statusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "completed" || s === "credited") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (s === "pending") return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  return "border-white/10 bg-white/5 text-slate-400";
}

function ActivityCard({ row }) {
  const isDeposit = row.type === "deposit";
  const Icon = isDeposit ? ArrowDownToLine : ArrowUpFromLine;

  return (
    <li className={`${ADMIN.cardInset} flex gap-3`}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
          isDeposit
            ? "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25"
            : "bg-amber-500/15 text-amber-400 ring-amber-500/25"
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold capitalize text-white">{row.type}</p>
          <p className="text-sm font-bold tabular-nums text-solar-accent">{formatUsd(row.amount)}</p>
        </div>
        <p className="mt-0.5 truncate font-mono text-xs text-slate-400">{row.user}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
            {row.network}
          </span>
          <span
            className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${statusClass(row.status)}`}
          >
            {row.status}
          </span>
          <span className="font-mono text-[10px] text-slate-600">{shortHash(row.txHash)}</span>
        </div>
      </div>
    </li>
  );
}

export default function AdminActivityFeed({ activity }) {
  if (!activity?.length) {
    return (
      <p className="rounded-xl border border-dashed border-white/15 py-12 text-center text-sm text-slate-500">
        No on-chain activity yet
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {activity.map((row) => (
          <ActivityCard key={`${row.type}-${row.id}`} row={row} />
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
              <th className="pb-3 pr-4 font-semibold">Type</th>
              <th className="pb-3 pr-4 font-semibold">User</th>
              <th className="pb-3 pr-4 font-semibold">Network</th>
              <th className="pb-3 pr-4 font-semibold">Amount</th>
              <th className="pb-3 pr-4 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Tx</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((row) => (
              <tr
                key={`${row.type}-${row.id}-t`}
                className="border-b border-white/5 transition hover:bg-white/[0.02]"
              >
                <td className="py-3.5 pr-4 capitalize text-slate-200">{row.type}</td>
                <td className="max-w-[140px] truncate py-3.5 pr-4 font-mono text-xs text-white">
                  {row.user}
                </td>
                <td className="py-3.5 pr-4 text-xs font-semibold uppercase text-slate-400">
                  {row.network}
                </td>
                <td className="py-3.5 pr-4 tabular-nums font-semibold text-solar-accent">
                  {formatUsd(row.amount)}
                </td>
                <td className="py-3.5 pr-4">
                  <span
                    className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${statusClass(row.status)}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-3.5 font-mono text-xs text-slate-500">{shortHash(row.txHash)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
