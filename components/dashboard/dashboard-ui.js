/** Dark dashboard surfaces — matches DashboardShell gradient layout. */
export const DASH = {
  wrap: "mx-auto w-full max-w-6xl space-y-5 sm:space-y-6",
  titleRow: "flex items-start gap-3 sm:gap-4",
  iconBox:
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-solar-accent/15 text-solar-accent ring-1 ring-solar-accent/25 sm:h-12 sm:w-12 [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6",
  h1: "text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl",
  lead: "mt-1 text-sm text-slate-400 sm:text-base",
  card: "rounded-2xl border border-white/[0.08] bg-[#0b1018]/85 p-5 shadow-xl shadow-black/50 ring-1 ring-white/[0.05] backdrop-blur-md sm:p-6",
  cardMuted:
    "rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center text-sm text-slate-400 sm:p-8",
  sectionTitle: "text-base font-bold text-solar-accent sm:text-lg",
  /** Table / list shell without inner padding */
  panel:
    "overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1018]/85 shadow-xl shadow-black/50 ring-1 ring-white/[0.05] backdrop-blur-md",
  input:
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-solar-accent/50 focus:ring-2 focus:ring-solar-accent/20",
  label: "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500",
  btnPrimary:
    "flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-solar-accent to-solar-accent-strong text-sm font-semibold text-solar-foreground-on-accent shadow-lg shadow-solar-accent/25 transition hover:brightness-110 disabled:opacity-60",
  btnSecondary:
    "flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-sm font-semibold text-white transition hover:border-solar-accent/40 hover:bg-solar-accent/10",
  tab:
    "rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm",
  tabActive: "bg-solar-accent text-solar-foreground-on-accent shadow-md shadow-solar-accent/25",
  tabIdle: "text-slate-400 hover:bg-white/[0.06] hover:text-white",
};
