/** Dark dashboard surfaces — mobile-first; scales up at sm/md/lg. */
export const DASH = {
  wrap: "mx-auto w-full min-w-0 max-w-6xl space-y-5 sm:space-y-7",
  titleRow: "flex items-start gap-2.5 sm:gap-4",
  iconBox:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-solar-accent/15 text-solar-accent ring-1 ring-solar-accent/25 sm:h-12 sm:w-12 [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-6 sm:[&>svg]:w-6",
  h1: "text-lg font-bold tracking-tight text-white sm:text-2xl lg:text-3xl",
  lead: "mt-2 text-xs leading-relaxed text-slate-400 sm:mt-2.5 sm:text-base",
  card: "rounded-2xl border border-white/[0.08] bg-[#0b1018]/85 p-5 shadow-xl shadow-black/50 ring-1 ring-white/[0.05] backdrop-blur-md sm:p-7",
  cardMuted:
    "rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5 text-center text-sm text-slate-400 sm:p-8",
  sectionTitle: "text-sm font-bold text-solar-accent sm:text-lg",
  panel:
    "overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1018]/85 shadow-xl shadow-black/50 ring-1 ring-white/[0.05] backdrop-blur-md",
  input:
    "w-full min-w-0 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-solar-accent/50 focus:ring-2 focus:ring-solar-accent/20 sm:px-4 sm:text-sm",
  label: "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500",
  btnPrimary:
    "flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-solar-accent to-solar-accent-strong px-4 text-sm font-semibold text-solar-foreground-on-accent shadow-lg shadow-solar-accent/25 transition hover:brightness-110 disabled:opacity-60",
  btnSecondary:
    "flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-sm font-semibold text-white transition hover:border-solar-accent/40 hover:bg-solar-accent/10 sm:w-auto",
  btnRow: "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3",
  grid2: "grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:gap-5",
  grid3: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5",
  filterScroll: "dash-filter-scroll -mx-1 px-1",
  tableWrap: "dash-table-wrap",
  listMobile: "divide-y divide-white/[0.08] md:hidden",
  listMobileItem: "px-3 py-3.5 sm:px-4 sm:py-4",
  tab: "shrink-0 rounded-lg px-3 py-2.5 text-xs font-semibold transition min-h-[44px] sm:min-h-0 sm:px-4 sm:py-2 sm:text-sm",
  tabActive: "bg-solar-accent text-solar-foreground-on-accent shadow-md shadow-solar-accent/25",
  tabIdle: "text-slate-400 hover:bg-white/[0.06] hover:text-white",
};
