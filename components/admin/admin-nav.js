import {
  ArrowDownToLine,
  ArrowLeftRight,
  BarChart3,
  GitBranch,
  Radio,
  Users,
} from "lucide-react";

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
    href: "/admin/users",
    label: "Users",
    shortLabel: "Users",
    key: "users",
    icon: Users,
    exact: false,
  },
  {
    href: "/admin/blockchain",
    label: "Blockchain",
    shortLabel: "Chain",
    key: "blockchain",
    icon: Radio,
    exact: false,
  },
  {
    href: "/admin/deposits",
    label: "Deposits",
    shortLabel: "Deposits",
    key: "deposits",
    icon: ArrowDownToLine,
    exact: false,
  },
  {
    href: "/admin/referral",
    label: "Referral",
    shortLabel: "Referral",
    key: "referral",
    icon: GitBranch,
    exact: false,
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
