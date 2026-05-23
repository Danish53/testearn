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
import {
  DEFAULT_NETWORK_ID,
  walletNetworksForUser,
} from "@/lib/wallet/networks";
import { setUser } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const STEPS = [
  "Open this page and select BEP20 or TRC20",
  "Copy the address or scan the QR code",
  "Send USDT from Trust Wallet, Binance, or any wallet",
  "Balance updates automatically on the dashboard (about every 60s) once your USDT is confirmed",
];

const POLL_MS = 60_000;

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
  const [network, setNetwork] = useState(DEFAULT_NETWORK_ID);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [scanMessage, setScanMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [txHash, setTxHash] = useState("");
  const [alerts, setAlerts] = useState([]);

  const networks = useMemo(
    () => walletNetworksForUser(user?.wallet),
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: txHash.trim(),
          network,
        }),
      });
      const data = await res.json();
      setLastScan(new Date());
      if (data.user) dispatch(setUser(data.user));
      const credited = data.creditedCount > 0;
      const found = (data.incoming ?? 0) > 0;
      let msg =
        data.message || (data.success ? "Scan complete" : "Scan failed");
      if (credited) {
        msg = `${msg} — wallet balance updated.`;
      } else if (found && !credited) {
        msg = `${msg} — see Recent deposits (pending or below minimum).`;
      } else if (data.success && !found) {
        const onChain = data.bep20UsdtOnChain;
        const addr = data.depositAddress || user?.wallet?.bep20Address;
        if (onChain === 0 && network === "bep20") {
          msg = `${msg} On-chain USDT at your BEP20 address is $0 — confirm Trust Wallet sent USDT (not BNB) on BSC to: ${addr ? `${addr.slice(0, 10)}…` : "?"}`;
        }
      }
      setScanMessage(msg);
      if (data.alerts) setAlerts(data.alerts);
      await loadHistory();
    } catch {
      setScanMessage("Could not reach deposit scanner");
    } finally {
      setScanning(false);
    }
  }, [user?.isVerified, dispatch, loadHistory, txHash, network]);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/deposit/alerts", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.alerts) setAlerts(data.alerts);
    } catch {
      /* ignore */
    }
  }, []);

  async function dismissAlerts() {
    try {
      await fetch("/api/deposit/alerts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await loadAlerts();
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    loadHistory();
    loadAlerts();
  }, [loadHistory, loadAlerts]);

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      {/* {alerts.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-amber-200">
              Payment notices{" "}
              <span className="font-normal text-slate-500">(includes past wrong sends)</span>
            </p>
            <button
              type="button"
              onClick={() => void dismissAlerts()}
              className="text-xs font-medium text-slate-400 hover:text-white"
            >
              Mark all seen
            </button>
          </div>
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border px-4 py-3 text-sm ${
                a.read
                  ? "border-white/10 bg-white/[0.03] text-slate-400"
                  : "border-amber-500/35 bg-amber-500/10 text-amber-100/95"
              }`}
            >
              <p className="flex items-start gap-2">
                <AlertCircle
                  className={`mt-0.5 h-4 w-4 shrink-0 ${a.read ? "text-slate-500" : "text-amber-400"}`}
                  aria-hidden
                />
                <span>{a.message}</span>
              </p>
              <p className="mt-2 font-mono text-[10px] opacity-80">
                {a.assetSymbol} · {a.network.toUpperCase()} · {a.txHash.slice(0, 14)}…
                {a.read ? " · seen" : ""}
              </p>
            </div>
          ))}
        </div>
      ) : null} */}

      <div className={DASH.card}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white">Network type</p>
          <span className="rounded-full bg-solar-accent/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-solar-accent">
            USDT only
          </span>
        </div>
        <div className={DASH.filterScroll}>
          {networks.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setNetwork(n.id)}
              className={`${DASH.tab} ${network === n.id ? DASH.tabActive : DASH.tabIdle}`}
            >
              <span className="sm:hidden">
                {n.label} · {n.chain}
              </span>
              <span className="hidden sm:inline">
                {n.token} · {n.label} · {n.chain}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
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
                {active.chain}) — not BNB coin. Wrong token or network = permanent loss.
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
        {network === "bep20" ? (
          <div className="mt-4 space-y-2">
            <label htmlFor="deposit-tx-hash" className={DASH.label}>
              Transaction hash (if balance not updated)
            </label>
            <input
              id="deposit-tx-hash"
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x… from Trust Wallet history"
              className={`${DASH.input} font-mono text-sm`}
            />
            <p className="text-[11px] text-slate-500">
              Paste BSC tx hash, then tap Scan — we check if it was USDT or BNB.
            </p>
          </div>
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
