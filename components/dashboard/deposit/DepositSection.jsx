"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  QrCode,
  Shield,
} from "lucide-react";
import CopyField from "@/components/dashboard/CopyField";
import { DEMO_USER } from "@/components/dashboard/demo-data";
import { DASH } from "@/components/dashboard/dashboard-ui";
import PageHeader from "@/components/dashboard/PageHeader";

const NETWORKS = [
  { id: "trc20", label: "TRC20", chain: "Tron", address: DEMO_USER.wallets.trc20 },
  { id: "bep20", label: "BEP20", chain: "BSC", address: DEMO_USER.wallets.bep20 },
];

const STEPS = [
  "Copy your unique deposit address below",
  "Send only USDT on the selected network",
  "Wait for blockchain confirmations (auto-detected)",
  "Balance updates in your dashboard",
];

export default function DepositSection() {
  const [network, setNetwork] = useState("trc20");
  const active = NETWORKS.find((n) => n.id === network) ?? NETWORKS[0];

  return (
    <div className={DASH.wrap}>
      <PageHeader
        icon={ArrowDownToLine}
        title="Deposit USDT"
        lead="Your personal wallet was created at registration. Send USDT from Trust Wallet, Binance, or any exchange — we monitor the chain and credit your balance automatically."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={`${DASH.card} sm:col-span-1`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Available balance
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-solar-accent">
            ${DEMO_USER.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-xs text-slate-500">USDT · withdrawable</p>
        </div>
        <div className={`${DASH.card} flex gap-3 sm:col-span-2`}>
          <Shield className="h-8 w-8 shrink-0 text-solar-accent" strokeWidth={1.75} aria-hidden />
          <div>
            <p className="text-sm font-semibold text-white">Auto wallet · encrypted keys</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Each account has a unique on-chain address. Deposits are scanned via TronWeb (TRC20)
              and ethers.js (BEP20). Never share your seed phrase with anyone.
            </p>
          </div>
        </div>
      </div>

      <div className={DASH.card}>
        <p className="mb-3 text-sm font-semibold text-white">Select network</p>
        <div className="flex flex-wrap gap-2">
          {NETWORKS.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setNetwork(n.id)}
              className={`${DASH.tab} ${network === n.id ? DASH.tabActive : DASH.tabIdle}`}
            >
              {n.label} · {n.chain}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <CopyField label={`${active.label} deposit address`} value={active.address} />
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-200/90">
              <p className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                Send <strong className="font-semibold">USDT only</strong> on {active.label}. Wrong
                token or network may result in permanent loss.
              </p>
            </div>
            <p className="text-xs text-slate-500">Minimum deposit: $10 USDT · Confirmations: 12</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 lg:w-44">
            <QrCode className="h-16 w-16 text-slate-600" strokeWidth={1} aria-hidden />
            <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-wider text-slate-500">
              QR code
            </p>
            <p className="mt-1 text-center text-[10px] text-slate-600">API will render live QR</p>
          </div>
        </div>
      </div>

      <div className={DASH.card}>
        <h2 className="text-sm font-semibold text-white">How to deposit</h2>
        <ol className="mt-4 space-y-3">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-slate-400">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-solar-accent/20 text-xs font-bold text-solar-accent">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-center gap-2 text-xs text-emerald-400/90">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Blockchain monitoring active — last scan 12s ago (demo)
        </p>
      </div>
    </div>
  );
}
