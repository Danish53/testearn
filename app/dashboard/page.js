import Image from "next/image";
import Link from "next/link";
import { Clock, Layers, TrendingUp, Users } from "lucide-react";
import ReferralShareCard from "@/components/dashboard/ReferralShareCard";
import { DASH } from "@/components/dashboard/dashboard-ui";

export const metadata = {
  title: "Overview",
};

const ORDERS = [
  {
    name: "Growth package",
    price: "$299",
    payment: "USDT",
    status: "Active",
    tone: "green",
  },
  {
    name: "Starter package",
    price: "$99",
    payment: "Card",
    status: "Pending",
    tone: "amber",
  },
  {
    name: "Pro package",
    price: "$799",
    payment: "USDT",
    status: "Processing",
    tone: "cyan",
  },
  {
    name: "Add-on slot",
    price: "$49",
    payment: "Wallet",
    status: "Cancelled",
    tone: "red",
  },
];

const TEAM = [
  {
    name: "Sara Khan",
    place: "Karachi",
    img: "https://ui-avatars.com/api/?name=Sara+Khan&background=0f172a&color=94a3b8&size=64",
    highlight: true,
  },
  {
    name: "Omar Malik",
    place: "Lahore",
    img: "https://ui-avatars.com/api/?name=Omar+Malik&background=0f172a&color=94a3b8&size=64",
    highlight: false,
  },
  {
    name: "Ayesha Noor",
    place: "Islamabad",
    img: "https://ui-avatars.com/api/?name=Ayesha+Noor&background=0f172a&color=94a3b8&size=64",
    highlight: false,
  },
  {
    name: "Hassan Ali",
    place: "Dubai",
    img: "https://ui-avatars.com/api/?name=Hassan+Ali&background=0f172a&color=94a3b8&size=64",
    highlight: false,
  },
];

function StatusBadge({ status, tone }) {
  const map = {
    green: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25",
    amber: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/25",
    red: "bg-red-500/15 text-red-300 ring-1 ring-red-500/25",
    cyan: "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/25",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:text-xs ${map[tone]}`}
    >
      {status}
    </span>
  );
}

export default function DashboardHomePage() {
  return (
    <div className={DASH.wrap}>
      <div>
        <h1 className={DASH.h1}>Overview</h1>
        <p className={DASH.lead}>
          Welcome back — here is your dashboard.
        </p>
      </div>

      <ReferralShareCard />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className={DASH.card}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-2xl font-bold tabular-nums text-solar-accent sm:text-3xl">1,504</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                Est. daily yield
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-solar-accent/10 text-solar-accent">
              <TrendingUp className="h-5 w-5" strokeWidth={1.75} />
            </div>
          </div>
        </div>
        <div className={DASH.card}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-2xl font-bold tabular-nums text-solar-accent sm:text-3xl">3</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                Active slots
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-solar-accent/10 text-solar-accent">
              <Layers className="h-5 w-5" strokeWidth={1.75} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-solar-accent/35 bg-gradient-to-br from-solar-accent to-solar-accent-strong p-4 text-white shadow-lg shadow-solar-accent/20 ring-1 ring-white/10 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-2xl font-bold tabular-nums sm:text-3xl">$2,840</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/85 sm:text-xs">
                Team volume
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
              <Users className="h-5 w-5" strokeWidth={1.75} />
            </div>
          </div>
        </div>
        <div className={DASH.card}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-2xl font-bold tabular-nums text-solar-accent sm:text-3xl">$42</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                Pending withdraw
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-solar-accent/10 text-solar-accent">
              <Clock className="h-5 w-5" strokeWidth={1.75} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <section className={`${DASH.card} lg:col-span-2`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className={DASH.sectionTitle}>Recent packages</h2>
            <Link
              href="/dashboard/packages"
              className="rounded-full bg-solar-accent px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 sm:text-sm"
            >
              View all
            </Link>
          </div>
          <div className="-mx-1 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                  <th className="pb-3 pr-2 font-semibold">Name</th>
                  <th className="pb-3 pr-2 font-semibold">Price</th>
                  <th className="hidden pb-3 pr-2 font-semibold sm:table-cell">Payment</th>
                  <th className="pb-3 text-right font-semibold sm:text-left">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {ORDERS.map((row) => (
                  <tr key={row.name} className="border-b border-white/[0.06] last:border-0">
                    <td className="py-3 pr-2 font-medium text-white">{row.name}</td>
                    <td className="py-3 pr-2 tabular-nums text-solar-accent">{row.price}</td>
                    <td className="hidden py-3 pr-2 text-slate-400 sm:table-cell">{row.payment}</td>
                    <td className="py-3 text-right sm:text-left">
                      <StatusBadge status={row.status} tone={row.tone} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={DASH.card}>
          <h2 className={`${DASH.sectionTitle} mb-4`}>Recent team</h2>
          <ul className="space-y-1">
            {TEAM.map((m) => (
              <li key={m.name}>
                <div
                  className={`flex items-center gap-3 rounded-xl px-2 py-2.5 transition sm:px-3 ${
                    m.highlight
                      ? "bg-solar-accent/25 text-white ring-1 ring-solar-accent/35"
                      : "hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white/15">
                    <Image src={m.img} alt={m.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{m.name}</p>
                    <p
                      className={`truncate text-xs ${m.highlight ? "text-white/80" : "text-slate-400"}`}
                    >
                      {m.place}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
