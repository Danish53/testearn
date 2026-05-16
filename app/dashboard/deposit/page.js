import { ArrowDownToLine } from "lucide-react";
import { DASH } from "@/components/dashboard/dashboard-ui";

export const metadata = {
  title: "Deposit",
};

export default function DepositPage() {
  return (
    <div className={DASH.wrap}>
      <div className={DASH.titleRow}>
        <div className={DASH.iconBox}>
          <ArrowDownToLine strokeWidth={1.75} />
        </div>
        <div>
          <h1 className={DASH.h1}>Deposit</h1>
          <p className={DASH.lead}>
            Add funds to your wallet. Amount, network, and confirmation UI will
            connect to your payment provider.
          </p>
        </div>
      </div>
      <div className={DASH.card}>
        <p className="text-sm text-slate-600">
          Deposit form (amount, method, reference) — placeholder layout ready for
          wiring.
        </p>
      </div>
    </div>
  );
}
