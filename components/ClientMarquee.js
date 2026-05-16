"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SOLAR_IMAGES } from "@/lib/solarImages";

/** Solar-industry style partners — illustrative; swap logos in /public when you have rights */
export const CLIENTS = [
  {
    name: "Brightline Solar Partners",
    role: "Residential & small C&I",
    region: "California, USA",
    blurb:
      "Design-build crews for rooftop arrays under 500 kW, with shade analysis and permit packs included.",
    image: SOLAR_IMAGES.roof,
  },
  {
    name: "Meridian Power Services",
    role: "Utility-scale O&M",
    region: "Texas, USA",
    blurb:
      "Field technicians and drone IR for 100 MW+ sites—loss-factor reporting aligned to PPA obligations.",
    image: SOLAR_IMAGES.heroWide,
  },
  {
    name: "Summit PV Engineering",
    role: "Design & commissioning",
    region: "Colorado, USA",
    blurb:
      "Single-line diagrams, NEC grounding studies, and inverter start-up scripts for C&I portfolios.",
    image: SOLAR_IMAGES.install,
  },
  {
    name: "Horizon Field Services",
    role: "Site safety & construction",
    region: "Arizona, USA",
    blurb:
      "Lift plans, module handling SOPs, and daily production huddles for tracker and fixed-tilt installs.",
    image: SOLAR_IMAGES.roof,
  },
  {
    name: "Catalyst Renewables Advisory",
    role: "PPA & offtake advisory",
    region: "Northeast, USA",
    blurb:
      "Cash-flow models for community solar and behind-the-meter deals with hourly shape from PVGIS.",
    image: SOLAR_IMAGES.heroWide,
  },
  {
    name: "Nimbus Monitoring Group",
    role: "SCADA & fleet analytics",
    region: "Remote-first",
    blurb:
      "API feeds from major inverter OEMs normalized into one dashboard for fleet availability and PR.",
    image: SOLAR_IMAGES.install,
  },
  {
    name: "Keystone Industrial Solar",
    role: "Manufacturing rooftops",
    region: "Midwest, USA",
    blurb:
      "Structural stamps for ballasted systems, interconnection support, and demand-charge avoidance studies.",
    image: SOLAR_IMAGES.roof,
  },
  {
    name: "Altitude Clean Power",
    role: "Solar + storage hybrid",
    region: "Mountain West, USA",
    blurb:
      "AC-coupled retrofits and peak-shaving controls for co-ops and munis with winter snow load programs.",
    image: SOLAR_IMAGES.heroWide,
  },
];

function ClientCard({ name, role, region, blurb, image }) {
  return (
    <article
      data-client-card
      className="flex w-[min(88vw,300px)] shrink-0 snap-start snap-always flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.15)] sm:w-[320px]"
    >
      <div className="relative aspect-[16/10] w-full bg-slate-200">
        <Image
          src={image}
          alt={`${name} — representative solar installation`}
          fill
          className="object-cover"
          sizes="320px"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <p className="absolute bottom-2 left-3 right-3 text-[10px] font-medium uppercase tracking-wider text-white/90">
          {region}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-slate-900 sm:text-base">
          {name}
        </h3>
        <p className="mt-1 text-xs font-medium text-solar-accent">{role}</p>
        <p className="mt-3 line-clamp-3 text-[11px] leading-relaxed text-slate-600 sm:text-xs">
          {blurb}
        </p>
      </div>
    </article>
  );
}

export default function ClientMarquee() {
  const reduce = useReducedMotion();
  const scrollRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const loop = [...CLIENTS, ...CLIENTS];

  const setWidthHalf = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 0;
    return el.scrollWidth / 2;
  }, []);

  const stepSize = useCallback(() => {
    const el = scrollRef.current;
    const card = el?.querySelector("[data-client-card]");
    if (!card) return 324;
    const gap =
      typeof window !== "undefined"
        ? parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap || "24") ||
          24
        : 24;
    return card.getBoundingClientRect().width + gap;
  }, []);

  const scrollPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const half = setWidthHalf();
    const step = stepSize();
    if (el.scrollLeft < 80) el.scrollLeft += half;
    el.scrollBy({ left: -step, behavior: "smooth" });
  }, [setWidthHalf, stepSize]);

  const scrollNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const half = setWidthHalf();
    const step = stepSize();
    el.scrollBy({ left: step, behavior: "smooth" });
    window.setTimeout(() => {
      const box = scrollRef.current;
      if (!box) return;
      const h = box.scrollWidth / 2;
      if (box.scrollLeft >= h - 8) box.scrollLeft -= h;
    }, 380);
  }, [setWidthHalf, stepSize]);

  useEffect(() => {
    if (reduce || paused) return;
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const speed = 0.14;
    const tick = () => {
      if (!scrollRef.current) return;
      const box = scrollRef.current;
      const half = box.scrollWidth / 2;
      if (half <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      box.scrollLeft += speed;
      if (box.scrollLeft >= half - 1) box.scrollLeft -= half;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, paused]);

  if (reduce) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CLIENTS.slice(0, 6).map((c) => (
          <ClientCard key={c.name} {...c} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-12 bg-gradient-to-r from-slate-50 to-transparent sm:w-20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-12 bg-gradient-to-l from-slate-50 to-transparent sm:w-20"
        aria-hidden
      />

      <button
        type="button"
        onClick={scrollPrev}
        className="absolute left-1 top-1/2 z-[4] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:border-solar-accent/40 hover:bg-slate-50 hover:text-solar-accent sm:left-2 sm:h-12 sm:w-12"
        aria-label="Previous clients"
      >
        <span className="text-lg leading-none" aria-hidden>
          ‹
        </span>
      </button>
      <button
        type="button"
        onClick={scrollNext}
        className="absolute right-1 top-1/2 z-[4] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:border-solar-accent/40 hover:bg-slate-50 hover:text-solar-accent sm:right-2 sm:h-12 sm:w-12"
        aria-label="Next clients"
      >
        <span className="text-lg leading-none" aria-hidden>
          ›
        </span>
      </button>

      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] sm:gap-6 [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        role="region"
        aria-label="Solar industry clients carousel"
      >
        {loop.map((c, i) => (
          <ClientCard key={`${c.name}-${i}`} {...c} />
        ))}
      </div>
    </div>
  );
}
