"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, TrendingUp, Wallet } from "lucide-react";
import ClientMarquee from "@/components/ClientMarquee";
import { SOLAR_IMAGES } from "@/lib/solarImages";

const benefits = [
  {
    title: "Lower bills, predictable output",
    body: "Modern PV systems convert sunlight into electricity at home or for your business, reducing grid dependence over decades.",
  },
  {
    title: "Grid-tied & storage-ready",
    body: "Pair panels with smart inverters and optional batteries to use solar when you need it—even after sunset.",
  },
  {
    title: "Track performance digitally",
    body: "Monitoring shows production in real time so you can see savings and system health from your phone.",
  },
];

const facts = [
  { label: "Typical payback", value: "5–10 yrs" },
  { label: "Panel warranty", value: "25+ yrs" },
  { label: "CO₂ avoided", value: "Tonnes / yr" },
];

function Eyebrow({ children, center = false }) {
  return (
    <span
      className={`mb-3 block text-[10px] font-semibold uppercase tracking-[0.28em] text-solar-accent sm:text-[11px] ${
        center ? "text-center" : ""
      }`}
    >
      {children}
    </span>
  );
}

function HomeSection({ children, className = "" }) {
  return (
    <section className={`border-b border-white/10 bg-black ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-5 sm:py-12 md:px-6 lg:px-8 lg:py-14">
        {children}
      </div>
    </section>
  );
}

function PrimaryLink({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-solar-accent to-solar-accent-strong px-6 text-sm font-semibold text-solar-foreground-on-accent shadow-lg shadow-solar-accent/25 transition hover:brightness-110 sm:w-auto sm:px-8"
    >
      {children}
      <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
    </Link>
  );
}

function ShowcaseCard({ src, alt, tag, title }) {
  return (
    <div className="relative min-h-[200px] overflow-hidden rounded-xl ring-1 ring-white/10 sm:min-h-[240px]">
      <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 sm:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-solar-accent">{tag}</p>
        <p className="mt-1 text-sm font-semibold text-white sm:text-base">{title}</p>
      </div>
    </div>
  );
}

export default function DashboardHomeContent() {
  return (
    <div className="w-full min-w-0 text-solar-text">
      <HomeSection className="!pb-8 !pt-1 sm:!pt-2">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="order-2 min-w-0 lg:order-1 lg:col-span-5">
            <Eyebrow>Welcome</Eyebrow>
            <h1 className="text-balance text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              Invest in the sun
              <span className="mt-2 block text-solar-accent">Power your future</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-solar-text-muted sm:text-base">
              Solar education and earnings tools in one place—deposit, activate VIP plans,
              and track daily returns from your dashboard.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PrimaryLink href="/dashboard/packages">View VIP packages</PrimaryLink>
              <Link
                href="/dashboard/deposit"
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-6 text-sm font-semibold text-white transition hover:border-solar-accent/40 sm:w-auto"
              >
                <Wallet className="h-4 w-4 text-solar-accent" aria-hidden />
                Deposit USDT
              </Link>
            </div>
          </div>
          <div className="order-1 min-w-0 lg:order-2 lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
              <div className="relative aspect-[16/10] min-h-[200px] w-full sm:min-h-[260px] lg:aspect-[5/4] lg:min-h-[300px]">
                <Image
                  src={SOLAR_IMAGES.heroWide}
                  alt="Solar panel installation"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>
      </HomeSection>

      <HomeSection>
        <Eyebrow>Get started</Eyebrow>
        <h2 className="text-lg font-bold uppercase tracking-tight text-white sm:text-xl">
          Your dashboard tools
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            {
              href: "/dashboard/packages",
              icon: Package,
              title: "VIP packages",
              desc: "Activate a plan and earn daily profit",
            },
            {
              href: "/dashboard/deposit",
              icon: Wallet,
              title: "Deposit",
              desc: "Add USDT to your wallet balance",
            },
            {
              href: "/dashboard/team",
              icon: TrendingUp,
              title: "Team & referrals",
              desc: "Grow your network and commissions",
            },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full min-h-[120px] flex-col rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-solar-accent/35 hover:bg-white/[0.07] sm:p-5"
              >
                <item.icon className="h-5 w-5 text-solar-accent" strokeWidth={2} aria-hidden />
                <p className="mt-3 font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-solar-text-muted sm:text-sm">
                  {item.desc}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </HomeSection>

      <HomeSection>
        <Eyebrow>Showcase</Eyebrow>
        <h2 className="text-lg font-bold uppercase tracking-tight text-white sm:text-2xl">
          Field-grade solar visuals
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-solar-text-muted sm:text-base">
          From rooftop arrays to utility-scale fields—the same clean energy story at every
          scale.
        </p>
        <div className="mt-8 grid gap-5 sm:gap-6 lg:grid-cols-2">
          <ShowcaseCard
            src={SOLAR_IMAGES.heroWide}
            alt="Utility-scale solar"
            tag="Utility scale"
            title="Megawatt fields built for decades"
          />
          <ShowcaseCard
            src={SOLAR_IMAGES.roof}
            alt="Residential rooftop solar"
            tag="Rooftop"
            title="Precision installs on real homes"
          />
        </div>
      </HomeSection>

      <HomeSection>
        <Eyebrow>Fundamentals</Eyebrow>
        <h2 className="text-lg font-bold uppercase tracking-tight text-white sm:text-2xl">
          Why solar matters
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {benefits.map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"
            >
              <div className="mb-3 h-1 w-10 rounded-full bg-solar-accent" />
              <h3 className="text-sm font-semibold text-white sm:text-base">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-solar-text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </HomeSection>

      <HomeSection>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-[4/3] min-h-[200px] overflow-hidden rounded-xl ring-1 ring-white/10 sm:aspect-[16/10]">
            <Image
              src={SOLAR_IMAGES.install}
              alt="Solar installation"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="min-w-0">
            <Eyebrow>Longevity</Eyebrow>
            <h2 className="text-lg font-bold uppercase tracking-tight text-white sm:text-2xl">
              Built for long-term performance
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-solar-text-muted sm:text-base">
              Orientation, shading, and inverter efficiency shape your returns—we keep
              numbers transparent in your dashboard.
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3" role="list">
              {facts.map((row) => (
                <li
                  key={row.label}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center sm:text-left"
                >
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    {row.label}
                  </p>
                  <p className="mt-1 text-base font-semibold text-solar-accent sm:text-lg">
                    {row.value}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </HomeSection>

      <HomeSection>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow center>Partners</Eyebrow>
          <h2 className="text-lg font-bold uppercase tracking-tight text-white sm:text-2xl">
            Trusted by energy teams
          </h2>
          <p className="mt-3 text-sm text-solar-text-muted sm:text-base">
            Installers and portfolio owners who rely on transparent production data.
          </p>
        </div>
        <div className="mt-8 min-w-0 overflow-hidden">
          <ClientMarquee staticOnly dark />
        </div>
      </HomeSection>

      <section className="bg-black px-4 py-10 sm:px-5 sm:py-12 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-10 text-center sm:px-8 sm:py-12">
          <Eyebrow center>Next step</Eyebrow>
          <h2 className="text-lg font-bold uppercase tracking-tight text-white sm:text-2xl">
            Ready to earn?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-solar-text-muted sm:text-base">
            Deposit USDT, pick a VIP package, and watch daily profit credit to your wallet.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryLink href="/dashboard/packages">Browse packages</PrimaryLink>
            <Link
              href="/dashboard/deposit"
              className="text-sm font-semibold text-solar-accent hover:underline"
            >
              Deposit funds
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
