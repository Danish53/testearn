import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: {
    default: "Dashboard — Earning",
    template: "%s — Earning",
  },
  description: "Manage packages, team, deposits, withdrawals, and profile.",
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
