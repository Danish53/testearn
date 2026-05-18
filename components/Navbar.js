"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutUser } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function SunMark({ className = "" }) {
  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-solar-sun-soft ring-1 ring-solar-accent/30 ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-solar-sun" fill="currentColor">
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.59-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.59zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.59 1.59a.75.75 0 001.06 1.061l1.59-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.59a.75.75 0 00-1.061 1.06l1.59 1.59z" />
      </svg>
    </span>
  );
}

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, hydrated } = useAppSelector((s) => s.auth);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    await dispatch(logoutUser());
    router.refresh();
    router.replace("/login");
  }

  const showAuthed = hydrated && isAuthenticated && user;

  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className="sticky top-0 z-50 border-b border-solar-border bg-solar-bg-deep/75 backdrop-blur-md transition-[background-color,box-shadow,border-color] duration-300 data-[scrolled=true]:border-white/[0.12] data-[scrolled=true]:bg-solar-bg-deep/92 data-[scrolled=true]:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.65)]"
    >
      <div className="mx-auto flex h-14 min-h-[3.5rem] max-w-7xl items-center justify-between gap-3 px-3 sm:h-16 sm:min-h-0 sm:px-5 md:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 max-w-[65%] items-center gap-2 rounded-md outline-none ring-solar-accent focus-visible:ring-2 sm:max-w-none sm:gap-2.5"
        >
          <SunMark className="shrink-0 transition-transform duration-300 group-hover:scale-[1.03]" />
          <span className="truncate text-base font-semibold tracking-tight text-solar-text sm:text-lg md:text-xl">
            Earning
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {showAuthed ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-gradient-to-r from-solar-accent to-solar-accent-strong px-4 py-2 text-xs font-semibold text-solar-foreground-on-accent shadow-md shadow-solar-accent/20 transition hover:brightness-110 sm:px-5 sm:text-sm"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-[40px] items-center rounded-full border border-solar-border px-3.5 py-2 text-xs font-semibold text-solar-text transition hover:border-solar-accent/50 hover:text-solar-accent sm:px-4 sm:text-sm"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex min-h-[40px] items-center rounded-full border border-solar-border bg-transparent px-3.5 py-2 text-xs font-semibold text-solar-text transition hover:border-solar-accent/50 hover:bg-solar-bg-card/50 sm:min-h-0 sm:px-4 sm:text-sm"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="group inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-solar-text px-3.5 py-2 text-xs font-semibold text-solar-foreground-on-accent transition hover:bg-white sm:gap-2 sm:px-5 sm:text-sm md:text-[0.9375rem]"
              >
                Login
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
