import { History } from "lucide-react";
import { DASH } from "@/components/dashboard/dashboard-ui";

export const metadata = {
  title: "History",
};

export default function HistoryPage() {
  return (
    <div className={DASH.wrap}>
      <div className={DASH.titleRow}>
        <div className={DASH.iconBox}>
          <History strokeWidth={1.75} />
        </div>
        <div>
          <h1 className={DASH.h1}>History</h1>
          <p className={DASH.lead}>
            Deposits, withdrawals, package purchases, and bonuses in one
            filterable ledger.
          </p>
        </div>
      </div>
      <div className={DASH.panel}>
        <div className="grid grid-cols-3 gap-2 border-b border-white/10 px-4 py-3 sm:px-6">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
            Date
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
            Type
          </span>
          <span className="text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
            Amount
          </span>
        </div>
        <div className="px-4 py-12 text-center text-sm text-slate-500 sm:px-6">
          No transactions yet — activity will appear here.
        </div>
      </div>
    </div>
  );
}
