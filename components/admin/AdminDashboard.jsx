"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Layers,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import AdminActivityFeed from "@/components/admin/AdminActivityFeed";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { ADMIN } from "@/components/admin/admin-ui";
import { formatCount, formatUsd } from "@/lib/dashboard/format";

function RevenueTile({ label, value, tone }) {
  const colors = {
    emerald: "text-emerald-400",
    amber: "text-amber-300",
    accent: "text-solar-accent",
  };
  return (
    <div className={ADMIN.cardInset}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-xl font-bold tabular-nums sm:text-2xl ${colors[tone] || colors.accent}`}>
        {value}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/analytics", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Failed to load analytics");
        return;
      }
      setData(json.analytics);
    } catch {
      setError("Could not load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-solar-accent" aria-hidden />
        <p className="text-sm font-medium">Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={ADMIN.wrap}>
        <AdminPageHeader title="Analytics" description="Platform overview" />
        <div className={`${ADMIN.card} text-center`}>
          <p className="text-red-400">{error}</p>
          <button type="button" onClick={load} className={`${ADMIN.btnPrimary} mt-4`}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const a = data;
  const pendingBadge =
    a.withdrawals.pending > 0 ? `${a.withdrawals.pending} pending payouts` : null;

  return (
    <div className={ADMIN.wrap}>
      <AdminPageHeader
        title="Dashboard analytics"
        description="Live platform metrics — users, treasury flow, investments, and on-chain activity."
        badge={pendingBadge}
        action={
          <button type="button" onClick={load} className={ADMIN.btnGhost}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <AdminStatCard
          featured
          label="Verified users"
          value={formatCount(a.users.verified)}
          sub={`${formatCount(a.users.new24h)} joined in 24h · ${formatCount(a.users.total)} total accounts`}
          icon={Users}
        />
        <AdminStatCard
          label="Total deposits"
          value={formatUsd(a.deposits.totalUsd)}
          sub={`${formatCount(a.deposits.count)} credited · ${formatUsd(a.deposits.last24hUsd)} last 24h`}
          icon={ArrowDownToLine}
          tone="emerald"
        />
        <AdminStatCard
          label="Total withdrawals"
          value={formatUsd(a.withdrawals.totalUsd)}
          sub={`${formatCount(a.withdrawals.pending)} pending · ${formatUsd(a.withdrawals.last24hUsd)} last 24h`}
          icon={ArrowUpFromLine}
          tone="amber"
        />
        <AdminStatCard
          label="Total investments"
          value={formatUsd(a.investments.totalUsd)}
          sub={`${formatCount(a.investments.active)} active · ${formatUsd(a.investments.last7dUsd)} last 7d`}
          icon={Layers}
          tone="violet"
        />
      </section>

      <section className={ADMIN.card}>
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25">
            <TrendingUp className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className={ADMIN.sectionTitle}>Revenue statistics</h2>
            <p className={ADMIN.sectionLead}>Fees, liabilities, and net platform flow</p>
          </div>
        </div>
        <dl className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <RevenueTile
            label="Withdrawal fees collected"
            value={formatUsd(a.revenue.withdrawFeesUsd)}
            tone="emerald"
          />
          <RevenueTile
            label="User balances (liability)"
            value={formatUsd(a.revenue.userBalancesUsd)}
            tone="amber"
          />
          <RevenueTile
            label="Net inflow (deposits − withdrawals)"
            value={formatUsd(a.revenue.netInflowUsd)}
            tone="accent"
          />
        </dl>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`${ADMIN.card} flex items-center gap-4`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-solar-accent/15 text-solar-accent ring-1 ring-solar-accent/25">
            <ArrowDownToLine className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Deposits (24h)
            </p>
            <p className="text-xl font-bold tabular-nums text-white sm:text-2xl">
              {formatUsd(a.deposits.last24hUsd)}
            </p>
            <p className="text-xs text-slate-500">{formatCount(a.deposits.last24hCount)} transactions</p>
          </div>
        </div>
        <div className={`${ADMIN.card} flex items-center gap-4`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25">
            <ArrowUpFromLine className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Withdrawals (24h)
            </p>
            <p className="text-xl font-bold tabular-nums text-white sm:text-2xl">
              {formatUsd(a.withdrawals.last24hUsd)}
            </p>
            <p className="text-xs text-slate-500">
              {formatCount(a.withdrawals.last24hCount)} transactions
            </p>
          </div>
        </div>
      </div>

      <section className={ADMIN.card}>
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-solar-accent/15 text-solar-accent ring-1 ring-solar-accent/25">
            <Activity className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className={ADMIN.sectionTitle}>Blockchain activity</h2>
            <p className={ADMIN.sectionLead}>Recent deposits and withdrawals on-chain</p>
          </div>
        </div>
        <AdminActivityFeed activity={a.blockchain.activity} />
      </section>
    </div>
  );
}
