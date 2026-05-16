"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  GitBranch,
  Layers,
  Loader2,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import ReferralShareCard from "@/components/dashboard/ReferralShareCard";
import { DASH } from "@/components/dashboard/dashboard-ui";
import { useAppSelector } from "@/store/hooks";

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

function LevelCard({ lvl, totalVolume }) {
  const style = LEVEL_STYLES[lvl.level];
  const Icon = style.icon;
  const volumeShare =
    totalVolume > 0 ? Math.round((lvl.volume / totalVolume) * 100) : 0;

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
              <h3 className="text-sm font-bold text-white sm:text-base">{lvl.label}</h3>
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
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.username)}&background=0f172a&color=1facee&size=88`}
          alt=""
          fill
          className="object-cover"
          sizes="44px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-white">@{member.username}</p>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${levelStyle.badge} ring-1`}
          >
            L{member.level}
          </span>
        </div>
        <p className="truncate font-mono text-xs text-slate-500">{member.referralCode}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="font-semibold text-solar-accent">{member.package}</span>
          <span>Joined {member.joined}</span>
        </div>
      </div>
    </li>
  );
}

const EMPTY_TEAM = {
  referralCode: "",
  referralEarnings: 0,
  teamSize: 0,
  directCount: 0,
  levels: [
    { level: 1, label: "Level 1 — Direct", count: 0, volume: 0, commission: 0 },
    { level: 2, label: "Level 2 — Indirect", count: 0, volume: 0, commission: 0 },
    { level: 3, label: "Level 3 — Network", count: 0, volume: 0, commission: 0 },
  ],
  members: [],
  totalVolume: 0,
  totalCommission: 0,
};

export default function TeamSection() {
  const user = useAppSelector((s) => s.auth.user);
  const [levelFilter, setLevelFilter] = useState("all");
  const [team, setTeam] = useState(EMPTY_TEAM);
  const [loading, setLoading] = useState(true);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/referral/team", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.team) setTeam(data.team);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.isVerified) loadTeam();
  }, [user?.isVerified, loadTeam]);

  const filteredMembers = useMemo(() => {
    if (levelFilter === "all") return team.members;
    return team.members.filter((m) => m.level === Number(levelFilter));
  }, [levelFilter, team.members]);

  if (loading) {
    return (
      <div className={`${DASH.wrap} flex flex-col items-center justify-center py-24`}>
        <Loader2 className="h-10 w-10 animate-spin text-solar-accent" aria-hidden />
        <p className="mt-3 text-sm text-slate-500">Loading team…</p>
      </div>
    );
  }

  return (
    <div className={DASH.wrap}>
      <div>
        <h1 className={DASH.h1}>Team & referrals</h1>
        <p className={DASH.lead}>
          Your referral code, invite link, and 3-level team. Earn commission when your network
          activates VIP packages.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="col-span-2 rounded-2xl border border-solar-accent/30 bg-gradient-to-br from-solar-accent/20 via-[#0b1018] to-[#0b1018] p-4 ring-1 ring-solar-accent/20 sm:flex sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total team
            </p>
            <p className="mt-0.5 text-4xl font-bold tabular-nums text-white sm:text-5xl">
              {team.teamSize}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {team.directCount} direct · {team.teamSize - team.directCount} downline
            </p>
          </div>
          <div className="mt-4 flex gap-6 sm:mt-0 sm:gap-10">
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-500">Volume</p>
              <p className="text-lg font-bold tabular-nums text-solar-accent">
                ${team.totalVolume.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-500">Commission</p>
              <p className="text-lg font-bold tabular-nums text-emerald-400">
                ${team.totalCommission.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className={DASH.card}>
          <Users className="mb-2 h-5 w-5 text-solar-accent" strokeWidth={1.75} aria-hidden />
          <p className="text-xl font-bold tabular-nums text-white">{team.directCount}</p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Level 1 direct
          </p>
        </div>
        <div className={DASH.card}>
          <TrendingUp className="mb-2 h-5 w-5 text-emerald-400" strokeWidth={1.75} aria-hidden />
          <p className="text-xl font-bold tabular-nums text-emerald-400">
            ${team.referralEarnings.toFixed(2)}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Commission earnings
          </p>
        </div>
      </div>

      <ReferralShareCard />

      <section className={`relative ${DASH.card} overflow-hidden`}>
        <h2 className="text-sm font-bold text-white sm:text-base">Multi-level structure</h2>
        <p className="mt-1 text-xs text-slate-500">
          Level 1 = your direct invites · Level 2–3 = their downline
        </p>
        <div className="mt-5 space-y-3">
          <div className="mx-auto w-full max-w-xs rounded-xl border border-solar-accent/40 bg-solar-accent/15 px-4 py-3 text-center ring-1 ring-solar-accent/25">
            <p className="text-[10px] font-bold uppercase text-solar-accent">You</p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-solar-accent">
              {team.referralCode || user?.referralCode}
            </p>
            <p className="mt-1 text-xs text-slate-400">@{user?.username}</p>
          </div>
          <div className="flex justify-center">
            <ChevronRight className="h-5 w-5 rotate-90 text-slate-600" aria-hidden />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {team.levels.map((lvl) => (
              <div
                key={lvl.level}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-3 text-center sm:px-3"
              >
                <p className="text-[10px] font-bold uppercase text-slate-500">Level {lvl.level}</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-white sm:text-2xl">
                  {lvl.count}
                </p>
                <p className="mt-0.5 text-[10px] text-emerald-400/90">
                  ${lvl.commission.toFixed(0)} earned
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div>
        <h2 className="mb-3 text-sm font-bold text-white sm:text-base">Team levels</h2>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {team.levels.map((lvl) => (
            <LevelCard key={lvl.level} lvl={lvl} totalVolume={team.totalVolume} />
          ))}
        </div>
      </div>

      <div className={`${DASH.card} flex gap-3`}>
        <Wallet className="h-5 w-5 shrink-0 text-solar-accent" aria-hidden />
        <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
          <span className="font-semibold text-white">Referral link:</span> share{" "}
          <span className="font-mono text-solar-accent">/register?ref=YOURCODE</span>.{" "}
          <span className="font-semibold text-white">L1</span> earns direct %,{" "}
          <span className="font-semibold text-violet-300">L2–L3</span> earn indirect % on each VIP
          purchase.
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
            <li className="py-8 text-center text-sm text-slate-500">
              No team members yet — share your referral link to grow your network.
            </li>
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
                <th className="px-4 py-3">Code</th>
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
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.username)}&background=0f172a&color=1facee&size=64`}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        </div>
                        <p className="font-medium text-white">@{m.username}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${ls.badge} ring-1`}
                      >
                        L{m.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{m.referralCode}</td>
                    <td className="px-4 py-3 font-semibold text-solar-accent">{m.package}</td>
                    <td className="px-6 py-3 text-slate-500">{m.joined}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredMembers.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No team members yet — share your referral link.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
