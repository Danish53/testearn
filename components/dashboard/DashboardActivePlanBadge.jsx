"use client";

import { Crown } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

export default function DashboardActivePlanBadge({ className = "" }) {
  const user = useAppSelector((s) => s.auth.user);
  const plan = (user?.activePackage || "").trim();

  if (!plan || plan.toLowerCase() === "none") {
    return null;
  }

  return (
    <span
      className={`inline-flex max-w-[min(42vw,11rem)] items-center gap-1.5 truncate rounded-full border border-solar-accent/35 bg-solar-accent/10 px-2.5 py-1 text-[10px] font-semibold text-solar-accent sm:max-w-[12rem] sm:px-3 sm:text-xs ${className}`}
      title={plan}
    >
      <Crown className="h-3 w-3 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
      <span className="truncate">{plan}</span>
    </span>
  );
}
