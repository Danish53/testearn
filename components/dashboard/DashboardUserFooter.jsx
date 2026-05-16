"use client";

import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import LogoutButton from "@/components/dashboard/LogoutButton";

const FALLBACK_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=1facee&color=ffffff&size=128&bold=true";

export default function DashboardUserFooter({ onNavigate }) {
  const user = useAppSelector((s) => s.auth.user);
  const name = user?.username || "Member";
  const email = user?.email || "";
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1facee&color=ffffff&size=128&bold=true`;

  return (
    <footer className="shrink-0 border-t border-white/10 bg-black/25 backdrop-blur-md">
      <div className="space-y-3 p-4 sm:space-y-3.5 sm:p-5">
        <Link
          href="/dashboard/profile"
          onClick={onNavigate}
          className="flex items-center gap-3.5 rounded-2xl bg-white/[0.06] p-3.5 ring-1 ring-white/10 transition hover:bg-white/[0.1]"
        >
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl ring-1 ring-solar-accent/35">
            <Image src={avatar || FALLBACK_AVATAR} alt="" fill className="object-cover" sizes="48px" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="truncate text-xs text-white/65">{email}</p>
          </div>
          <UserRound className="h-5 w-5 shrink-0 text-solar-accent/80" aria-hidden />
        </Link>
        <LogoutButton />
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] py-3 text-sm font-semibold text-white transition hover:border-solar-accent/40 hover:bg-solar-accent/15"
        >
          <span aria-hidden>←</span>
          Back to website
        </Link>
      </div>
    </footer>
  );
}
