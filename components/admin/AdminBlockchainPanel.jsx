"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Play,
  Radio,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { ADMIN } from "@/components/admin/admin-ui";
import { formatCount, formatUsd } from "@/lib/dashboard/format";

const TYPE_FILTERS = [
  { id: "all", label: "All" },
  { id: "deposit", label: "Deposits" },
  { id: "withdrawal", label: "Withdrawals" },
];

const STATUS_FILTERS = [
  { id: "all", label: "All status" },
  { id: "credited", label: "Credited" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
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

function statusStyle(status) {
  const s = String(status || "").toLowerCase();
  if (s === "credited" || s === "completed")
    return "border-emerald-500/35 bg-emerald-500/10 text-emerald-300";
  if (s === "pending" || s === "confirmed" || s === "processing")
    return "border-amber-500/35 bg-amber-500/10 text-amber-300";
  if (s === "failed" || s === "below_minimum" || s === "rejected")
    return "border-red-500/35 bg-red-500/10 text-red-300";
  return "border-white/10 bg-white/5 text-slate-400";
}

function HistoryDetail({ item, onClose }) {
  const isDeposit = item.type === "deposit";
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0a0f18] shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-solar-accent">
              {isDeposit ? "Deposit" : "Withdrawal"}
            </p>
            <p className="text-lg font-bold text-white">{formatUsd(item.amount)}</p>
          </div>
          <button type="button" onClick={onClose} className={ADMIN.btnIcon} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyle(item.status)}`}
          >
            {item.statusLabel || item.status}
          </span>
          <div>
            <p className="font-semibold text-white">@{item.username}</p>
            <p className="text-xs text-slate-500">{item.email}</p>
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Network</dt>
              <dd className="font-semibold uppercase text-white">{item.networkLabel}</dd>
            </div>
            {item.txHash ? (
              <div>
                <dt className="text-xs text-slate-500">Tx hash</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-300">{item.txHash}</dd>
              </div>
            ) : null}
            {item.toAddress ? (
              <div>
                <dt className="text-xs text-slate-500">{isDeposit ? "To" : "Payout"} address</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-400">{item.toAddress}</dd>
              </div>
            ) : null}
            {isDeposit && item.confirmations != null ? (
              <div>
                <dt className="text-xs text-slate-500">Confirmations</dt>
                <dd className="text-white">{item.confirmations}</dd>
              </div>
            ) : null}
            {!isDeposit && item.receiveAmount != null ? (
              <div>
                <dt className="text-xs text-slate-500">Receive amount</dt>
                <dd className="font-bold text-solar-accent">{formatUsd(item.receiveAmount)}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs text-slate-500">Date</dt>
              <dd className="text-slate-400">{new Date(item.at).toLocaleString()}</dd>
            </div>
          </dl>
          {item.failReason ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {item.failReason}
            </p>
          ) : null}
          {!isDeposit && item.status === "pending" ? (
            <Link href="/admin/withdrawals" className={ADMIN.btnPrimary}>
              Open withdrawals queue
            </Link>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

export default function AdminBlockchainPanel() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [monitor, setMonitor] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [network, setNetwork] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        type,
        status,
        network,
        page: String(page),
        limit: "25",
      });
      if (q.trim()) params.set("q", q.trim());

      const res = await fetch(`/api/admin/blockchain?${params}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load");
        return;
      }
      setItems(data.items || []);
      setSummary(data.summary);
      setMonitor(data.monitor);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      setError("Could not load blockchain history");
    } finally {
      setLoading(false);
    }
  }, [type, status, network, q, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function runMonitor() {
    setScanning(true);
    setMsg("");
    setError("");
    try {
      const res = await fetch("/api/admin/blockchain", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Scan failed");
        return;
      }
      setMsg(data.message || "Monitor completed");
      setMonitor(data.monitor);
      await load();
    } catch {
      setError("Monitor failed");
    } finally {
      setScanning(false);
    }
  }

  const lastRun = monitor?.lastRun;

  return (
    <div className={ADMIN.wrap}>
      <AdminPageHeader
        title="Blockchain monitoring"
        description="Full deposit & withdrawal history, auto listener, confirmation checks, and failed transaction handling."
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={load} disabled={loading} className={ADMIN.btnGhost}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Reload
            </button>
            <button
              type="button"
              onClick={runMonitor}
              disabled={scanning}
              className={ADMIN.btnPrimary}
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Scanning…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Run monitor
                </>
              )}
            </button>
          </div>
        }
      />

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {msg ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {msg}
        </p>
      ) : null}

      <section className={`${ADMIN.card} grid gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
        <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-solar-accent/15 text-solar-accent ring-1 ring-solar-accent/30">
            <Radio className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Transaction listener</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {monitor?.enabled
                ? "Auto monitoring enabled — schedule POST /api/cron/blockchain-monitor every 2–5 min."
                : "Monitoring disabled via BLOCKCHAIN_MONITOR_ENABLED=false"}
            </p>
            {lastRun ? (
              <p className="mt-2 text-xs text-slate-400">
                Last run:{" "}
                <span className={lastRun.status === "completed" ? "text-emerald-400" : "text-red-400"}>
                  {lastRun.status}
                </span>
                {" · "}
                {formatCount(lastRun.usersScanned)} wallets · {formatCount(lastRun.depositsCredited)}{" "}
                credited ({formatUsd(lastRun.creditedUsd)}) · {lastRun.durationMs}ms
                {" · "}
                {new Date(lastRun.createdAt).toLocaleString()}
              </p>
            ) : (
              <p className="mt-2 text-xs text-amber-400/90">No monitor run yet — click Run monitor.</p>
            )}
          </div>
        </div>

        <div className={ADMIN.cardInset}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Deposits</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {formatCount(summary?.deposits?.credited)}
          </p>
          <p className="text-xs text-slate-500">{formatUsd(summary?.deposits?.creditedUsd)} credited</p>
          <p className="mt-2 text-[10px] text-slate-600">
            {formatCount(summary?.deposits?.pending)} pending · {formatCount(summary?.deposits?.failed)}{" "}
            failed
          </p>
        </div>

        <div className={ADMIN.cardInset}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Withdrawals</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">
            {formatCount(summary?.withdrawals?.completed)}
          </p>
          <p className="text-xs text-slate-500">
            {formatUsd(summary?.withdrawals?.completedUsd)} paid out
          </p>
          <p className="mt-2 text-[10px] text-slate-600">
            {formatCount(summary?.withdrawals?.pending)} pending ·{" "}
            {formatCount(summary?.withdrawals?.failed)} failed
          </p>
        </div>

        <div className={`${ADMIN.cardInset} sm:col-span-2`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quick links</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href="/admin/deposits" className={ADMIN.btnGhost}>
              <ArrowDownToLine className="h-4 w-4" /> Deposits
            </Link>
            <Link href="/admin/withdrawals" className={ADMIN.btnGhost}>
              <ArrowUpFromLine className="h-4 w-4" /> Withdrawals
            </Link>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Tx hash, address, user…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className={`${ADMIN.input} pl-9`}
          />
        </div>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className={ADMIN.select}
        >
          {TYPE_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className={ADMIN.select}
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          value={network}
          onChange={(e) => {
            setNetwork(e.target.value);
            setPage(1);
          }}
          className={ADMIN.select}
        >
          {NETWORK_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-solar-accent" />
        </div>
      ) : items.length === 0 ? (
        <div className={`${ADMIN.card} py-16 text-center`}>
          <Clock className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-4 font-semibold text-white">No transactions found</p>
          <p className="mt-1 text-sm text-slate-500">Run the monitor to detect on-chain deposits.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {items.map((row) => {
              const Icon = row.type === "deposit" ? ArrowDownToLine : ArrowUpFromLine;
              return (
                <li key={`${row.type}-${row.id}`}>
                  <button
                    type="button"
                    onClick={() => setSelected(row)}
                    className={`${ADMIN.card} w-full text-left transition hover:border-solar-accent/30`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          row.type === "deposit"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2">
                          <p className="font-semibold capitalize text-white">{row.type}</p>
                          <p className="font-bold text-solar-accent">{formatUsd(row.amount)}</p>
                        </div>
                        <p className="truncate text-xs text-slate-500">@{row.username}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="text-[10px] uppercase text-slate-500">{row.networkLabel}</span>
                          <span
                            className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${statusStyle(row.status)}`}
                          >
                            {row.status}
                          </span>
                          <span className="font-mono text-[10px] text-slate-600">{shortHash(row.txHash)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className={`${ADMIN.card} hidden overflow-x-auto md:block`}>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Network</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Tx</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr
                    key={`${row.type}-${row.id}-t`}
                    onClick={() => setSelected(row)}
                    className="cursor-pointer border-b border-white/5 transition hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3 capitalize text-slate-200">{row.type}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">@{row.username}</p>
                      <p className="text-xs text-slate-500">{row.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold uppercase text-slate-400">
                      {row.networkLabel}
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums text-solar-accent">
                      {formatUsd(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyle(row.status)}`}
                      >
                        {row.status === "failed" ? (
                          <XCircle className="h-3 w-3" />
                        ) : null}
                        {row.statusLabel || row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{shortHash(row.txHash)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(row.at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.pages} · {formatCount(pagination.total)} total
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={ADMIN.btnGhost}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className={ADMIN.btnGhost}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {selected ? <HistoryDetail item={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}
