import { ArrowUpFromLine } from "lucide-react";
import { DASH } from "@/components/dashboard/dashboard-ui";

export const metadata = {
  title: "Withdraw",
};

export default function WithdrawPage() {
  return (
    <div className={DASH.wrap}>
      <div className={DASH.titleRow}>
        <div className={DASH.iconBox}>
          <ArrowUpFromLine strokeWidth={1.75} />
        </div>
        <div>
          <h1 className={DASH.h1}>Withdraw</h1>
          <p className={DASH.lead}>
            Request payouts to your bank or on-chain address. Limits and KYC
            checks display here once configured.
          </p>
        </div>
      </div>
      <div className={DASH.card}>
        <p className="text-sm text-slate-600">
          Withdrawal form — placeholder for amount, destination, and fee summary.
        </p>
      </div>
    </div>
  );
}
