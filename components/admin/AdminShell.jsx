"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, LogOut, Menu, Shield, X } from "lucide-react";
import { ADMIN_NAV, isAdminNavActive } from "@/components/admin/admin-nav";
import BrandMark, { PLATFORM_NAME } from "@/components/BrandMark";

const SIDEBAR_W = "w-[min(92vw,320px)] lg:w-[280px] xl:w-[300px]";
const SIDEBAR_PL = "lg:pl-[280px] xl:pl-[300px]";

function AdminNavLink({ item, onNavigate }) {
  const pathname = usePathname();
  const active = isAdminNavActive(pathname, item.href, item.exact);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`dash-sidebar-link ${active ? "dash-sidebar-link--active" : ""}`}
    >
      <Icon
        strokeWidth={active ? 2.25 : 2}
        className={`h-[22px] w-[22px] shrink-0 sm:h-6 sm:w-6 ${active ? "text-white" : "text-white/90"}`}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </Link>
  );
}

export default function AdminShell({ children, adminEmail }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pageTitle =
    ADMIN_NAV.find((n) => isAdminNavActive(pathname, n.href, n.exact))?.label || "Admin";

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

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  const sidebarBrand = (
    <Link
      href="/admin"
      onClick={closeDrawer}
      className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-solar-accent/50"
    >
      <div className="relative shrink-0">
        <BrandMark size="lg" />
        <Shield
          className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-solar-accent-strong p-0.5 text-white ring-2 ring-[#0a1018]"
          aria-hidden
        />
      </div>
      <div className="min-w-0 text-left leading-tight">
        <p className="truncate text-sm font-bold uppercase tracking-[0.1em] text-solar-accent">
          {PLATFORM_NAME}
        </p>
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
          Admin panel
        </p>
      </div>
    </Link>
  );

  const sidebarInner = (
    <>
      <header className="hidden shrink-0 border-b border-white/[0.08] px-5 pb-5 pt-7 lg:block">
        {sidebarBrand}
      </header>

      <div className="dash-sidebar-nav-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <nav className="dash-sidebar-nav" aria-label="Admin">
          {ADMIN_NAV.map((item) => (
            <div key={item.href} className="dash-sidebar-nav__item">
              <AdminNavLink item={item} onNavigate={closeDrawer} />
            </div>
          ))}
        </nav>
      </div>

      <footer className="shrink-0 space-y-3 border-t border-white/[0.08] p-4 sm:p-5">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Signed in</p>
          <p className="mt-1 truncate text-sm font-medium text-white">{adminEmail || "Admin"}</p>
        </div>
        <Link
          href="/dashboard"
          onClick={closeDrawer}
          className="dash-sidebar-link !ml-4 !mr-3 !py-3 text-sm"
        >
          <ExternalLink className="h-5 w-5 shrink-0 text-white/80" aria-hidden />
          <span>User dashboard</span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-semibold text-slate-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Log out
        </button>
      </footer>
    </>
  );

  const sidebarChrome = `dash-sidebar flex h-dvh flex-col overflow-hidden border-r border-white/[0.06] ${SIDEBAR_W}`;

  return (
    <div className="relative isolate flex min-h-dvh overflow-hidden bg-[#030508] text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_70%_at_100%_-5%,color-mix(in_srgb,var(--solar-accent)_22%,transparent),transparent_50%),radial-gradient(ellipse_80%_50%_at_0%_100%,color-mix(in_srgb,var(--solar-accent)_10%,transparent),transparent_45%),linear-gradient(180deg,#0c121c_0%,#070b12_40%,#04060a_100%)]"
      />

      <div className="relative z-10 min-h-dvh w-full">
        <aside className={`fixed left-0 top-0 z-[25] hidden ${sidebarChrome} lg:flex`}>
          {sidebarInner}
        </aside>

        <div
          className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity lg:hidden ${
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
          <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 pb-3.5 pt-[max(0.75rem,env(safe-area-inset-top))]">
            {sidebarBrand}
            <button
              type="button"
              onClick={closeDrawer}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{sidebarInner}</div>
        </aside>

        <div className={`flex min-h-dvh min-w-0 flex-col ${SIDEBAR_PL}`}>
          <header className="sticky top-0 z-30 shrink-0 border-b border-white/[0.08] bg-[#0a0f18]/90 shadow-lg shadow-black/30 backdrop-blur-xl">
            <div className="flex h-14 items-center gap-3 px-3 sm:h-16 sm:px-5 lg:px-8">
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-solar-accent/40 hover:text-solar-accent lg:hidden"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              </button>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-solar-accent">
                  Administrator
                </p>
                <h1 className="truncate text-base font-bold text-white sm:text-lg">{pageTitle}</h1>
              </div>

              <button
                type="button"
                onClick={logout}
                className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:text-white sm:inline-flex"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="hidden md:inline">Log out</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-3 py-5 pb-[calc(5.25rem+env(safe-area-inset-bottom))] sm:px-5 sm:py-7 lg:px-8 lg:pb-10">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>

        <nav
          className="fixed bottom-0 left-0 right-0 z-[35] border-t border-white/10 bg-[#070b12]/95 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-16px_48px_-8px_rgba(0,0,0,0.65)] backdrop-blur-xl lg:hidden"
          aria-label="Admin mobile navigation"
        >
          <div className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2">
            {ADMIN_NAV.map((item) => {
              const active = isAdminNavActive(pathname, item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl py-2 transition ${
                    active ? "bg-solar-accent/15" : ""
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${active ? "text-solar-accent" : "text-slate-500"}`}
                    strokeWidth={active ? 2.25 : 2}
                    aria-hidden
                  />
                  <span
                    className={`mt-1 text-[10px] font-bold ${active ? "text-solar-accent" : "text-slate-500"}`}
                  >
                    {item.shortLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
