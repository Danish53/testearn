/** Demo data for UI — replace with API responses when backend is wired. */

export const DEMO_USER = {
  name: "Alex Rivera",
  email: "alex@earning.app",
  memberId: "ERN-2026-01482",
  referralCode: "ALEX482",
  balance: 1247.5,
  totalDeposited: 3500,
  totalWithdrawn: 890,
  dailyEarning: 9,
  activePackage: "VIP 3",
  teamSize: 24,
  directCount: 8,
  wallets: {
    trc20: "TXyz9kP2mN8qR4vL6wH3jK5tB7cD1eF9gA2",
    bep20: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2",
  },
  avatar:
    "https://ui-avatars.com/api/?name=Alex+Rivera&background=1facee&color=ffffff&size=128&bold=true",
};

export const DEMO_TRANSACTIONS = [
  {
    id: "tx1",
    date: "2026-05-15",
    time: "14:32",
    type: "deposit",
    label: "USDT Deposit",
    network: "TRC20",
    amount: 500,
    status: "confirmed",
    txHash: "a3f8…9c2d",
  },
  {
    id: "tx2",
    date: "2026-05-14",
    time: "09:10",
    type: "package",
    label: "VIP 3 activated",
    network: "—",
    amount: -27,
    status: "completed",
    txHash: "—",
  },
  {
    id: "tx3",
    date: "2026-05-14",
    time: "00:01",
    type: "earning",
    label: "Daily profit",
    network: "—",
    amount: 9,
    status: "credited",
    txHash: "—",
  },
  {
    id: "tx4",
    date: "2026-05-12",
    time: "18:45",
    type: "referral",
    label: "Direct commission",
    network: "—",
    amount: 2.7,
    status: "credited",
    txHash: "—",
  },
  {
    id: "tx5",
    date: "2026-05-10",
    time: "11:20",
    type: "withdraw",
    label: "Withdrawal",
    network: "TRC20",
    amount: -100,
    status: "pending",
    txHash: "b7e1…4a8f",
  },
  {
    id: "tx6",
    date: "2026-05-08",
    time: "16:02",
    type: "deposit",
    label: "USDT Deposit",
    network: "BEP20",
    amount: 200,
    status: "confirmed",
    txHash: "0x9d2…f41a",
  },
];

export const DEMO_TEAM_LEVELS = [
  { level: 1, label: "Level 1 — Direct", count: 8, volume: 1842, commission: 148.2 },
  { level: 2, label: "Level 2 — Indirect", count: 11, volume: 920, commission: 46.0 },
  { level: 3, label: "Level 3 — Network", count: 5, volume: 380, commission: 19.0 },
];

export const DEMO_TEAM_MEMBERS = [
  { name: "Sara Khan", id: "ERN-8821", level: 1, package: "VIP 2", joined: "2026-04-20" },
  { name: "Omar Malik", id: "ERN-9104", level: 1, package: "VIP 1", joined: "2026-04-28" },
  { name: "Ayesha Noor", id: "ERN-7742", level: 2, package: "VIP 3", joined: "2026-05-02" },
  { name: "Hassan Ali", id: "ERN-6601", level: 2, package: "VIP 1", joined: "2026-05-08" },
  { name: "Fatima R.", id: "ERN-5520", level: 3, package: "VIP 1", joined: "2026-05-11" },
];

export const ADMIN_STATS = {
  users: 1284,
  depositsToday: 18420,
  withdrawalsPending: 12,
  walletsMonitored: 1284,
  activePackages: 892,
  volume24h: 48200,
};

export const ADMIN_PENDING_DEPOSITS = [
  { user: "john_d", amount: 500, network: "TRC20", time: "5m ago", status: "detected" },
  { user: "maria_k", amount: 1000, network: "BEP20", time: "12m ago", status: "confirming" },
  { user: "dev_p", amount: 50, network: "TRC20", time: "28m ago", status: "confirmed" },
];

export const ADMIN_PENDING_WITHDRAWALS = [
  { user: "alex_r", amount: 100, address: "TXyz…9gA2", status: "pending" },
  { user: "sara_k", amount: 250, address: "0x742…bEb2", status: "pending" },
  { user: "omar_m", amount: 75, address: "TXab…3kL9", status: "review" },
];
