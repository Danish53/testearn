"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpFromLine,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { ADMIN } from "@/components/admin/admin-ui";
import { formatUsd } from "@/lib/dashboard/format";

const TABS = [
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

function networkHint(network) {
  if (network === "trc20") {
    return "Send USDT on Tron (TRC20) from your admin wallet. User address starts with T.";
  }
  return "Send USDT on BSC (BEP20) from your admin wallet. User address starts with 0x.";
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
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
      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-400 hover:text-white"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {label}
    </button>
  );
}

function ApproveModal({ withdrawal, onClose, onDone }) {
  const [txHash, setTxHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/withdraw", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawalId: withdrawal.id,
          action: "approve",
          txHash: txHash.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Approval failed");
        return;
      }
      onDone(data.message);
      onClose();
    } catch {
      setError("Approval failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0b1018] p-5 shadow-2xl sm:rounded-2xl">
        <h2 className="text-lg font-bold text-white">Approve manual payout</h2>
        <p className="mt-1 text-sm text-slate-400">
          Send <span className="font-semibold text-solar-accent">{formatUsd(withdrawal.receiveAmount)}</span>{" "}
          on <span className="uppercase">{withdrawal.networkLabel}</span>, then confirm.
        </p>

        <div className="mt-4 space-y-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100/90">
          <p className="font-semibold text-amber-200">Step 1 — Send from your wallet</p>
          <p className="text-xs leading-relaxed">{networkHint(withdrawal.network)}</p>
          <p className="break-all font-mono text-xs text-white">{withdrawal.toAddress}</p>
          <CopyButton text={withdrawal.toAddress} label="Copy address" />
        </div>

        <div className={`${ADMIN.cardInset} mt-4 text-sm`}>
          <p className="text-slate-500">User</p>
          <p className="font-semibold text-white">@{withdrawal.username}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-slate-500">Requested</dt>
              <dd className="text-white">{formatUsd(withdrawal.amount)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Send exactly</dt>
              <dd className="font-bold text-solar-accent">{formatUsd(withdrawal.receiveAmount)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Fee</dt>
              <dd className="text-slate-400">{formatUsd(withdrawal.fee)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Network</dt>
              <dd className="uppercase text-white">{withdrawal.network}</dd>
            </div>
          </dl>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className={ADMIN.label}>Step 2 — Transaction hash (optional)</label>
            <input
              className={`${ADMIN.input} font-mono text-xs`}
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Paste tx hash after sending"
            />
          </div>
          <p className="text-xs text-slate-500">
            On approve, <strong className="text-white">${withdrawal.amount.toFixed(2)}</strong> is
            deducted from the user&apos;s platform balance.
          </p>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={`${ADMIN.btnGhost} flex-1`}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className={`${ADMIN.btnPrimary} flex-1`}>
              {busy ? "Approving…" : "I sent USDT — Approve"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminWithdrawalsPanel() {
  const [list, setList] = useState([]);
  const [tab, setTab] = useState("pending");
  const [pendingCount, setPendingCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [approveTarget, setApproveTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        status: tab,
        page: String(pagination.page),
        limit: "15",
      });
      const res = await fetch(`/api/admin/withdraw?${params}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load");
        return;
      }
      setList(data.withdrawals || []);
      setPendingCount(data.pendingCount ?? 0);
      setPagination(data.pagination || { page: 1, pages: 1 });
    } catch {
      setError("Could not load withdrawals");
    } finally {
      setLoading(false);
    }
  }, [tab, pagination.page]);

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function reject(withdrawalId) {
    const reason = window.prompt("Rejection reason (optional):") || "";
    setBusyId(withdrawalId);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/withdraw", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, action: "reject", reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Reject failed");
        return;
      }
      setMsg(data.message || "Rejected");
      await load();
    } catch {
      setError("Reject failed");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className={ADMIN.wrap}>
      <AdminPageHeader
        title="Withdrawal management"
        description="Users submit amount, network (BEP20/TRC20), and external address. You send USDT manually, then approve — balance is deducted on approval."
        badge={pendingCount > 0 ? `${pendingCount} awaiting payout` : "Queue clear"}
        action={
          <button type="button" onClick={load} className={ADMIN.btnGhost}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </button>
        }
      />

      <div className={`${ADMIN.card} flex flex-wrap gap-2`}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              tab === t.id
                ? "bg-solar-accent text-solar-foreground-on-accent"
                : "border border-white/10 bg-white/5 text-slate-400"
            }`}
          >
            {t.label}
            {t.id === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
          </button>
        ))}
      </div>

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

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-solar-accent" />
        </div>
      ) : list.length === 0 ? (
        <div className={`${ADMIN.card} flex flex-col items-center py-14 text-center`}>
          <ArrowUpFromLine className="h-12 w-12 text-slate-600" aria-hidden />
          <p className="mt-4 font-semibold text-white">No withdrawals in this tab</p>
          <Link href="/admin/users" className={`${ADMIN.btnGhost} mt-6`}>
            View users
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {list.map((w) => (
              <li key={w.id} className={ADMIN.card}>
                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {w.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      ) : w.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                          {w.status}
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        {w.networkLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      @{w.username} · <span className="text-slate-500">{w.email}</span>
                    </p>
                    <p className="mt-3 text-2xl font-bold text-white">
                      Send {formatUsd(w.receiveAmount)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Request {formatUsd(w.amount)} (fee {formatUsd(w.fee)})
                    </p>
                    <p className="mt-3 break-all rounded-lg bg-black/30 p-3 font-mono text-xs text-slate-300 ring-1 ring-white/10">
                      {w.toAddress}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <CopyButton text={w.toAddress} label="Copy address" />
                      <CopyButton text={String(w.receiveAmount)} label="Copy amount" />
                    </div>
                    {w.txHash ? (
                      <p className="mt-2 font-mono text-xs text-emerald-400/80">Tx: {w.txHash}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-slate-600">
                      {new Date(w.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {w.status === "pending" ? (
                    <div className="flex shrink-0 flex-col gap-2 sm:min-w-[160px]">
                      <button
                        type="button"
                        onClick={() => setApproveTarget(w)}
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Send & approve
                      </button>
                      <button
                        type="button"
                        disabled={busyId === w.id}
                        onClick={() => reject(w.id)}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 text-sm font-semibold text-red-300 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
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

      {approveTarget ? (
        <ApproveModal
          withdrawal={approveTarget}
          onClose={() => setApproveTarget(null)}
          onDone={(m) => {
            setMsg(m);
            load();
          }}
        />
      ) : null}
    </div>
  );
}
