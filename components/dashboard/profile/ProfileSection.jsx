"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Shield,
  UserRound,
  Wallet,
} from "lucide-react";
import CopyField from "@/components/dashboard/CopyField";
import { DEMO_USER } from "@/components/dashboard/demo-data";
import { DASH } from "@/components/dashboard/dashboard-ui";
import PageHeader from "@/components/dashboard/PageHeader";

export default function ProfileSection() {
  const [showSeed, setShowSeed] = useState(false);
  const demoSeed =
    "abandon ability able about above absent absorb abstract absurd abuse access accident";

  return (
    <div className={DASH.wrap}>
      <PageHeader
        icon={UserRound}
        title="Profile & security"
        lead="Account details, wallet keys, and security settings. Seed phrase is shown once — store offline."
      />

      <div className={`flex flex-col items-center gap-6 sm:flex-row sm:items-start ${DASH.card}`}>
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-4 ring-solar-accent/30">
          <Image
            src={DEMO_USER.avatar}
            alt={DEMO_USER.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-xl font-semibold text-white">{DEMO_USER.name}</p>
          <p className="mt-1 text-sm text-slate-400">{DEMO_USER.email}</p>
          <p className="mt-3 text-xs text-slate-500">
            Member ID:{" "}
            <span className="font-mono font-semibold text-solar-accent">{DEMO_USER.memberId}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Active plan:{" "}
            <span className="font-semibold text-amber-300">{DEMO_USER.activePackage}</span>
            {" · "}
            Daily ${DEMO_USER.dailyEarning}/day
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={DASH.card}>
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-solar-accent" aria-hidden />
            <h2 className="text-sm font-semibold text-white">Your deposit wallets</h2>
          </div>
          <div className="space-y-4">
            <CopyField label="TRC20 (Tron)" value={DEMO_USER.wallets.trc20} />
            <CopyField label="BEP20 (BSC)" value={DEMO_USER.wallets.bep20} />
          </div>
        </div>

        <div className={DASH.card}>
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-amber-400" aria-hidden />
            <h2 className="text-sm font-semibold text-white">Recovery phrase (12 words)</h2>
          </div>
          <p className="mb-3 text-xs text-slate-500">
            Generated at signup. Never share — platform staff will never ask for it.
          </p>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
            <p
              className={`font-mono text-xs leading-relaxed text-amber-100/90 ${showSeed ? "" : "blur-md select-none"}`}
            >
              {demoSeed}
            </p>
            <button
              type="button"
              onClick={() => setShowSeed((s) => !s)}
              className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-amber-200"
            >
              {showSeed ? (
                <>
                  <EyeOff className="h-4 w-4" aria-hidden /> Hide phrase
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" aria-hidden /> Reveal phrase (demo)
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      <div className={DASH.card}>
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-solar-accent" aria-hidden />
          <h2 className="text-sm font-semibold text-white">Security</h2>
        </div>
        <form className="grid gap-4 sm:max-w-md" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="current-password" className={DASH.label}>
              Current password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="current-password"
                type="password"
                className={`${DASH.input} pl-10`}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label htmlFor="new-password" className={DASH.label}>
              New password
            </label>
            <input id="new-password" type="password" className={DASH.input} placeholder="••••••••" />
          </motion.div>
          <button type="submit" className={`${DASH.btnPrimary} sm:max-w-xs`}>
            Update password
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-500">
          2FA and active sessions — connect when auth API is ready.
        </p>
      </div>
    </motion.div>
  );
}
