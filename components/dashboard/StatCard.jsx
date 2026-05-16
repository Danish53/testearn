import { DASH } from "@/components/dashboard/dashboard-ui";

export default function StatCard({ label, value, icon: Icon, highlight = false, sub }) {
  if (highlight) {
    return (
      <div className="rounded-2xl border border-solar-accent/35 bg-gradient-to-br from-solar-accent to-solar-accent-strong p-4 text-white shadow-lg shadow-solar-accent/20 ring-1 ring-white/10 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/85 sm:text-xs">
              {label}
            </p>
            {sub ? <p className="mt-1 text-xs text-white/70">{sub}</p> : null}
          </div>
          {Icon ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={DASH.card}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-2xl font-bold tabular-nums text-solar-accent sm:text-3xl">{value}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
            {label}
          </p>
          {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
        </div>
        {Icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-solar-accent/10 text-solar-accent">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
        ) : null}
      </div>
    </div>
  );
}
