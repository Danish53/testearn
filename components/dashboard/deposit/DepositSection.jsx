"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  Loader2,
  Radio,
  Shield,
} from "lucide-react";
import CopyField from "@/components/dashboard/CopyField";
import DepositQrCode from "@/components/dashboard/deposit/DepositQrCode";
import { DASH } from "@/components/dashboard/dashboard-ui";
import PageHeader from "@/components/dashboard/PageHeader";
import { MIN_DEPOSIT_USDT } from "@/lib/deposit/constants";
import { setUser } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const STEPS = [
  "Open this page and select TRC20 or BEP20",
  "Copy the address or scan the QR code",
  "Send USDT from Trust Wallet, Binance, or any wallet",
  "We scan the blockchain every 30s — balance updates automatically",
];

const POLL_MS = 30_000;

function statusLabel(status) {
  const map = {
    credited: "Credited",
    confirmed: "Confirming",
    pending: "Pending",
    below_minimum: "Below minimum",
  };
  return map[status] || status;
}

export default function DepositSection() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [network, setNetwork] = useState("trc20");
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [scanMessage, setScanMessage] = useState("");
  const [history, setHistory] = useState([]);

  const networks = useMemo(
    () => [
      {
        id: "trc20",
        label: "TRC20",
        chain: "Tron",
        token: "USDT",
        address: user?.wallet?.trc20Address || "",
      },
      {
        id: "bep20",
        label: "BEP20",
        chain: "BNB Smart Chain",
        token: "USDT",
        address: user?.wallet?.bep20Address || "",
      },
    ],
    [user?.wallet]
  );

  const active = networks.find((n) => n.id === network) ?? networks[0];
  const balance = user?.balance ?? 0;

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/deposit/history", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.deposits) setHistory(data.deposits);
    } catch {
      /* ignore */
    }
  }, []);

  const runScan = useCallback(async () => {
    if (!user?.isVerified) return;
    setScanning(true);
    try {
      const res = await fetch("/api/deposit/check", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      setLastScan(new Date());
      if (data.user) dispatch(setUser(data.user));
      setScanMessage(data.message || (data.success ? "Scan complete" : "Scan failed"));
      await loadHistory();
    } catch {
      setScanMessage("Could not reach deposit scanner");
    } finally {
      setScanning(false);
    }
  }, [user?.isVerified, dispatch, loadHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!user?.isVerified) return;
    runScan();
    const id = window.setInterval(runScan, POLL_MS);
    return () => window.clearInterval(id);
  }, [user?.isVerified, runScan]);

  return (
    <div className={DASH.wrap}>
      <PageHeader
        icon={ArrowDownToLine}
        title="Deposit USDT"
        lead="Send USDT to your personal address. Blockchain monitoring runs automatically — your balance updates when payment is confirmed."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={`${DASH.card} sm:col-span-1`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Available balance
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-solar-accent">
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-xs text-slate-500">USDT · auto-credited</p>
        </div>
        <div className={`${DASH.card} flex gap-3 sm:col-span-2`}>
          <Shield className="h-8 w-8 shrink-0 text-solar-accent" strokeWidth={1.75} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Blockchain monitoring</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <Radio className="h-3 w-3 animate-pulse" aria-hidden />
                Active
              </span>
              {scanning ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                  Scanning…
                </span>
              ) : lastScan ? (
                <span>Last scan {lastScan.toLocaleTimeString()}</span>
              ) : null}
            </p>
            {scanMessage ? (
              <p className="mt-2 text-xs text-solar-accent/90">{scanMessage}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className={DASH.card}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white">Network type</p>
          <span className="rounded-full bg-solar-accent/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-solar-accent">
            USDT only
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {networks.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setNetwork(n.id)}
              className={`${DASH.tab} ${network === n.id ? DASH.tabActive : DASH.tabIdle}`}
            >
              {n.token} · {n.label} · {n.chain}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <div className="rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Wallet address · {active.label}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Network: <strong className="text-white">{active.chain}</strong> · Token:{" "}
                <strong className="text-white">{active.token}</strong>
              </p>
            </div>
            <CopyField
              label={`USDT ${active.label} deposit address`}
              value={active.address || "Complete email verification to view address"}
            />
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-200/90">
              <p className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                Send <strong className="font-semibold">USDT only</strong> on {active.label} (
                {active.chain}). Wrong token or network = permanent loss.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Minimum deposit: ${MIN_DEPOSIT_USDT} USDT · From Trust Wallet, Binance, or any exchange
            </p>
          </div>
          <DepositQrCode address={active.address} networkLabel={active.label} />
        </div>
      </div>

      {history.length > 0 ? (
        <div className={DASH.card}>
          <h2 className="text-sm font-semibold text-white">Recent deposits</h2>
          <ul className="mt-4 space-y-2">
            {history.slice(0, 8).map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-white">
                    +${Number(d.amount).toFixed(2)} USDT
                    <span className="ml-2 text-xs uppercase text-slate-500">{d.network}</span>
                  </p>
                  <p className="font-mono text-[10px] text-slate-500">
                    {d.txHash.slice(0, 10)}…{d.txHash.slice(-8)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    d.status === "credited"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : d.status === "below_minimum"
                        ? "bg-red-500/15 text-red-300"
                        : "bg-amber-500/15 text-amber-200"
                  }`}
                >
                  {statusLabel(d.status)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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
        {active.address ? (
          <p className="mt-4 flex items-center gap-2 text-xs text-emerald-400/90">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Monitoring {active.label} — payments detected automatically
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void runScan()}
          disabled={scanning || !user?.isVerified}
          className={`${DASH.btnPrimary} mt-4 max-w-xs`}
        >
          {scanning ? "Scanning blockchain…" : "Scan now"}
        </button>
      </div>
    </div>
  );
}
