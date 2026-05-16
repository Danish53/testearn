"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  GitBranch,
  Layers,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import ReferralShareCard from "@/components/dashboard/ReferralShareCard";
import {
  DEMO_TEAM_LEVELS,
  DEMO_TEAM_MEMBERS,
  DEMO_USER,
} from "@/components/dashboard/demo-data";
import { DASH } from "@/components/dashboard/dashboard-ui";

const LEVEL_STYLES = {
  1: {
    ring: "ring-solar-accent/35",
    badge: "bg-solar-accent/20 text-solar-accent ring-solar-accent/30",
    bar: "bg-solar-accent",
    glow: "from-solar-accent/25",
    icon: UserPlus,
  },
  2: {
    ring: "ring-violet-400/35",
    badge: "bg-violet-500/20 text-violet-300 ring-violet-400/30",
    bar: "bg-violet-400",
    glow: "from-violet-500/20",
    icon: GitBranch,
  },
  3: {
    ring: "ring-slate-400/30",
    badge: "bg-white/10 text-slate-300 ring-white/15",
    bar: "bg-slate-400",
    glow: "from-white/10",
    icon: Layers,
  },
};

const TOTAL_VOLUME = DEMO_TEAM_LEVELS.reduce((s, l) => s + l.volume, 0);
const TOTAL_COMMISSION = DEMO_TEAM_LEVELS.reduce((s, l) => s + l.commission, 0);

