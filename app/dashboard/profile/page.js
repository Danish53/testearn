import Image from "next/image";
import { UserRound } from "lucide-react";
import { DASH } from "@/components/dashboard/dashboard-ui";

export const metadata = {
  title: "Profile",
};

const AVATAR =
  "https://ui-avatars.com/api/?name=Alex+Rivera&background=1facee&color=ffffff&size=128&bold=true";

export default function ProfilePage() {
  return (
    <div className={DASH.wrap}>
      <div className={DASH.titleRow}>
        <div className={DASH.iconBox}>
          <UserRound strokeWidth={1.75} />
        </div>
        <div>
          <h1 className={DASH.h1}>Profile</h1>
          <p className={DASH.lead}>
            Account details and security. Replace demo data with your API.
          </p>
        </div>
      </div>

      <div
        className={`flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left ${DASH.card}`}
      >
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-4 ring-solar-accent/30">
          <Image src={AVATAR} alt="Alex Rivera" fill className="object-cover" sizes="96px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-semibold text-white">Alex Rivera</p>
          <p className="mt-1 text-sm text-slate-400">alex@earning.app</p>
          <p className="mt-3 text-xs text-slate-500">
            Member ID:{" "}
            <span className="font-mono font-semibold text-solar-accent">ERN-2026-01482</span>
          </p>
        </div>
      </div>

      <div className={DASH.card}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Security</h2>
        <p className="mt-2 text-sm text-slate-400">
          Password change, 2FA, and session list — add forms when auth is wired.
        </p>
      </div>
    </div>
  );
}
