"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import ClientMarquee from "@/components/ClientMarquee";
import { SOLAR_IMAGES } from "@/lib/solarImages";
import {
  EASE_OUT,
  VIEWPORT,
  fadeUp,
  fadeScale,
  slideAxis,
} from "@/lib/solarMotion";

const benefits = [
  {
    title: "Lower bills, predictable output",
    body: "Modern PV systems convert sunlight into usable electricity at home or for your business, reducing grid dependence over decades.",
  },
  {
    title: "Grid-tied & storage-ready",
    body: "Pair panels with smart inverters and optional batteries to use solar when you need it—even after sunset.",
  },
  {
    title: "Track performance digitally",
    body: "Monitoring apps show production in real time so you can see savings and system health from your phone.",
  },
];

const facts = [
  { label: "Typical payback", value: "5–10 yrs" },
  { label: "Panel warranty", value: "25+ yrs" },
  { label: "CO₂ avoided", value: "Tonnes / yr" },
];

/** Dashboard home: no motion props, black sections, tighter top spacing */
function animProps(embedded, props) {
  return embedded ? {} : props;
}

function MediaFrame({ children, className = "" }) {
  return (
    <div
      className={`relative isolate w-full max-w-full overflow-hidden ring-1 ring-white/[0.06] bg-solar-bg-card ${className}`}
    >
      {children}
    </div>
  );
}

function SectionEyebrow({ children, align = "start" }) {
  if (align === "center") {
    return (
      <span className="mb-3 block text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-solar-accent sm:text-[11px]">
        {children}
      </span>
    );
  }
  return (
    <span className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-solar-accent sm:text-[11px]">
      <span className="h-px w-6 bg-solar-accent/50 sm:w-8" aria-hidden />
      {children}
    </span>
  );
}

/** Editorial-style solar imagery — captions, glass badge, depth, hover zoom */
function ShowcaseEditorial({
  src,
  alt,
  sizes,
  clipClass,
  aspectClass,
  step,
  headline,
  subline,
  tag,
  priority = false,
  disableZoom = false,
}) {
  return (
    <figure className="group/showcase relative m-0 w-full">
      <div
        className={`relative  bg-[#05070c] shadow-[0_44px_120px_-48px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.06)_inset] ring-1 ring-white/[0.07] ${clipClass}`}
      >
        <div className={`relative w-full ${aspectClass}`}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={`object-cover object-center transition-[transform,filter] duration-[1.05s] ease-out will-change-transform ${
              disableZoom
                ? ""
                : "group-hover/showcase:scale-[1.04] group-hover/showcase:brightness-[1.03]"
            }`}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_85%_0%,color-mix(in_srgb,var(--solar-accent)_18%,transparent),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-solar-bg-deep/35 via-transparent to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-solar-bg-deep/95 via-solar-bg-deep/25 to-transparent"
            aria-hidden
          />
          <div className="absolute right-3 top-3 sm:right-5 sm:top-5">
            <span className="inline-flex items-center rounded-md border border-white/15 bg-black/50 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/95 shadow-lg shadow-black/40 backdrop-blur-md sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
              {tag}
            </span>
          </div>
          <figcaption className="absolute inset-x-0 bottom-0 space-y-1.5 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-4 pb-4 pt-20 sm:space-y-2 sm:px-6 sm:pb-6 sm:pt-24">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-solar-accent sm:text-[11px]">
              {step}
            </span>
            <h3 className="max-w-lg text-pretty text-lg font-semibold leading-tight tracking-tight text-white sm:text-xl md:text-2xl">
              {headline}
            </h3>
            <p className="max-w-xl text-pretty text-xs leading-relaxed text-white/78 sm:text-sm">
              {subline}
            </p>
          </figcaption>
        </div>
      </div>
    </figure>
  );
}

