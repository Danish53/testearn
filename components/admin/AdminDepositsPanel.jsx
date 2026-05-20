"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownToLine,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { ADMIN } from "@/components/admin/admin-ui";
import { formatCount, formatUsd } from "@/lib/dashboard/format";
import { MIN_DEPOSIT_USDT } from "@/lib/deposit/constants";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "credited", label: "Credited" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "below_minimum", label: "Below min" },
  { id: "failed", label: "Failed" },
];

const NETWORK_FILTERS = [
  { id: "all", label: "All nets" },
  { id: "bep20", label: "BEP20" },
  { id: "trc20", label: "TRC20" },
];

function shortHash(hash) {
  if (!hash) return "—";
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

function StatusBadge({ status, label }) {
  const styles = {
    credited: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
    pending: "border-amber-500/35 bg-amber-500/10 text-amber-300",
    confirmed: "border-sky-500/35 bg-sky-500/10 text-sky-300",
    below_minimum: "border-red-500/35 bg-red-500/10 text-red-300",
    failed: "border-red-500/35 bg-red-500/10 text-red-300",
  };
  const icons = {
    credited: CheckCircle2,
    pending: Clock,
    confirmed: Loader2,
    below_minimum: XCircle,
    failed: XCircle,
  };
  const Icon = icons[status] || Clock;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${styles[status] || styles.pending}`}
    >
      <Icon className={`h-3 w-3 ${status === "confirmed" ? "" : ""}`} aria-hidden />
      {label || status}
    </span>
  );
}

function CopyTx({ hash }) {
  const [copied, setCopied] = useState(false);
  if (!hash) return <span className="text-slate-500">—</span>;

  async function copy() {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 font-mono text-xs text-slate-400 hover:text-solar-accent"
      title={hash}
    >
      {shortHash(hash)}
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function DepositDetail({ deposit, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0a0f18] shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-solar-accent">Deposit</p>
            <p className="text-lg font-bold text-white">{formatUsd(deposit.amount)}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 text-sm">
          <StatusBadge status={deposit.status} label={deposit.statusLabel} />
          <div className={ADMIN.cardInset}>
            <p className="text-xs text-slate-500">User</p>
            <p className="font-semibold text-white">@{deposit.username}</p>
            <p className="text-xs text-slate-500">{deposit.email}</p>
          </div>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-slate-500">Network</dt>
              <dd className="font-semibold uppercase text-white">{deposit.networkLabel}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Transaction hash</dt>
              <dd className="mt-1 break-all font-mono text-xs text-slate-300">{deposit.txHash}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">To (user wallet)</dt>
              <dd className="mt-1 break-all font-mono text-xs text-slate-400">{deposit.toAddress}</dd>
            </div>
            {deposit.fromAddress ? (
              <div>
                <dt className="text-xs text-slate-500">From</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-400">{deposit.fromAddress}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs text-slate-500">Confirmations</dt>
              <dd className="text-white">{deposit.confirmations}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Detected</dt>
              <dd className="text-slate-400">{new Date(deposit.createdAt).toLocaleString()}</dd>
            </div>
            {deposit.creditedAt ? (
              <div>
                <dt className="text-xs text-slate-500">Credited to balance</dt>
                <dd className="text-emerald-400">{new Date(deposit.creditedAt).toLocaleString()}</dd>
              </div>
            ) : null}
          </dl>
          {deposit.status === "credited" ? (
            <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
              This amount was added to the user&apos;s platform balance automatically.
            </p>
          ) : deposit.status === "below_minimum" ? (
            <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {`Under $${MIN_DEPOSIT_USDT} minimum — not credited. User must send at least $${MIN_DEPOSIT_USDT} USDT.`}
            </p>
          ) : deposit.status === "pending" ? (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Waiting for blockchain confirmations before balance credit.
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

export default function AdminDepositsPanel() {
  const [deposits, setDeposits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [network, setNetwork] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        q: search,
        status,
        network,
        page: String(pagination.page),
        limit: "20",
      });
      const res = await fetch(`/api/admin/deposits?${params}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load deposits");
        return;
      }
      setDeposits(data.deposits || []);
      setSummary(data.summary || null);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      setError("Could not load deposits");
    } finally {
      setLoading(false);
    }
  }, [search, status, network, pagination.page]);

  useEffect(() => {
    const t = window.setTimeout(() => setSearch(q.trim()), 350);
    return () => window.clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [search, status, network]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={ADMIN.wrap}>
      <AdminPageHeader
        title="Deposit history"
        description="All USDT deposits detected on user wallets — credited, pending, or below minimum."
        badge={pagination.total ? `${formatCount(pagination.total)} records` : null}
        action={
          <button type="button" onClick={load} className={ADMIN.btnGhost}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </button>
        }
      />

      {summary ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`${ADMIN.card} border-emerald-500/20`}>
            <p className="text-xs text-slate-500">Credited (total)</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">
              {formatUsd(summary.credited?.totalUsd)}
            </p>
            <p className="text-xs text-slate-600">{formatCount(summary.credited?.count)} deposits</p>
          </div>
          <div className={ADMIN.card}>
            <p className="text-xs text-slate-500">Last 24h credited</p>
            <p className="mt-1 text-xl font-bold text-solar-accent">
              {formatUsd(summary.last24hCreditedUsd)}
            </p>
            <p className="text-xs text-slate-600">{formatCount(summary.last24hCreditedCount)} deposits</p>
          </div>
          <div className={`${ADMIN.card} border-amber-500/20`}>
            <p className="text-xs text-slate-500">Pending</p>
            <p className="mt-1 text-xl font-bold text-amber-300">{formatCount(summary.pending?.count)}</p>
            <p className="text-xs text-slate-600">{formatUsd(summary.pending?.totalUsd)} detected</p>
          </div>
          <div className={`${ADMIN.card} border-red-500/20`}>
            <p className="text-xs text-slate-500">{`Below $${MIN_DEPOSIT_USDT} min`}</p>
            <p className="mt-1 text-xl font-bold text-red-300">
              {formatCount(summary.below_minimum?.count)}
            </p>
            <p className="text-xs text-slate-600">Not credited</p>
          </div>
        </div>
      ) : null}

      <div className={`${ADMIN.card} space-y-4`}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Tx hash, wallet, username, email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={`${ADMIN.input} pl-10`}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatus(f.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  status === f.id
                    ? "bg-solar-accent text-solar-foreground-on-accent"
                    : "border border-white/10 bg-white/5 text-slate-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {NETWORK_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setNetwork(f.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  network === f.id
                    ? "bg-white/15 text-white ring-1 ring-white/20"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-solar-accent" />
        </div>
      ) : deposits.length === 0 ? (
        <div className={`${ADMIN.card} py-14 text-center`}>
          <ArrowDownToLine className="mx-auto h-12 w-12 text-slate-600" aria-hidden />
          <p className="mt-4 font-semibold text-white">No deposits found</p>
          <p className="mt-1 text-sm text-slate-500">
            Deposits appear when users send USDT to their BEP20/TRC20 wallet and the system scans the
            blockchain.
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {deposits.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setSelected(d)}
                  className={`${ADMIN.card} w-full text-left`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white">@{d.username}</p>
                      <p className="text-xs text-slate-500">{d.networkLabel}</p>
                    </div>
                    <StatusBadge status={d.status} label={d.statusLabel} />
                  </div>
                  <p className="mt-2 text-lg font-bold text-solar-accent">{formatUsd(d.amount)}</p>
                  <p className="mt-1 font-mono text-xs text-slate-600">{shortHash(d.txHash)}</p>
                </button>
              </li>
            ))}
          </ul>

          <div className={`${ADMIN.card} hidden overflow-x-auto md:block`}>
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-3 font-semibold">User</th>
                  <th className="pb-3 pr-3 font-semibold">Amount</th>
                  <th className="pb-3 pr-3 font-semibold">Network</th>
                  <th className="pb-3 pr-3 font-semibold">Status</th>
                  <th className="pb-3 pr-3 font-semibold">Tx</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((d) => (
                  <tr
                    key={d.id}
                    className="cursor-pointer border-b border-white/5 transition hover:bg-white/[0.02]"
                    onClick={() => setSelected(d)}
                  >
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-white">@{d.username}</p>
                      <p className="text-xs text-slate-500">{d.email}</p>
                    </td>
                    <td className="py-3 pr-3 font-bold tabular-nums text-solar-accent">
                      {formatUsd(d.amount)}
                    </td>
                    <td className="py-3 pr-3 text-xs font-semibold uppercase text-slate-400">
                      {d.networkLabel}
                    </td>
                    <td className="py-3 pr-3">
                      <StatusBadge status={d.status} label={d.statusLabel} />
                    </td>
                    <td className="py-3 pr-3" onClick={(e) => e.stopPropagation()}>
                      <CopyTx hash={d.txHash} />
                    </td>
                    <td className="py-3 text-xs text-slate-500">
                      {new Date(d.creditedAt || d.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 ? (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 disabled:opacity-40"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 disabled:opacity-40"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {selected ? <DepositDetail deposit={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}
