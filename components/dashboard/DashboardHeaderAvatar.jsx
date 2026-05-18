"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";

export default function DashboardHeaderAvatar() {
  const user = useAppSelector((s) => s.auth.user);
  const name = user?.username || "User";
  const src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1facee&color=ffffff&size=128&bold=true`;

  return (
    <Link
      href="/dashboard/profile"
      className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-solar-accent/50 sm:h-11 sm:w-11"
    >
      <Image src={src} alt={name} fill className="object-cover" sizes="44px" />
    </Link>
  );
}
