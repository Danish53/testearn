"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutUser } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function LogoutButton({ className = "" }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const loading = useAppSelector((s) => s.auth.loading);

  async function handleLogout() {
    await dispatch(logoutUser());
    router.refresh();
    router.replace("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50 ${className}`}
    >
      <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
      Log out
    </button>
  );
}
