"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { DASHBOARD_NAV, isNavActive, MOBILE_BOTTOM_NAV } from "@/components/dashboard/nav-items";
import NavIcon from "@/components/dashboard/NavIcon";
import DashboardUserFooter from "@/components/dashboard/DashboardUserFooter";
import DashboardHeaderAvatar from "@/components/dashboard/DashboardHeaderAvatar";

/** Rounded brand mark — white tile + cyan “E” on dark sidebar */
const BRAND_LOGO =
  "https://ui-avatars.com/api/?name=E&background=ffffff&color=1facee&size=128&bold=true&format=png";

const SIDEBAR_W = "w-[min(94vw,340px)] lg:w-[300px] xl:w-[320px]";
const SIDEBAR_PL = "lg:pl-[300px] xl:pl-[320px]";

function SidebarNavLink({ item, onNavigate }) {
  const pathname = usePathname();
  const active = isNavActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`dash-sidebar-link ${active ? "dash-sidebar-link--active" : ""}`}
    >
      <NavIcon
        navKey={item.key}
        strokeWidth={active ? 2.25 : 2}
        className={`h-[22px] w-[22px] shrink-0 sm:h-6 sm:w-6 ${active ? "text-white" : "text-white/90"}`}
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </Link>
  );
}

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  const sidebarBrand = (
    <Link
      href="/"
      onClick={closeDrawer}
      className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-solar-accent/50"
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20 sm:h-11 sm:w-11">
        <Image
          src={BRAND_LOGO}
          alt="Earning"
          fill
          className="object-cover"
          sizes="44px"
          priority
        />
      </div>
      <div className="min-w-0 text-left leading-tight">
        <p className="truncate text-sm font-bold uppercase tracking-[0.12em] text-solar-accent sm:text-base">
          Earning
        </p>
        <p className="truncate text-[10px] font-medium uppercase tracking-[0.16em] text-white/80 sm:text-[11px]">
          Dashboard
        </p>
      </div>
    </Link>
  );

  const sidebarInner = (
    <>
      <header className="hidden shrink-0 border-b border-white/[0.08] px-5 pb-6 pt-7 sm:px-6 sm:pb-7 sm:pt-8 lg:block">
        {sidebarBrand}
      </header>

      <div className="dash-sidebar-nav-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        <nav className="dash-sidebar-nav" aria-label="Main">
          {DASHBOARD_NAV.map((item) => (
            <div key={item.href} className="dash-sidebar-nav__item">
              <SidebarNavLink item={item} onNavigate={closeDrawer} />
            </div>
          ))}
        </nav>
      </div>

      <DashboardUserFooter onNavigate={closeDrawer} />
    </>
  );

  const sidebarChrome =
    `dash-sidebar flex h-dvh flex-col overflow-hidden border-r border-white/[0.06] ${SIDEBAR_W}`;

  return (
    <div className="relative isolate flex min-h-dvh overflow-hidden bg-[#030508] text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_70%_-10%,color-mix(in_srgb,var(--solar-accent)_28%,transparent),transparent_55%),radial-gradient(ellipse_90%_60%_at_0%_100%,color-mix(in_srgb,var(--solar-accent)_12%,transparent),transparent_50%),linear-gradient(180deg,#0c121c_0%,#070b12_38%,#04060a_100%)]"
      />
      <div className="relative z-10 min-h-dvh w-full">
        {/* Desktop: fixed sidebar — main column scrolls independently */}
        <aside className={`fixed left-0 top-0 z-[25] hidden ${sidebarChrome} lg:flex`}>{sidebarInner}</aside>

        <div
          className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden ${
            drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!drawerOpen}
          onClick={closeDrawer}
        />
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out lg:hidden ${sidebarChrome} ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 pb-3.5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pb-4">
            {sidebarBrand}
            <button
              type="button"
              onClick={closeDrawer}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{sidebarInner}</div>
        </aside>

        <div className={`flex min-h-dvh min-w-0 flex-col ${SIDEBAR_PL}`}>
          <header className="sticky top-0 z-30 shrink-0 border-b border-white/[0.08] bg-[#0a0f18]/85 shadow-lg shadow-black/25 backdrop-blur-xl">
            <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4 lg:px-6">
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-solar-accent/40 hover:bg-white/10 hover:text-solar-accent lg:hidden"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              </button>

              <div className="flex min-w-0 flex-1 justify-center px-0.5 sm:px-2">
                <div className="relative w-full max-w-2xl">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 sm:left-3.5 sm:h-[18px] sm:w-[18px]"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <input
                    type="search"
                    name="dashboard-search"
                    placeholder="Search here"
                    className="w-full rounded-full border border-white/10 bg-white/[0.06] py-2 pl-9 pr-3 text-xs text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-solar-accent/50 focus:bg-white/10 focus:ring-2 focus:ring-solar-accent/25 sm:py-2.5 sm:pl-10 sm:text-sm"
                    autoComplete="off"
                  />
                </div>
              </div>

              <DashboardHeaderAvatar />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-3 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-5 sm:py-6 lg:px-8 lg:pb-8">
            {children}
          </main>
        </div>

        <nav
          className="fixed bottom-0 left-0 right-0 z-[35] border-t border-white/10 bg-[#070b12]/95 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-12px_40px_-6px_rgba(0,0,0,0.6)] backdrop-blur-xl lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto flex max-w-lg items-end justify-between gap-0.5 px-1.5 pt-0.5">
            {MOBILE_BOTTOM_NAV.map((item, index) => {
              const active = isNavActive(pathname, item.href);
              const isCenter = index === 2;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-w-0 flex-1 flex-col items-center ${isCenter ? "-mt-3 pb-0.5" : "py-1 pb-1"}`}
                >
                  {isCenter ? (
                    <>
                      <span
                        className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-solar-accent to-solar-accent-strong shadow-lg shadow-solar-accent/35 ring-2 ring-white/15 transition ${
                          active ? "ring-solar-accent/80 brightness-110" : ""
                        }`}
                      >
                        <NavIcon
                          navKey={item.key}
                          strokeWidth={2.25}
                          className="h-7 w-7 text-white"
                        />
                      </span>
                      <span
                        className={`mt-1 max-w-full truncate px-0.5 text-[9px] font-bold leading-tight ${
                          active ? "text-solar-accent" : "text-slate-400"
                        }`}
                      >
                        {item.shortLabel}
                      </span>
                    </>
                  ) : (
                    <>
                      <NavIcon
                        navKey={item.key}
                        strokeWidth={2}
                        className={`h-[22px] w-[22px] shrink-0 ${active ? "text-solar-accent" : "text-slate-500"}`}
                      />
                      <span
                        className={`mt-0.5 max-w-full truncate px-0.5 text-[9px] font-semibold leading-tight sm:text-[10px] ${
                          active ? "text-solar-accent" : "text-slate-500"
                        }`}
                      >
                        {item.shortLabel}
                      </span>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
