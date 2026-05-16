"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  DollarSign,
  Layers,
  PiggyBank,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import DashboardWalletCard from "@/components/dashboard/DashboardWalletCard";
import ReferralShareCard from "@/components/dashboard/ReferralShareCard";
import StatCard from "@/components/dashboard/StatCard";
import TeamLevelsOverview from "@/components/dashboard/TeamLevelsOverview";
import { DASH } from "@/components/dashboard/dashboard-ui";
import { formatUsd } from "@/lib/dashboard/format";
import { useAppSelector } from "@/store/hooks";

const EMPTY_STATS = {
  features: {
    totalBalance: 0,
    activePackage: "None",
    dailyEarnings: 0,
    referralEarnings: 0,
    teamCount: 0,
    depositSummary: { total: 0, count: 0, pending: 0 },
    withdrawalSummary: { total: 0, count: 0, pending: 0 },
  },
  cards: {
    currentBalance: 0,
    totalInvested: 0,
    totalWithdrawn: 0,
    totalProfit: 0,
    teamLevels: 0,
  },
  teamLevels: [],
};

function SummaryPanel({ title, icon: Icon, total, count, pending, href, accent = "accent" }) {
  const accentRing =
    accent === "emerald"
      ? "ring-emerald-500/20 border-emerald-500/20"
      : "ring-amber-500/20 border-amber-500/20";
  const iconBg =
    accent === "emerald" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400";

  return (
    <section className={`${DASH.card} ${accentRing}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white sm:text-base">{title}</h2>
            <p className="text-xs text-slate-500">Lifetime summary</p>
          </div>
        </div>
        {href ? (
          <Link
            href={href}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-solar-accent/40 hover:text-white"
          >
            View
          </Link>
        ) : null}
      </div>
      <p className="text-3xl font-bold tabular-nums text-solar-accent">{formatUsd(total)}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.05]">
          <dt className="text-slate-500">Transactions</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-white">{count}</dd>
        </div>
        <div className="rounded-lg bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.05]">
          <dt className="text-slate-500">Pending</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-white">{formatUsd(pending)}</dd>
        </div>
      </dl>
    </section>
  );
}

export default function DashboardOverview() {
  const user = useAppSelector((s) => s.auth.user);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/dashboard/stats", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.stats) setStats(data.stats);
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const f = stats.features;
  const c = stats.cards;

  return (
    <div className={DASH.wrap}>
      <div>
        <h1 className={DASH.h1}>Overview</h1>
        <p className={DASH.lead}>
          {user?.username
            ? `Welcome back, @${user.username} — your account at a glance.`
            : "Welcome back — here is your dashboard."}
          {loading ? " Updating…" : null}
        </p>
      </div>

      <DashboardWalletCard />
      <ReferralShareCard />

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
          Dashboard features
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Total balance"
            value={formatUsd(f.totalBalance)}
            icon={Wallet}
            highlight
          />
          <StatCard label="Active package" value={f.activePackage} icon={Layers} />
          <StatCard label="Daily earnings" value={formatUsd(f.dailyEarnings)} icon={TrendingUp} />
          <StatCard
            label="Referral earnings"
            value={formatUsd(f.referralEarnings)}
            icon={UserPlus}
          />
          <StatCard label="Team count" value={String(f.teamCount)} icon={Users} />
          <StatCard
            label="Deposit summary"
            value={formatUsd(f.depositSummary.total)}
            icon={ArrowDownToLine}
            sub={f.depositSummary.pending > 0 ? `${formatUsd(f.depositSummary.pending)} pending` : undefined}
          />
          <StatCard
            label="Withdrawal summary"
            value={formatUsd(f.withdrawalSummary.total)}
            icon={ArrowUpFromLine}
            sub={
              f.withdrawalSummary.pending > 0
                ? `${formatUsd(f.withdrawalSummary.pending)} pending`
                : undefined
            }
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
          Dashboard cards
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <StatCard label="Current balance" value={formatUsd(c.currentBalance)} icon={Wallet} />
          <StatCard label="Total invested" value={formatUsd(c.totalInvested)} icon={PiggyBank} />
          <StatCard
            label="Total withdrawn"
            value={formatUsd(c.totalWithdrawn)}
            icon={ArrowUpFromLine}
          />
          <StatCard label="Total profit" value={formatUsd(c.totalProfit)} icon={DollarSign} />
          <StatCard
            label="Team levels"
            value={String(c.teamLevels)}
            icon={Users}
            sub="Active levels"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SummaryPanel
          title="Deposit summary"
          icon={ArrowDownToLine}
          total={f.depositSummary.total}
          count={f.depositSummary.count}
          pending={f.depositSummary.pending}
          href="/dashboard/deposit"
          accent="emerald"
        />
        <SummaryPanel
          title="Withdrawal summary"
          icon={ArrowUpFromLine}
          total={f.withdrawalSummary.total}
          count={f.withdrawalSummary.count}
          pending={f.withdrawalSummary.pending}
          href="/dashboard/withdraw"
          accent="amber"
        />
      </div>

      <TeamLevelsOverview levels={stats.teamLevels} />

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/packages" className={DASH.btnSecondary}>
          Browse packages
        </Link>
        <Link href="/dashboard/team" className={DASH.btnSecondary}>
          View full team
        </Link>
        <Link href="/dashboard/history" className={DASH.btnSecondary}>
          Transaction history
        </Link>
      </div>
    </div>
  );
}
