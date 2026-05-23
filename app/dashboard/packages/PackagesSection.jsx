"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Crown,
  DollarSign,
  Loader2,
  Package,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PACKAGES } from "@/components/dashboard/packages-data";
import { DASH } from "@/components/dashboard/dashboard-ui";
import ProfitCountdown from "@/components/dashboard/ProfitCountdown";
import { setUser } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function formatUsd(amount) {
  return `$${amount.toLocaleString("en-US")}`;
}

/* Referral commission UI — hidden per product request
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
*/

function PackageCard({ pkg, busy, balance, onBuy }) {
  const canAfford = balance >= pkg.investment;

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
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
        {/* Referral commission — commented out
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Users className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Referral commission
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <CommissionPill label="Direct" value={pkg.directPercent} variant="direct" />
          <CommissionPill label="Indirect" value={pkg.indirectPercent} variant="indirect" />
        </div>
        */}

        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-solar-accent" strokeWidth={2} />
            Deducted from wallet balance instantly
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-solar-accent" strokeWidth={2} />
            Profit every 24h — credited to wallet balance
          </li>
        </ul>

        <button
          type="button"
          disabled={busy || !canAfford}
          onClick={onBuy}
          className={`mt-5 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
            pkg.popular
              ? "bg-gradient-to-r from-solar-accent to-solar-accent-strong text-solar-foreground-on-accent shadow-solar-accent/30 hover:brightness-110"
              : "border border-white/15 bg-white/[0.08] text-white hover:border-solar-accent/40 hover:bg-solar-accent/15"
          }`}
        >
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Activating…
            </span>
          ) : !canAfford ? (
            "Insufficient balance"
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
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [busyId, setBusyId] = useState(null);
  const [active, setActive] = useState([]);
  const [profitMsg, setProfitMsg] = useState("");
  const [error, setError] = useState("");

  const balance = user?.balance ?? 0;

  const loadActive = useCallback(async () => {
    try {
      const res = await fetch("/api/investment/active", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setActive(data.investments || []);
    } catch {
      /* ignore */
    }
  }, []);

  const runAccrue = useCallback(async () => {
    try {
      const res = await fetch("/api/investment/accrue", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.user) dispatch(setUser(data.user));
      if (data.credited > 0) setProfitMsg(data.message);
      await loadActive();
    } catch {
      /* ignore */
    }
  }, [dispatch, loadActive]);

  useEffect(() => {
    if (!user?.isVerified) return;
    void loadActive();
    void runAccrue();
  }, [user?.isVerified, loadActive, runAccrue]);

  async function handleBuy(packageId) {
    setError("");
    setBusyId(packageId);
    try {
      const res = await fetch("/api/investment/purchase", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Purchase failed");
        return;
      }
      if (data.user) dispatch(setUser(data.user));
      setProfitMsg(data.message);
      await loadActive();
    } catch {
      setError("Could not activate package");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={DASH.wrap}>
      <div>
        <h1 className={DASH.h1}>VIP Packages</h1>
        <p className={DASH.lead}>
          Deposit USDT, buy a plan (balance deducted), and get your first daily profit instantly.
          After that, earn every 24 hours — the timer shows time until the next payout.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={DASH.card}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Wallet balance
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-solar-accent">
            {formatUsd(balance)}
          </p>
        </div>
        <div className={DASH.card}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Active package
          </p>
          <p className="mt-1 text-xl font-bold text-white">{user?.activePackage || "None"}</p>
          <p className="mt-1 text-sm text-solar-accent">
            Est. daily: {formatUsd(user?.dailyEarnings ?? 0)}
          </p>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {profitMsg ? (
        <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {profitMsg}
        </p>
      ) : null}

      {active.length > 0 ? (
        <section className={DASH.card}>
          <h2 className="text-sm font-semibold text-white">Active investments</h2>
          <ul className="mt-3 space-y-2">
            {active.map((inv) => (
              <li
                key={inv.id}
                className="grid gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-medium text-white">{inv.packageName}</p>
                  <p className="mt-0.5 text-sm text-solar-accent tabular-nums">
                    +{formatUsd(inv.dailyProfit)}/cycle · paid {formatUsd(inv.totalProfitPaid)}
                  </p>
                </div>
                <ProfitCountdown
                  nextProfitAt={inv.nextProfitAt}
                  profitDue={inv.profitDue}
                  secondsRemaining={inv.secondsRemaining}
                  dailyProfit={inv.dailyProfit}
                  onDue={() => void runAccrue()}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={`relative ${DASH.card} overflow-hidden`}>
        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-solar-accent/20 text-solar-accent ring-1 ring-solar-accent/30">
              <Package className="h-5 w-5" strokeWidth={2} aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">9 VIP plans</p>
              <p className="mt-0.5 text-xs text-slate-400">
                From {formatUsd(3)} to {formatUsd(19683)}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-solar-accent/20 text-solar-accent ring-1 ring-solar-accent/30">
              <TrendingUp className="h-5 w-5" strokeWidth={2} aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Daily earning</p>
              <p className="mt-0.5 text-xs text-slate-400">Every 24h after activation or last payout</p>
            </div>
          </div>
          {/* Referral bonus — commented out
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/25">
              <GitBranch className="h-5 w-5" strokeWidth={2} aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Referral bonus</p>
              <p className="mt-0.5 text-xs text-slate-400">Direct commission on each purchase</p>
            </div>
          </div>
          */}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {PACKAGES.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            balance={balance}
            busy={busyId === pkg.id}
            onBuy={() => void handleBuy(pkg.id)}
          />
        ))}
      </div>
    </div>
  );
}
