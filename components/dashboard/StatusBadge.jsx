const TONES = {
  green: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25",
  amber: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/25",
  red: "bg-red-500/15 text-red-300 ring-1 ring-red-500/25",
  cyan: "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/25",
  violet: "bg-violet-500/15 text-violet-200 ring-1 ring-violet-500/25",
  slate: "bg-white/10 text-slate-300 ring-1 ring-white/15",
};

export default function StatusBadge({ status, tone = "slate" }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize sm:text-xs ${TONES[tone] ?? TONES.slate}`}
    >
      {status}
    </span>
  );
}

export function txStatusTone(status) {
  const map = {
    confirmed: "green",
    completed: "green",
    credited: "cyan",
    pending: "amber",
    detected: "amber",
    confirming: "amber",
    review: "violet",
    rejected: "red",
  };
  return map[status] ?? "slate";
}
