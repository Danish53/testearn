"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import CopyField from "@/components/dashboard/CopyField";
import AdminRecoveryPhrase from "@/components/admin/AdminRecoveryPhrase";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { ADMIN } from "@/components/admin/admin-ui";
import { formatCount, formatUsd } from "@/lib/dashboard/format";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "blocked", label: "Blocked" },
  { id: "unverified", label: "Unverified" },
];

function StatusBadge({ user }) {
  if (user.isBlocked) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/35 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-red-300">
        <Ban className="h-3 w-3" aria-hidden />
        Blocked
      </span>
    );
  }
  if (!user.isVerified) {
    return (
      <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
        Unverified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
      <CheckCircle2 className="h-3 w-3" aria-hidden />
      Active
    </span>
  );
}

function UserDetailDrawer({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    isVerified: user.isVerified,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setForm({
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
    });
    setError("");
    setMsg("");
  }, [user]);

  async function patch(body) {
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Update failed");
        return;
      }
      setMsg(data.message || "Saved");
      onSaved(data.user);
    } catch {
      setError("Update failed");
    } finally {
      setBusy(false);
    }
  }

  function handleSave(e) {
    e.preventDefault();
    patch({
      username: form.username.trim(),
      email: form.email.trim(),
      isVerified: form.isVerified,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-[#0a0f18] shadow-2xl sm:max-w-md">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-solar-accent">
              User account
            </p>
            <h2 className="truncate text-lg font-bold text-white">@{user.username}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <StatusBadge user={user} />
            <span className="font-mono text-xs text-slate-500">{user.referralCode}</span>
          </div>

          <section className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Wallet className="h-4 w-4 text-solar-accent" aria-hidden />
              Balances
            </h3>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                ["Balance", formatUsd(user.balance)],
                ["Deposited", formatUsd(user.totalDeposited)],
                ["Withdrawn", formatUsd(user.totalWithdrawn)],
                ["Invested", formatUsd(user.totalInvested)],
                ["Profit", formatUsd(user.totalProfit)],
                ["Referral", formatUsd(user.referralEarnings)],
              ].map(([label, val]) => (
                <div key={label} className={ADMIN.cardInset}>
                  <dt className="text-[10px] font-semibold uppercase text-slate-500">{label}</dt>
                  <dd className="mt-1 text-sm font-bold tabular-nums text-solar-accent">{val}</dd>
                </div>
              ))}
            </dl>
            {user.activePackage ? (
              <p className="mt-3 text-xs text-slate-500">
                Package: <span className="font-semibold text-amber-300">{user.activePackage}</span>
                {user.dailyEarnings > 0 ? ` · $${user.dailyEarnings}/day` : ""}
              </p>
            ) : null}
          </section>

          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-white">Deposit wallets</h3>
            {user.wallet?.hasWallet ? (
              <div className="space-y-3">
                <CopyField label="BEP20 (BSC)" value={user.wallet.bep20Address} />
                <CopyField label="TRC20 (Tron)" value={user.wallet.trc20Address} />
                {user.wallet.walletCreatedAt ? (
                  <p className="text-xs text-slate-600">
                    Created {new Date(user.wallet.walletCreatedAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No wallet provisioned yet.</p>
            )}
          </section>

          {user.wallet?.hasWallet ? <AdminRecoveryPhrase userId={user.id} /> : null}

          <section className={`${ADMIN.card} mb-6`}>
            <h3 className="mb-4 text-sm font-semibold text-white">Edit account</h3>
            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className={ADMIN.label}>Username</label>
                <input
                  className={ADMIN.input}
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      username: e.target.value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
                    }))
                  }
                />
              </div>
              <div>
                <label className={ADMIN.label}>Email</label>
                <input
                  type="email"
                  className={ADMIN.input}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.isVerified}
                  onChange={(e) => setForm((f) => ({ ...f, isVerified: e.target.checked }))}
                  className="h-4 w-4 rounded border-white/20 accent-solar-accent"
                />
                <span className="text-sm text-slate-300">Email verified (can log in)</span>
              </label>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              {msg ? <p className="text-sm text-emerald-400">{msg}</p> : null}
              <button type="submit" disabled={busy} className={ADMIN.btnPrimary}>
                {busy ? "Saving…" : "Save changes"}
              </button>
            </form>
          </section>

          <section className="flex flex-col gap-2 sm:flex-row">
            {user.isBlocked ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => patch({ isBlocked: false })}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Unblock user
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => patch({ isBlocked: true })}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 text-sm font-semibold text-red-300 hover:bg-red-500/25 disabled:opacity-50"
              >
                <Ban className="h-4 w-4" aria-hidden />
                Block user
              </button>
            )}
          </section>

          <p className="mt-6 text-xs text-slate-600">
            Joined {new Date(user.createdAt).toLocaleString()}
            {user.referrer ? ` · Referred by @${user.referrer.username}` : ""}
          </p>
        </div>
      </aside>
    </div>
  );
}

