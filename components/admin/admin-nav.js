import { ArrowLeftRight, BarChart3 } from "lucide-react";

export const ADMIN_NAV = [
  {
    href: "/admin",
    label: "Analytics",
    shortLabel: "Stats",
    key: "analytics",
    icon: BarChart3,
    exact: true,
  },
  {
    href: "/admin/withdrawals",
    label: "Withdrawals",
    shortLabel: "Payouts",
    key: "withdrawals",
    icon: ArrowLeftRight,
    exact: false,
  },
];

export function isAdminNavActive(pathname, href, exact) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
