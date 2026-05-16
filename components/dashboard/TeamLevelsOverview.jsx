"use client";

import { GitBranch, Layers, UserPlus } from "lucide-react";
import { formatCount, formatUsd } from "@/lib/dashboard/format";
import { DASH } from "@/components/dashboard/dashboard-ui";

const LEVEL_STYLES = {
  1: {
    ring: "ring-solar-accent/35",
    badge: "bg-solar-accent/20 text-solar-accent ring-solar-accent/30",
    icon: UserPlus,
  },
  2: {
    ring: "ring-violet-400/35",
    badge: "bg-violet-500/20 text-violet-300 ring-violet-400/30",
    icon: GitBranch,
  },
  3: {
    ring: "ring-slate-400/30",
    badge: "bg-white/10 text-slate-300 ring-white/15",
    icon: Layers,
  },
};

export default function TeamLevelsOverview({ levels = [] }) {
  const totalMembers = levels.reduce((s, l) => s + (l.count || 0), 0);

  return (
    <section className={DASH.card}>
      <div className="mb-4">
        <h2 className={DASH.sectionTitle}>Team levels</h2>
        <p className="mt-1 text-sm text-slate-400">
          {formatCount(totalMembers)} members across 3 levels
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {levels.map((lvl) => {
          const style = LEVEL_STYLES[lvl.level] || LEVEL_STYLES[3];
          const Icon = style.icon;
          return (
            <article
              key={lvl.level}
              className={`rounded-xl border border-white/[0.08] bg-black/20 p-4 ring-1 ${style.ring}`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.badge} ring-1`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Level {lvl.level}
                  </p>
                  <p className="truncate text-sm font-semibold text-white">{lvl.label}</p>
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tabular-nums text-white">{formatCount(lvl.count)}</p>
              <p className="mt-1 text-xs text-slate-500">members</p>
              {(lvl.volume > 0 || lvl.commission > 0) && (
                <div className="mt-3 space-y-1 border-t border-white/[0.06] pt-3 text-xs text-slate-400">
                  {lvl.volume > 0 ? <p>Volume: {formatUsd(lvl.volume)}</p> : null}
                  {lvl.commission > 0 ? <p>Commission: {formatUsd(lvl.commission)}</p> : null}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
