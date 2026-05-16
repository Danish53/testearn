/** Single source for dashboard navigation (sidebar + mobile bottom bar + drawer) */
export const DASHBOARD_NAV = [
  {
    href: "/dashboard",
    label: "Overview",
    shortLabel: "Home",
    key: "overview",
  },
  {
    href: "/dashboard/packages",
    label: "Packages",
    shortLabel: "Plans",
    key: "packages",
  },
  {
    href: "/dashboard/team",
    label: "Team",
    shortLabel: "Team",
    key: "team",
  },
  {
    href: "/dashboard/deposit",
    label: "Deposit",
    shortLabel: "Deposit",
    key: "deposit",
  },
  {
    href: "/dashboard/withdraw",
    label: "Withdraw",
    shortLabel: "Withdraw",
    key: "withdraw",
  },
  {
    href: "/dashboard/history",
    label: "History",
    shortLabel: "History",
    key: "history",
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    shortLabel: "Profile",
    key: "profile",
  },
];

export function isNavActive(pathname, href) {
  if (href === "/dashboard")
    return pathname === "/dashboard" || pathname === "/dashboard/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Mobile bottom bar: 5 routes; index 2 = center (larger icon). Withdraw & History = sidebar/drawer only. */
export const MOBILE_BOTTOM_NAV = [
  DASHBOARD_NAV[0],
  DASHBOARD_NAV[2],
  DASHBOARD_NAV[1],
  DASHBOARD_NAV[3],
  DASHBOARD_NAV[6],
];