export default function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
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
        page: String(pagination.page),
        limit: "15",
      });
      const res = await fetch(`/api/admin/users?${params}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load users");
        return;
      }
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      setError("Could not load users");
    } finally {
      setLoading(false);
    }
  }, [search, status, pagination.page]);

  useEffect(() => {
    const t = window.setTimeout(() => setSearch(q.trim()), 350);
    return () => window.clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [search, status]);

  useEffect(() => {
    load();
  }, [load]);

  function handleUserSaved(updated) {
    setSelected(updated);
    setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)));
  }

  return (
    <div className={ADMIN.wrap}>
      <AdminPageHeader
        title="User management"
        description="View members, balances, wallet addresses, edit accounts, and block or unblock access."
        badge={pagination.total ? `${formatCount(pagination.total)} users` : null}
        action={
          <button type="button" onClick={load} className={ADMIN.btnGhost}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </button>
        }
      />

      <div className={`${ADMIN.card} space-y-4`}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search email, username, referral code…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={`${ADMIN.input} pl-10`}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatus(f.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                status === f.id
                  ? "bg-solar-accent text-solar-foreground-on-accent shadow-md shadow-solar-accent/25"
                  : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
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
      ) : users.length === 0 ? (
        <div className={`${ADMIN.card} py-14 text-center`}>
          <UserRound className="mx-auto h-12 w-12 text-slate-600" aria-hidden />
          <p className="mt-4 font-semibold text-white">No users found</p>
          <p className="mt-1 text-sm text-slate-500">Try another search or filter.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {users.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => setSelected(u)}
                  className={`${ADMIN.card} w-full text-left transition hover:border-solar-accent/30`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">@{u.username}</p>
                      <p className="truncate text-xs text-slate-500">{u.email}</p>
                    </div>
                    <StatusBadge user={u} />
                  </div>
                  <p className="mt-3 text-lg font-bold tabular-nums text-solar-accent">
                    {formatUsd(u.balance)}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          <div className={`${ADMIN.card} hidden overflow-x-auto md:block`}>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">User</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 pr-4 font-semibold">Balance</th>
                  <th className="pb-3 pr-4 font-semibold">Deposited</th>
                  <th className="pb-3 pr-4 font-semibold">Package</th>
                  <th className="pb-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 transition hover:bg-white/[0.02]"
                  >
                    <td className="py-3.5 pr-4">
                      <p className="font-semibold text-white">@{u.username}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge user={u} />
                    </td>
                    <td className="py-3.5 pr-4 tabular-nums font-semibold text-solar-accent">
                      {formatUsd(u.balance)}
                    </td>
                    <td className="py-3.5 pr-4 tabular-nums text-slate-400">
                      {formatUsd(u.totalDeposited)}
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-slate-400">
                      {u.activePackage || "—"}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(u)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:border-solar-accent/40"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.pages} · {formatCount(pagination.total)}{" "}
                users
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {selected ? (
        <UserDetailDrawer
          user={selected}
          onClose={() => setSelected(null)}
          onSaved={handleUserSaved}
        />
      ) : null}
    </div>
  );
}
