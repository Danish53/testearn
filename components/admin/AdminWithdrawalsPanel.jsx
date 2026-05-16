"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Clock, Loader2, RefreshCw, X } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { ADMIN } from "@/components/admin/admin-ui";
import { formatUsd } from "@/lib/dashboard/format";

export default function AdminWithdrawalsPanel() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/withdraw", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load");
        return;
      }
      setList(data.withdrawals || []);
    } catch {
      setError("Could not load withdrawals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(withdrawalId, action) {
    setBusyId(withdrawalId);
    setMsg("");
    setError("");
    try {
      const res = await fetch("/api/admin/withdraw", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Action failed");
        return;
      }
      setMsg(data.message || "Done");
      await load();
    } catch {
      setError("Action failed");
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-solar-accent" aria-hidden />
        <p className="text-sm font-medium">Loading withdrawals…</p>
      </div>
    );
  }

  return (
    <div className={ADMIN.wrap}>
      <AdminPageHeader
        title="Withdrawal queue"
        description="Review and approve or reject pending USDT payout requests."
        badge={list.length > 0 ? `${list.length} pending` : "All clear"}
        action={
          <button type="button" onClick={load} className={ADMIN.btnGhost}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </button>
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

      {list.length === 0 ? (
        <div className={`${ADMIN.card} flex flex-col items-center py-14 text-center`}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25">
            <Check className="h-7 w-7" aria-hidden />
          </div>
          <p className="mt-4 text-lg font-semibold text-white">No pending withdrawals</p>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            New requests will appear here for approval.
          </p>
          <Link href="/admin" className={`${ADMIN.btnGhost} mt-6`}>
            Back to analytics
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((w) => (
            <li key={w.id} className={ADMIN.card}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                      <Clock className="h-3 w-3" aria-hidden />
                      Pending
                    </span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                      {w.network}
                    </span>
                  </div>
                  <p className="mt-3 text-xl font-bold tabular-nums text-white sm:text-2xl">
                    {formatUsd(w.amount)}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {w.username || w.email}
                    </span>
                    {" · "}
                    receives {formatUsd(w.receiveAmount)}
                  </p>
                  <p className="mt-3 break-all font-mono text-xs leading-relaxed text-slate-500">
                    {w.toAddress}
                  </p>
                  <p className="mt-2 text-xs text-slate-600">
                    {new Date(w.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col lg:min-w-[140px]">
                  <button
                    type="button"
                    disabled={busyId === w.id}
                    onClick={() => act(w.id, "approve")}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/20 px-4 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-500/30 transition hover:bg-emerald-500/30 disabled:opacity-50"
                  >
                    {busyId === w.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busyId === w.id}
                    onClick={() => act(w.id, "reject")}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/15 px-4 text-sm font-semibold text-red-300 ring-1 ring-red-500/25 transition hover:bg-red-500/25 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
