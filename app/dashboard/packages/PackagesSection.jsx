"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Crown,
  DollarSign,
  GitBranch,
  Package,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { PACKAGES } from "@/components/dashboard/packages-data";
import { DASH } from "@/components/dashboard/dashboard-ui";

function formatUsd(amount) {
  return `$${amount.toLocaleString("en-US")}`;
}

function CommissionPill({ label, value, variant }) {
  const styles =
    variant === "direct"
      ? "border-solar-accent/35 bg-solar-accent/15 text-solar-accent"
      : "border-violet-400/30 bg-violet-500/10 text-violet-300";

  return (
    <div
      className={`flex flex-col items-center rounded-xl border px-3 py-2.5 text-center sm:px-4 sm:py-3 ${styles}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[11px]">
        {label}
      </span>
      <span className="mt-0.5 text-lg font-bold tabular-nums sm:text-xl">{value}%</span>
    </div>
  );
}

function PackageCard({ pkg, busy, onBuy }) {
  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-[#0b1018]/90 shadow-xl shadow-black/40 ring-1 backdrop-blur-md ${
        pkg.popular
          ? "border-solar-accent/40 ring-solar-accent/20"
          : "border-white/[0.08] ring-white/[0.04]"
      }`}
    >
      {pkg.popular ? (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-solar-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-solar-foreground-on-accent shadow-lg shadow-solar-accent/30">
          <Sparkles className="h-3 w-3" strokeWidth={2.5} aria-hidden />
          Popular
        </div>
      ) : null}

      <div className="border-b border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/25">
            <Crown className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            VIP
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Level {pkg.level}
          </span>
        </div>
        <h2 className="mt-2 text-lg font-bold text-white sm:text-xl">{pkg.name}</h2>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <DollarSign className="h-3 w-3" aria-hidden />
              Investment
            </p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-white sm:text-xl">
              {formatUsd(pkg.investment)}
            </p>
          </div>
          <div className="rounded-xl border border-solar-accent/25 bg-solar-accent/10 px-3 py-2.5 ring-1 ring-solar-accent/15">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-solar-accent">
              <TrendingUp className="h-3 w-3" aria-hidden />
              Daily
            </p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-solar-accent sm:text-xl">
              {formatUsd(pkg.dailyProfit)}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-solar-accent/20 bg-gradient-to-br from-solar-accent/15 via-solar-accent/8 to-transparent p-3.5 ring-1 ring-solar-accent/10 sm:p-4">
          <p className="text-center text-[11px] font-medium text-slate-400">
            <span className="font-bold text-white">{formatUsd(pkg.investment)}</span>
            {" investment · "}
            <span className="font-bold text-solar-accent">{formatUsd(pkg.dailyProfit)}</span>
            {" daily"}
          </p>
          <p className="mt-1.5 text-center text-[10px] text-slate-500">
            ~33.33% return per day · credited to balance
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Users className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Referral commission
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <CommissionPill label="Direct" value={pkg.directPercent} variant="direct" />
          <CommissionPill label="Indirect" value={pkg.indirectPercent} variant="indirect" />
        </div>

        <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-sm text-slate-400">
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-solar-accent" strokeWidth={2} />
            Earn {formatUsd(pkg.dailyProfit)} every day on this plan
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-solar-accent" strokeWidth={2} />
            Direct: {pkg.directPercent}% · Indirect: {pkg.indirectPercent}%
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-solar-accent" strokeWidth={2} />
            Activated from wallet balance (USDT)
          </li>
        </ul>

        <button
          type="button"
          disabled={busy}
          onClick={onBuy}
          className={`mt-5 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-lg transition disabled:opacity-60 ${
            pkg.popular
              ? "bg-gradient-to-r from-solar-accent to-solar-accent-strong text-solar-foreground-on-accent shadow-solar-accent/30 hover:brightness-110"
              : "border border-white/15 bg-white/[0.08] text-white hover:border-solar-accent/40 hover:bg-solar-accent/15"
          }`}
        >
          {busy ? (
            "Processing…"
          ) : (
            <>
              Activate {pkg.shortName}
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export default function PackagesSection() {
  const [busyId, setBusyId] = useState(null);

  function handleBuy(id) {
    setBusyId(id);
    window.setTimeout(() => setBusyId(null), 900);
  }

  return (
    <div className={DASH.wrap}>
      <div>
        <h1 className={DASH.h1}>VIP Packages</h1>
        <p className={DASH.lead}>
          Nine investment tiers — each level triples the plan. Daily profit is one-third of your
          investment (e.g. {formatUsd(3)} → {formatUsd(1)} per day). Build your team for direct and
          indirect commissions.
        </p>
      </div>

      <section className={`relative ${DASH.card} overflow-hidden`}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,color-mix(in_srgb,var(--solar-accent)_18%,transparent),transparent_55%)]"
          aria-hidden
        />
        <div className="relative grid gap-5 sm:grid-cols-3">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-solar-accent/20 text-solar-accent ring-1 ring-solar-accent/30">
              <Package className="h-5 w-5" strokeWidth={2} aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">9 VIP plans</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                From {formatUsd(3)} to {formatUsd(19683)} — scale as your balance grows.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-solar-accent/20 text-solar-accent ring-1 ring-solar-accent/30">
              <TrendingUp className="h-5 w-5" strokeWidth={2} aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Daily earning</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                Fixed daily payout per tier (⅓ of investment each day).
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/25">
              <GitBranch className="h-5 w-5" strokeWidth={2} aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Team levels</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                Direct and indirect referral bonuses on every package purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {PACKAGES.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            busy={busyId === pkg.id}
            onBuy={() => handleBuy(pkg.id)}
          />
        ))}
      </div>

      <p className="text-center text-xs text-slate-500">
        Demo UI — connect admin panel &amp; wallet API for live purchases and payouts.
      </p>
    </div>
  );
}