export default function SolarLanding({ embedded = false }) {
  const reduceMotion = useReducedMotion();
  const reduce = embedded || reduceMotion;
  const vFadeUp = fadeUp(reduce);
  const vFadeUpSm = fadeUp(reduce, 22);
  const vScale = fadeScale(reduce);
  const vSlideL = slideAxis(reduce, reduce ? 0 : -44);
  const vSlideR = slideAxis(reduce, reduce ? 0 : 44);

  const darkSection =
    "section-frame relative overflow-hidden border-b border-white/10 bg-black";
  const darkSectionDefault =
    "section-frame relative overflow-hidden border-b border-solar-border bg-solar-bg-deep";
  const lightSection = embedded
    ? darkSection
    : "section-frame-light relative bg-white";
  const sectionPy = embedded ? "py-12 sm:py-16 lg:py-20" : "py-14 sm:py-20 lg:py-28";
  const sectionPyMd = embedded ? "py-12 sm:py-14 lg:py-16" : "py-14 sm:py-16 lg:py-24";
  const heroInner = embedded
    ? "relative mx-auto max-w-7xl px-4 pb-12 pt-0 sm:px-5 sm:pb-14 sm:pt-1 md:px-6 lg:px-8"
    : "relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-5 sm:pb-20 sm:pt-24 md:px-6 lg:px-8 lg:pb-24 lg:pt-28";
  const ink = embedded ? "text-solar-text" : "text-slate-900";
  const inkMuted = embedded ? "text-solar-text-muted" : "text-slate-600";
  const cardOnLight = embedded
    ? "border-white/10 bg-white/[0.04]"
    : "border-slate-200 bg-slate-50";

  const heroParent = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.1,
        delayChildren: reduce ? 0 : 0.06,
      },
    },
  };

  const staggerCards = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.11,
        delayChildren: reduce ? 0 : 0.06,
      },
    },
  };

  const cardItem = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.5, ease: EASE_OUT },
    },
  };

  return (
    <div
      className={`flex min-h-0 w-full flex-col ${
        embedded ? "dash-landing-embed overflow-x-hidden bg-black" : "max-w-[100vw]"
      }`}
    >
      {/* Hero — split layout + flagship solar imagery */}
      <section className={embedded ? darkSection : darkSectionDefault}>
        {!embedded ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse 85% 55% at 15% 20%, var(--solar-glow), transparent 50%), radial-gradient(ellipse 70% 50% at 100% 0%, color-mix(in srgb, var(--solar-accent) 12%, transparent), transparent 45%)",
            }}
          />
        ) : null}
        <div className={heroInner}>
          <div
            className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-14"
            {...animProps(embedded, {
              variants: heroParent,
              initial: "hidden",
              animate: "visible",
            })}
          >
            {/* Copy column */}
            <div
              className="order-2 flex min-w-0 flex-col justify-center lg:order-1 lg:col-span-5 xl:col-span-5"
              variants={heroParent}
            >
              <div variants={vFadeUpSm}>
                <SectionEyebrow>Overview</SectionEyebrow>
              </div>
              <h1
                variants={vFadeUp}
                className="text-balance text-2xl font-bold uppercase leading-[1.08] tracking-[-0.02em] text-solar-text sm:text-3xl sm:leading-[1.05] md:text-4xl md:tracking-tight lg:text-[2.35rem] lg:leading-[1.06] xl:text-5xl"
              >
                <span className="block">Invest in the sun</span>
                <span className="mt-1 block bg-gradient-to-r from-solar-text via-solar-text to-solar-accent bg-clip-text text-transparent sm:mt-1.5">
                  Power your future
                </span>
              </h1>
              <p
                variants={vFadeUp}
                className="mt-5 max-w-lg text-sm leading-relaxed text-solar-text-muted sm:mt-6 sm:text-base"
              >
                Premium solar education and earnings tools—structured like a
                product you trust, with clarity at every step.
              </p>

              <div
                variants={vFadeUpSm}
                className="mt-6 flex w-full max-w-full flex-col gap-0 overflow-hidden rounded-lg border border-solar-border text-[10px] font-semibold uppercase tracking-[0.12em] text-solar-text shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:mt-7 sm:flex-row sm:text-xs md:text-sm"
              >
                <span className="shrink-0 bg-solar-accent px-3 py-2.5 text-center text-solar-foreground-on-accent sm:py-2.5 sm:text-left sm:tracking-wide">
                  New
                </span>
                <span className="min-w-0 bg-solar-bg-card/95 px-3 py-2.5 text-center leading-snug backdrop-blur-sm sm:flex-1 sm:py-2.5 sm:text-left">
                  Fully trackable solar earnings
                </span>
              </div>

              <p
                variants={vFadeUpSm}
                className="mt-5 max-w-xl text-pretty text-sm leading-relaxed text-solar-text-muted sm:text-base md:text-lg"
              >
                Learn how photovoltaic systems work, what affects savings, and
                how monitoring ties production to real-world returns—before you
                open your dashboard.
              </p>

              <div
                variants={vFadeUpSm}
                className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              >
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-solar-accent to-solar-accent-strong px-8 text-sm font-semibold text-solar-foreground-on-accent shadow-lg shadow-solar-accent/25 transition hover:brightness-110 sm:w-auto"
                >
                  Open dashboard
                  <span aria-hidden>→</span>
                </Link>
              </div>

              <div
                variants={vFadeUpSm}
                className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-solar-border/80 pt-6 text-xs text-solar-text-muted sm:gap-x-6 sm:text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-solar-accent">4.9/5</span>
                  <span className="text-solar-accent" aria-hidden>
                    ★★★★★
                  </span>
                  <span className="text-solar-text-muted/90">Rated experience</span>
                </div>
                <span className="hidden h-4 w-px bg-solar-border sm:block" aria-hidden />
                <span className="text-solar-text-muted/90">Solar hub · Solar Earning</span>
              </div>
            </div>

            {/* Hero image */}
            <div
              className="order-1 min-w-0 lg:order-2 lg:col-span-7 xl:col-span-7"
              variants={vScale}
            >
              <div className="group/hero relative overflow-hidden rounded-2xl bg-[#05070c] shadow-[0_40px_100px_-36px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.08] clip-solar-hero-left">
                <div className="relative aspect-[16/10] min-h-[220px] w-full sm:min-h-[280px] lg:aspect-[5/4] lg:min-h-[380px] xl:min-h-[440px]">
                  <Image
                    src={SOLAR_IMAGES.heroWide}
                    alt="Large-scale solar panel installation at sunrise"
                    fill
                    className="object-cover object-center transition duration-700 ease-out group-hover/hero:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    priority
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_70%_at_100%_0%,color-mix(in_srgb,var(--solar-accent)_20%,transparent),transparent_60%)]"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-solar-bg-deep via-solar-bg-deep/20 to-transparent to-65%"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-solar-bg-deep/80 via-transparent to-transparent sm:from-solar-bg-deep/50"
                    aria-hidden
                  />
                  <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
                    <span className="inline-flex items-center rounded-md border border-white/15 bg-black/45 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/95 shadow-lg backdrop-blur-md sm:px-3 sm:text-[10px]">
                      Featured
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-stretch justify-between gap-2 sm:bottom-4 sm:left-4 sm:right-4">
                    <div className="rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 shadow-lg backdrop-blur-md sm:px-4 sm:py-3">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-solar-accent sm:text-[10px]">
                        Field scale
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white sm:text-base">
                        Utility-grade arrays
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 shadow-lg backdrop-blur-md sm:px-4 sm:py-3">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-solar-accent sm:text-[10px]">
                        Monitoring
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white sm:text-base">
                        Live production
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual strip — light band */}
      <section className={`${lightSection} ${sectionPyMd}`}>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(226 232 240) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
          aria-hidden
        />

        <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-8 text-slate-900 lg:mb-14 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div
              className="max-w-2xl"
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              variants={fadeUp(reduce, 20)}
            >
              <SectionEyebrow>Showcase</SectionEyebrow>
              <h2 className="text-xl font-bold uppercase tracking-tight sm:text-2xl md:text-3xl">
                Field-grade visuals.
                <span className="mt-2 block text-sm font-semibold normal-case tracking-normal text-slate-600 sm:mt-2.5 sm:text-base md:text-lg">
                  Human-scale story.
                </span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Curated photography, editorial overlays, and chamfered frames—so
                production energy still feels approachable on every screen size.
              </p>
            </div>
            <div
              className="flex shrink-0 flex-wrap gap-3 sm:gap-4 lg:justify-end"
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              variants={fadeUp(reduce, 16)}
            >
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left shadow-sm sm:px-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Capture
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                  Print-ready contrast
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left shadow-sm sm:px-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Layout
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                  Asymmetric grid
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto grid w-full min-w-0 gap-8 sm:gap-9 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-10">
            <div
              className="min-w-0 lg:col-span-7"
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              variants={vSlideL}
            >
              <ShowcaseEditorial
                src={SOLAR_IMAGES.heroWide}
                alt="Rows of solar panels in a large installation"
                sizes="(max-width: 1024px) 100vw, 58vw"
                clipClass="clip-solar-hero-left"
                aspectClass="aspect-[4/3] min-h-[200px] sm:aspect-[16/10] sm:min-h-[240px] lg:aspect-[16/11] lg:min-h-[280px]"
                step="01 — Utility scale"
                headline="Megawatt fields, engineered for decades"
                subline="Wide rows, tracker-ready spacing, and clean sightlines—built for portfolios that care about yield and land stewardship."
                tag="Featured"
                priority
                disableZoom={embedded || reduce}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-7 sm:gap-8 lg:col-span-5">
              <div
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                variants={vSlideR}
              >
                <ShowcaseEditorial
                  src={SOLAR_IMAGES.roof}
                  alt="Solar panels installed on a residential roof"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  clipClass="clip-solar-hero-right"
                  aspectClass="aspect-[4/3] min-h-[200px] sm:aspect-[16/10] sm:min-h-[220px] lg:aspect-[4/5] lg:min-h-[300px]"
                  step="02 — Rooftop"
                  headline="Precision installs on real homes"
                  subline="Flush arrays, hidden conduit runs, and inverter placement that respects your roofline—where craft meets kilowatts."
                  tag="Residential"
                  disableZoom={embedded || reduce}
                />
              </div>

            </div>
            
          </div>
          
          <div
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                variants={vScale}
                transition={{ delay: reduce ? 0 : 0.08 }}
                className="relative mt-32 rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-md sm:p-7"
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 sm:w-full rounded-full blur-3xl"
                  style={{ background: "var(--solar-glow)" }}
                  aria-hidden
                />
                <div className="relative">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-solar-accent">
                    Context
                  </p>
                  <h3 className="mt-2 text-base font-semibold tracking-tight text-slate-900 sm:text-lg md:text-xl">
                    Rooftop & utility-scale solar
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                    From compact arrays to wide fields—the same physics: photons
                    free electrons in silicon, inverters shape clean AC for your
                    site or the grid.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-5 sm:mt-6 sm:gap-3 sm:pt-6">
                    <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-600 sm:text-[11px]">
                      PV modules
                    </span>
                    <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-600 sm:text-[11px]">
                      Inverters
                    </span>
                    <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-600 sm:text-[11px]">
                      Monitoring
                    </span>
                  </div>
                  <div
                    {...animProps(embedded, {
                      whileHover: { scale: 1.02 },
                      whileTap: { scale: 0.98 },
                      transition: { type: "spring", stiffness: 420, damping: 28 },
                    })}
                    className="mt-6 sm:mt-7"
                  >
                    <Link
                      href="/dashboard"
                      className="inline-flex w-full min-h-[46px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-solar-accent to-solar-accent-strong px-6 py-3 text-sm font-semibold text-solar-foreground-on-accent shadow-lg shadow-solar-accent/25 transition hover:brightness-110 sm:w-auto sm:px-9"
                    >
                      Go to dashboard
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              </div>
        </div>
      </section>

      {/* Why solar — dark band */}
      <section className={`${embedded ? darkSection : "section-frame border-b border-solar-border bg-solar-bg-deep"} ${sectionPy}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8">
          <div
            className="max-w-2xl"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            variants={fadeUp(reduce, 24)}
          >
            <SectionEyebrow>Fundamentals</SectionEyebrow>
            <h2 className="text-xl font-bold uppercase tracking-tight text-solar-text sm:text-2xl md:text-3xl">
              Why solar matters
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-solar-text-muted sm:text-base md:text-lg">
              Solid fundamentals help you earn with confidence—whether you buy
              equipment, lease a system, or join community solar programs.
            </p>
          </div>

          <ul
            className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
            variants={staggerCards}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            {benefits.map((item) => (
              <li
                key={item.title}
                variants={cardItem}
                {...animProps(embedded, {
                  whileHover: {
                    y: -4,
                    borderColor: "rgba(31, 172, 238, 0.35)",
                    transition: { duration: 0.22, ease: EASE_OUT },
                  },
                })}
                className="rounded-xl border border-solar-border bg-solar-bg-card/90 p-5 transition-colors sm:p-6"
              >
                <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-solar-accent to-solar-accent-strong" />
                <h3 className="text-sm font-semibold tracking-tight text-solar-text sm:text-base">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-solar-text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Image + stats — light band */}
      <section className={`${lightSection} border-y ${embedded ? "border-white/10" : "border-slate-200"} ${sectionPy}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="grid items-center gap-10 text-slate-900 sm:gap-12 lg:grid-cols-2 lg:gap-16">
            <div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              variants={vSlideL}
            >
              <MediaFrame className="aspect-[4/3] ring-slate-200 sm:aspect-[16/10] lg:aspect-[16/11]">
                <Image
                  src={SOLAR_IMAGES.install}
                  alt="Technician working on solar panel installation"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </MediaFrame>
            </div>

            <div
              className="min-w-0"
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              variants={vSlideR}
            >
              <SectionEyebrow>Longevity</SectionEyebrow>
              <h2 className="text-xl font-bold uppercase tracking-tight sm:text-2xl md:text-3xl">
                Built for long-term performance
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base md:text-lg">
                Orientation, shading, inverter efficiency, and local rates shape
                your returns. After login, we surface those drivers so numbers stay
                transparent—not guesswork.
              </p>
              <div
                className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4"
                variants={staggerCards}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                role="list"
                aria-label="Performance highlights"
              >
                {facts.map((row) => (
                  <div
                    key={row.label}
                    variants={cardItem}
                    role="listitem"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center sm:py-5 sm:text-left"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:text-xs">
                      {row.label}
                    </p>
                    <p className="mt-1.5 text-base font-semibold text-solar-accent sm:text-lg md:text-xl">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients — animated marquee */}
      <section className={`${lightSection} relative overflow-hidden border-y ${embedded ? "border-white/10" : "border-slate-200"} ${sectionPyMd}`}>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(203 213 225) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden
        />
        <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8">
          <div
            className="mx-auto mb-10 max-w-2xl text-center sm:mb-12 lg:mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            variants={fadeUp(reduce, 20)}
          >
            <SectionEyebrow align="center">Clients</SectionEyebrow>
            <h2 className="mt-2 text-xl font-bold uppercase tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
              Trusted by energy teams
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              From installers to portfolio owners—partners who care about
              transparent production data and long-term performance.
            </p>
          </div>
          <div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: reduce ? 0 : 0.55, ease: EASE_OUT }}
          >
            <ClientMarquee staticOnly={embedded} dark={embedded} />
          </div>
        </div>
      </section>

      {/* CTA — dark band */}
      <section className="section-frame border-b border-solar-border bg-solar-bg-deep py-14 sm:py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8">
          <div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            variants={vScale}
            className="relative  rounded-2xl border border-solar-border bg-solar-bg-card px-5 py-12 text-center shadow-[0_32px_120px_-40px_rgba(0,0,0,0.75)] sm:px-10 sm:py-14 md:px-12 md:py-16"
          >
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
              style={{ background: "var(--solar-glow)" }}
            />
            <div
              className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "var(--solar-glow)" }}
            />
            <div className="relative">
              <div
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                variants={heroParent}
              >
                <div variants={vFadeUpSm}>
                  <SectionEyebrow align="center">Next step</SectionEyebrow>
                </div>
                <h2
                  variants={vFadeUp}
                  className="text-xl font-bold uppercase tracking-tight text-solar-text sm:text-2xl md:text-3xl"
                >
                  Ready when you are
                </h2>
                <p
                  variants={vFadeUp}
                  className="mx-auto mt-4 max-w-xl text-sm text-solar-text-muted sm:text-base md:text-lg"
                >
                  Explore solar fundamentals here, then open your dashboard to
                  track deposits, packages, and earnings in one place.
                </p>
                <div variants={vFadeUpSm} className="mt-8 sm:mt-10">
                  <div
                    {...animProps(embedded, {
                      whileHover: { scale: 1.03 },
                      whileTap: { scale: 0.97 },
                      transition: { type: "spring", stiffness: 400, damping: 22 },
                    })}
                    className="inline-block"
                  >
                    <Link
                      href="/dashboard"
                      className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-solar-text px-8 py-3 text-sm font-semibold text-solar-foreground-on-accent shadow-lg shadow-black/35 transition-colors hover:bg-white sm:text-base"
                    >
                      Open dashboard
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer
        className={`section-frame relative border-t border-white/[0.06] px-4 py-12 sm:px-6 sm:py-14 lg:px-8 ${embedded ? "bg-black" : "bg-solar-bg-deep"}`}
        {...animProps(embedded, {
          initial: "hidden",
          whileInView: "visible",
          viewport: VIEWPORT,
          variants: fadeUp(reduce, 12),
        })}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-solar-accent/30 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-solar-accent">
                Solar Earning
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-solar-text sm:text-xl">
                Solar insights &amp; tools
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-solar-text-muted">
                Learn, track, and grow with a single brand colour—built for clarity
                from landing to dashboard.
              </p>
            </div>
            <nav
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-solar-border pt-6 text-sm font-medium text-solar-text-muted sm:justify-end sm:border-t-0 sm:pt-0"
              aria-label="Footer"
            >
              <Link href="/dashboard/packages" className="transition hover:text-solar-accent">
                Packages
              </Link>
              <Link href="/dashboard/deposit" className="transition hover:text-solar-accent">
                Deposit
              </Link>
              {!embedded ? (
                <Link href="/login" className="transition hover:text-solar-accent">
                  Login
                </Link>
              ) : null}
            </nav>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-solar-border pt-8 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-solar-text-muted sm:text-sm">
              © {new Date().getFullYear()} Solar Earning. All rights reserved.
            </p>
            <p className="text-[11px] text-solar-text-muted/80">
              Solar information · Educational use
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
