"use client";

import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { setUser } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const SYNC_MS = 60_000;

/**
 * Keeps wallet balance in sync: deposit scan, 24h profit accrual, session refresh.
 */
export default function DashboardWalletSync() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.user);

  const syncWallet = useCallback(async () => {
    if (!user?.isVerified) return;
    try {
      const [depositRes, accrueRes, meRes] = await Promise.all([
        fetch("/api/deposit/check", { method: "POST", credentials: "include" }),
        fetch("/api/investment/accrue", { method: "POST", credentials: "include" }),
        fetch("/api/auth/me", { credentials: "include" }),
      ]);

      if (depositRes.ok) {
        const depositData = await depositRes.json();
        if (depositData.user) {
          dispatch(setUser(depositData.user));
          return;
        }
      }

      if (accrueRes.ok) {
        const accrueData = await accrueRes.json();
        if (accrueData.user) {
          dispatch(setUser(accrueData.user));
          return;
        }
      }

      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.user) dispatch(setUser(meData.user));
      }
    } catch {
      /* ignore */
    }
  }, [user?.isVerified, dispatch]);

  useEffect(() => {
    void syncWallet();
  }, [syncWallet, pathname]);

  useEffect(() => {
    if (!user?.isVerified) return;
    const id = window.setInterval(() => void syncWallet(), SYNC_MS);
    return () => window.clearInterval(id);
  }, [user?.isVerified, syncWallet]);

  return null;
}
