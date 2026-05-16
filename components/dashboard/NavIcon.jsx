import {
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  LayoutDashboard,
  Package,
  UserRound,
  Users,
} from "lucide-react";

const map = {
  overview: LayoutDashboard,
  packages: Package,
  team: Users,
  deposit: ArrowDownToLine,
  withdraw: ArrowUpFromLine,
  history: History,
  profile: UserRound,
};

export default function NavIcon({ navKey, className = "", strokeWidth = 1.75 }) {
  const Icon = map[navKey] ?? LayoutDashboard;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