function LevelCard({ lvl }) {
  const style = LEVEL_STYLES[lvl.level];
  const Icon = style.icon;
  const volumeShare = TOTAL_VOLUME > 0 ? Math.round((lvl.volume / TOTAL_VOLUME) * 100) : 0;

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1018]/90 p-4 shadow-lg ring-1 ${style.ring} sm:p-5`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.glow} to-transparent`}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.badge} ring-1`}
            >
              <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Level {lvl.level}
              </p>
              <h3 className="text-sm font-bold text-white sm:text-base">
                {lvl.level === 1 ? "Direct" : lvl.level === 2 ? "Indirect" : "Network"}
              </h3>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${style.badge} ring-1`}
          >
            L{lvl.level}
          </span>
        </div>

        <p className="mt-3 text-2xl font-bold tabular-nums text-white sm:text-3xl">{lvl.count}</p>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Members</p>

        <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">Team volume</span>
            <span className="font-semibold tabular-nums text-solar-accent">
              ${lvl.volume.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">Commission earned</span>
            <span className="font-semibold tabular-nums text-emerald-400">
              ${lvl.commission.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[10px] text-slate-500">
            <span>Volume share</span>
            <span className="font-semibold tabular-nums text-slate-400">{volumeShare}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${style.bar}`}
              style={{ width: `${volumeShare}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function MemberRow({ member }) {
  const levelStyle = LEVEL_STYLES[member.level] ?? LEVEL_STYLES[3];

  return (
    <li className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:border-white/12 hover:bg-white/[0.05]">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10">
        <Image
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0f172a&color=1facee&size=88`}
          alt=""
          fill
          className="object-cover"
          sizes="44px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-white">{member.name}</p>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${levelStyle.badge} ring-1`}
          >
            L{member.level}
          </span>
        </div>
        <p className="truncate font-mono text-xs text-slate-500">{member.id}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="font-semibold text-solar-accent">{member.package}</span>
          <span>Joined {member.joined}</span>
        </div>
      </div>
    </li>
  );
}

export default function TeamSection() {
  const [levelFilter, setLevelFilter] = useState("all");

  const filteredMembers = useMemo(() => {
    if (levelFilter === "all") return DEMO_TEAM_MEMBERS;
    return DEMO_TEAM_MEMBERS.filter((m) => m.level === Number(levelFilter));
  }, [levelFilter]);

  return (
    <div className={DASH.wrap}>
      <div>
        <h1 className={DASH.h1}>Team</h1>
        <p className={DASH.lead}>
          Multi-level referral network — track direct invites, indirect team, and commissions
          across 3 levels.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="col-span-2 rounded-2xl border border-solar-accent/30 bg-gradient-to-br from-solar-accent/20 via-[#0b1018] to-[#0b1018] p-4 ring-1 ring-solar-accent/20 sm:flex sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total team
            </p>
            <p className="mt-0.5 text-4xl font-bold tabular-nums text-white sm:text-5xl">
              {DEMO_USER.teamSize}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {DEMO_USER.directCount} direct · {DEMO_USER.teamSize - DEMO_USER.directCount} downline
            </p>
          </div>
          <div className="mt-4 flex gap-6 sm:mt-0 sm:gap-10">
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-500">Volume</p>
              <p className="text-lg font-bold tabular-nums text-solar-accent">
                ${TOTAL_VOLUME.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-500">Commission</p>
              <p className="text-lg font-bold tabular-nums text-emerald-400">
                ${TOTAL_COMMISSION.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className={DASH.card}>
          <Users className="mb-2 h-5 w-5 text-solar-accent" strokeWidth={1.75} aria-hidden />
          <p className="text-xl font-bold tabular-nums text-white">{DEMO_USER.directCount}</p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Level 1 direct
          </p>
        </div>
        <div className={DASH.card}>
          <TrendingUp className="mb-2 h-5 w-5 text-emerald-400" strokeWidth={1.75} aria-hidden />
          <p className="text-xl font-bold tabular-nums text-emerald-400">
            ${TOTAL_COMMISSION.toFixed(0)}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Total earned
          </p>
        </div>
      </div>

      <ReferralShareCard />

      <section className={`relative ${DASH.card} overflow-hidden`}>
        <h2 className="text-sm font-bold text-white sm:text-base">Referral structure</h2>
        <p className="mt-1 text-xs text-slate-500">You earn when your network activates VIP packages.</p>
        <div className="mt-5 space-y-3">
          <div className="mx-auto w-full max-w-xs rounded-xl border border-solar-accent/40 bg-solar-accent/15 px-4 py-3 text-center ring-1 ring-solar-accent/25">
            <p className="text-[10px] font-bold uppercase text-solar-accent">You</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-white">{DEMO_USER.name}</p>
          </div>
          <div className="flex justify-center">
            <ChevronRight className="h-5 w-5 rotate-90 text-slate-600" aria-hidden />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_TEAM_LEVELS.map((lvl) => (
              <div
                key={lvl.level}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-3 text-center sm:px-3"
              >
                <p className="text-[10px] font-bold uppercase text-slate-500">Level #{lvl.level}</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-white sm:text-2xl">
                  {lvl.count}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">members</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div>
        <h2 className="mb-3 text-sm font-bold text-white sm:text-base">Level breakdown</h2>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {DEMO_TEAM_LEVELS.map((lvl) => (
            <LevelCard key={lvl.level} lvl={lvl} />
          ))}
        </div>
      </div>

      <div className={`${DASH.card} flex gap-3`}>
        <Wallet className="h-5 w-5 shrink-0 text-solar-accent" aria-hidden />
        <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
          <span className="font-semibold text-white">Level 1 (Direct)</span> — users you invited.{" "}
          <span className="font-semibold text-violet-300">Level 2–3</span> — their network. Earn
          commission when they buy VIP packages.
        </p>
      </div>

      <section className={DASH.panel}>
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className={DASH.sectionTitle}>Team members</h2>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All" },
              { id: "1", label: "L1" },
              { id: "2", label: "L2" },
              { id: "3", label: "L3" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLevelFilter(tab.id)}
                className={`${DASH.tab} ${levelFilter === tab.id ? DASH.tabActive : DASH.tabIdle}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="space-y-2 p-3 md:hidden">
          {filteredMembers.length === 0 ? (
            <li className="py-8 text-center text-sm text-slate-500">No members at this level.</li>
          ) : (
            filteredMembers.map((m) => <MemberRow key={m.id} member={m} />)
          )}
        </ul>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Member</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {filteredMembers.map((m) => {
                const ls = LEVEL_STYLES[m.level];
                return (
                  <tr key={m.id} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10">
                          <Image
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0f172a&color=1facee&size=64`}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-white">{m.name}</p>
                          <p className="font-mono text-xs text-slate-500">{m.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${ls.badge} ring-1`}
                      >
                        Level {m.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-solar-accent">{m.package}</td>
                    <td className="px-6 py-3 text-slate-500">{m.joined}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredMembers.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">No members at this level.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
