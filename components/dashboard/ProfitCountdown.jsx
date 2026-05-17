"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock } from "lucide-react";

function formatCountdown(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function ProfitCountdown({
  nextProfitAt,
  profitDue,
  secondsRemaining: initialSeconds,
  dailyProfit,
  onDue,
  compact = false,
}) {
  const [seconds, setSeconds] = useState(initialSeconds ?? 0);
  const [fired, setFired] = useState(false);

  const tick = useCallback(() => {
    if (!nextProfitAt) return;
    const remaining = Math.max(
      0,
      Math.ceil((new Date(nextProfitAt).getTime() - Date.now()) / 1000)
    );
    setSeconds(remaining);
    if (remaining === 0 && !fired) {
      setFired(true);
      onDue?.();
    }
  }, [nextProfitAt, fired, onDue]);

  useEffect(() => {
    setFired(false);
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [tick, nextProfitAt]);

  const due = profitDue || seconds <= 0;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums ${
          due
            ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
            : "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/25"
        }`}
      >
        <Clock className="h-3 w-3" aria-hidden />
        {due ? "Paying…" : formatCountdown(seconds)}
      </span>
    );
  }

  return (
    <div
      className={`rounded-xl border p-3 ${
        due
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-solar-accent/25 bg-solar-accent/5"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Next profit ({dailyProfit != null ? `+$${Number(dailyProfit).toFixed(2)}` : "daily"})
      </p>
      <p
        className={`mt-1 font-mono text-2xl font-bold tabular-nums ${
          due ? "text-emerald-400" : "text-solar-accent"
        }`}
      >
        {due ? "Adding to wallet…" : formatCountdown(seconds)}
      </p>
      <p className="mt-1 text-[10px] text-slate-500">24-hour cycle from last payout</p>
    </div>
  );
}
