import { ADMIN } from "@/components/admin/admin-ui";

const TONES = {
  accent: {
    icon: "bg-solar-accent/15 text-solar-accent ring-solar-accent/25",
    value: "text-solar-accent",
  },
  emerald: {
    icon: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25",
    value: "text-emerald-400",
  },
  amber: {
    icon: "bg-amber-500/15 text-amber-400 ring-amber-500/25",
    value: "text-amber-300",
  },
  violet: {
    icon: "bg-violet-500/15 text-violet-300 ring-violet-500/25",
    value: "text-violet-300",
  },
};

export default function AdminStatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "accent",
  featured = false,
}) {
  const t = TONES[tone] || TONES.accent;

  if (featured) {
    return (
      <article className="relative overflow-hidden rounded-2xl border border-solar-accent/35 bg-gradient-to-br from-solar-accent via-solar-accent to-solar-accent-strong p-5 text-solar-foreground-on-accent shadow-xl shadow-solar-accent/25 ring-1 ring-white/15 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl"
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-solar-foreground-on-accent/85">
              {label}
            </p>
            {sub ? <p className="mt-2 text-xs text-solar-foreground-on-accent/75">{sub}</p> : null}
          </div>
          {Icon ? (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/15 ring-1 ring-black/10">
              <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article className={`${ADMIN.card} transition hover:border-white/12`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-2xl font-bold tabular-nums sm:text-[1.65rem] ${t.value}`}>{value}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          {sub ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{sub}</p> : null}
        </div>
        {Icon ? (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${t.icon}`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
        ) : null}
      </div>
    </article>
  );
}
