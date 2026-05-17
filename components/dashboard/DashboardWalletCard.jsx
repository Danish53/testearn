"use client";

import { useEffect, useState } from "react";
import { KeyRound, Lock, Shield, Wallet } from "lucide-react";
import CopyField from "@/components/dashboard/CopyField";
import { useAppSelector } from "@/store/hooks";
import { walletNetworksForUser } from "@/lib/wallet/networks";

const NETWORK_UI = {
  trc20: {
    badge: "TRC20",
    chain: "Tron",
    token: "USDT",
    ring: "ring-red-500/25",
    bg: "bg-red-500/10",
    text: "text-red-300",
  },
  bep20: {
    badge: "BEP20",
    chain: "BNB Smart Chain",
    token: "USDT",
    ring: "ring-amber-500/25",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
  },
};

export default function DashboardWalletCard() {
  const user = useAppSelector((s) => s.auth.user);
  const [networks, setNetworks] = useState([]);

  useEffect(() => {
    if (!user?.isVerified) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/wallet", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.wallet?.networks) {
          setNetworks(data.wallet.networks);
        }
      } catch {
        /* fallback below */
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.isVerified]);

  const trc20 = networks.find((n) => n.id === "trc20")?.address || user?.wallet?.trc20Address || "";
  const bep20 = networks.find((n) => n.id === "bep20")?.address || user?.wallet?.bep20Address || "";

  const displayNetworks =
    networks.length > 0
      ? networks
      : [
          { id: "trc20", label: "TRC20", chain: "Tron", token: "USDT", address: trc20 },
          { id: "bep20", label: "BEP20", chain: "BNB Smart Chain", token: "USDT", address: bep20 },
        ];

  if (!user?.isVerified) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0b1018]/90 p-5 shadow-xl shadow-black/40 ring-1 ring-solar-accent/15 sm:p-6">
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-solar-accent/15 blur-3xl"
        aria-hidden
      />
      <div className="relative mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-solar-accent/20 text-solar-accent ring-1 ring-solar-accent/35">
            <Wallet className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-bold text-white sm:text-lg">Wallet management</h2>
            <p className="text-sm text-slate-400">Auto-created at registration · encrypted on server</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
          <Shield className="h-3.5 w-3.5" aria-hidden />
          Active
        </span>
      </div>

      <div className="relative mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
          <KeyRound className="h-4 w-4 shrink-0 text-solar-accent" aria-hidden />
          <span>
            <strong className="text-slate-300">Private key</strong> — encrypted (AES-256-GCM)
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
          <Lock className="h-4 w-4 shrink-0 text-solar-accent" aria-hidden />
          <span>
            <strong className="text-slate-300">Mnemonic</strong> — 12 words, encrypted at rest
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
          <Wallet className="h-4 w-4 shrink-0 text-solar-accent" aria-hidden />
          <span>
            <strong className="text-slate-300">Networks</strong> — USDT BEP20 + USDT TRC20
          </span>
        </div>
      </div>

      <div className="relative grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
        {displayNetworks.map((net) => {
          const ui = NETWORK_UI[net.id] || NETWORK_UI.bep20;
          return (
            <div
              key={net.id}
              className={`rounded-xl border border-white/[0.08] bg-black/25 p-4 ring-1 ${ui.ring}`}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ui.bg} ${ui.text}`}
                >
                  {ui.token} · {ui.badge}
                </span>
                <span className="text-xs text-slate-500">{ui.chain}</span>
              </div>
              <CopyField label={`${ui.token} deposit address`} value={net.address || "—"} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
