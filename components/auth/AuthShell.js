import Link from "next/link";
import { SOLAR_IMAGES } from "@/lib/solarImages";

/**
 * Auth wrapper — same visual system for login & register (photo, form width, accent).
 * @param {"login" | "register"} variant — badge label only
 */
export default function AuthShell({
  variant = "login",
  title,
  subtitle,
  children,
  footer,
}) {
  const isLogin = variant === "login";
  const bgImage = SOLAR_IMAGES.heroWide;
  const formMax = "w-full max-w-lg sm:max-w-xl";

  const accentOverlay =
    "radial-gradient(ellipse 90% 70% at 50% -20%, color-mix(in srgb, var(--solar-accent) 22%, transparent), transparent 55%), radial-gradient(ellipse 60% 50% at 100% 100%, color-mix(in srgb, var(--solar-accent-strong) 14%, transparent), transparent 50%)";

  return (
    <div className="relative flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-solar-bg-deep bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-solar-bg-deep via-solar-bg-deep/88 to-black/92"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-black/45 sm:bg-black/40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: accentOverlay }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.28]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      />

      <div className={`relative z-[2] ${formMax}`}>
        <div className="rounded-2xl bg-gradient-to-br from-solar-accent/45 via-solar-accent-strong/20 to-solar-accent/35 p-[1px] shadow-[0_40px_120px_-28px_rgba(0,0,0,0.95)]">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-solar-bg-card/92 px-6 py-9 shadow-2xl backdrop-blur-xl ring-1 ring-solar-accent/20 sm:px-10 sm:py-11">
            <div
              className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-solar-accent via-solar-accent to-solar-accent-strong/60"
              aria-hidden
            />
            <div className="relative pl-4 sm:pl-5">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-solar-text-muted sm:text-left">
                  Earning · Solar
                </p>
                <span className="shrink-0 rounded-full border border-solar-accent/40 bg-solar-accent/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-solar-accent">
                  {isLogin ? "Login" : "Register"}
                </span>
              </div>
              <h1 className="mt-5 text-center text-2xl font-bold uppercase tracking-tight text-solar-text sm:text-left sm:text-[1.7rem]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-center text-sm leading-relaxed text-solar-text-muted sm:text-left">
                  {subtitle}
                </p>
              ) : null}
              <div className="mt-8">{children}</div>
              {footer ? (
                <div className="mt-8 border-t border-solar-border pt-6 text-center text-sm text-solar-text-muted sm:text-left">
                  {footer}
                </div>
              ) : null}
              <div className="mt-6 flex flex-col gap-3 border-t border-solar-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/"
                  className="text-center text-xs font-medium text-solar-accent/90 underline-offset-4 transition hover:text-solar-accent hover:underline sm:text-left"
                >
                  ← Back to home
                </Link>
                <p className="text-center text-[11px] text-solar-text-muted sm:text-right">
                  {isLogin ? (
                    <>
                      New here?{" "}
                      <Link
                        href="/register"
                        className="font-semibold text-solar-accent hover:underline"
                      >
                        Register
                      </Link>
                    </>
                  ) : (
                    <>
                      Have an account?{" "}
                      <Link
                        href="/login"
                        className="font-semibold text-solar-accent hover:underline"
                      >
                        Login
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
