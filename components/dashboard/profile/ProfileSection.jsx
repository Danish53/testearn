"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Lock, Loader2, Pencil, Shield, UserRound, Wallet } from "lucide-react";
import CopyField from "@/components/dashboard/CopyField";
import { DASH } from "@/components/dashboard/dashboard-ui";
import PageHeader from "@/components/dashboard/PageHeader";
import { setUser } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function avatarUrl(username, email) {
  const name = encodeURIComponent(username || email || "User");
  return `https://ui-avatars.com/api/?name=${name}&background=1facee&color=ffffff&size=128&bold=true`;
}

export default function ProfileSection() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const bep20 = user?.wallet?.bep20Address || "";
  const trc20 = user?.wallet?.trc20Address || "";
  const displayName = user?.username || "—";

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user?.username, user?.email]);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");
    setProfileBusy(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileErr(data.message || "Could not update profile");
        return;
      }
      if (data.user) dispatch(setUser(data.user));
      setProfileMsg(data.message || "Profile updated");
    } catch {
      setProfileErr("Could not update profile");
    } finally {
      setProfileBusy(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordErr("");
    if (newPassword !== confirmPassword) {
      setPasswordErr("New passwords do not match");
      return;
    }
    setPasswordBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordErr(data.message || "Could not update password");
        return;
      }
      setPasswordMsg(data.message || "Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordErr("Could not update password");
    } finally {
      setPasswordBusy(false);
    }
  }

  const profileDirty =
    user &&
    (username.trim().toLowerCase() !== (user.username || "") ||
      email.trim().toLowerCase() !== (user.email || ""));

  return (
    <div className={DASH.wrap}>
      <PageHeader
        icon={UserRound}
        title="Profile & security"
        lead="Update account details, change password, and view your deposit wallet addresses."
      />

      <div className={`flex flex-col items-center gap-6 sm:flex-row sm:items-start ${DASH.card}`}>
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-4 ring-solar-accent/30">
          <Image
            src={avatarUrl(user?.username, user?.email)}
            alt={displayName}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-xl font-semibold text-white">{displayName}</p>
          <p className="mt-1 text-sm text-slate-400">{user?.email || "—"}</p>
          <p className="mt-3 text-xs text-slate-500">
            Referral code:{" "}
            <span className="font-mono font-semibold text-solar-accent">
              {user?.referralCode || "—"}
            </span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Active plan:{" "}
            <span className="font-semibold text-amber-300">
              {user?.activePackage || "None"}
            </span>
            {user?.dailyEarnings > 0 ? (
              <>
                {" · "}
                Daily ${user.dailyEarnings}/day
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className={DASH.card}>
        <div className="mb-4 flex items-center gap-2">
          <Pencil className="h-5 w-5 text-solar-accent" aria-hidden />
          <h2 className="text-sm font-semibold text-white">Edit profile</h2>
        </div>
        <form className="grid gap-4 sm:max-w-md" onSubmit={handleProfileSubmit}>
          <div>
            <label htmlFor="profile-username" className={DASH.label}>
              Username
            </label>
            <input
              id="profile-username"
              type="text"
              className={DASH.input}
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())
              }
              autoComplete="username"
              minLength={3}
              maxLength={32}
            />
            <p className="mt-1 text-xs text-slate-500">
              Changing username updates your referral code for new signups.
            </p>
          </div>
          <div>
            <label htmlFor="profile-email" className={DASH.label}>
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              className={DASH.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          {profileErr ? (
            <p className="text-sm text-red-400" role="alert">
              {profileErr}
            </p>
          ) : null}
          {profileMsg ? (
            <p className="text-sm text-emerald-400" role="status">
              {profileMsg}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={profileBusy || !profileDirty}
            className={`${DASH.btnPrimary} sm:max-w-xs`}
          >
            {profileBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </form>
      </div>

      <div className={DASH.card}>
        <div className="mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-solar-accent" aria-hidden />
          <h2 className="text-sm font-semibold text-white">Your deposit wallets</h2>
        </div>
        <div className="space-y-4">
          {bep20 ? (
            <CopyField label="BEP20 (BSC)" value={bep20} />
          ) : (
            <p className="text-sm text-slate-500">BEP20 wallet not provisioned yet.</p>
          )}
          {trc20 ? (
            <CopyField label="TRC20 (Tron)" value={trc20} />
          ) : (
            <p className="text-sm text-slate-500">TRC20 wallet not provisioned yet.</p>
          )}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Wallet recovery phrase is held securely by the platform administrator.
        </p>
      </div>

      <div className={DASH.card}>
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-solar-accent" aria-hidden />
          <h2 className="text-sm font-semibold text-white">Change password</h2>
        </div>
        <form className="grid gap-4 sm:max-w-md" onSubmit={handlePasswordSubmit}>
          <div>
            <label htmlFor="current-password" className={DASH.label}>
              Current password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="current-password"
                type="password"
                className={`${DASH.input} pl-10`}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="new-password" className={DASH.label}>
              New password
            </label>
            <input
              id="new-password"
              type="password"
              className={DASH.input}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className={DASH.label}>
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              className={DASH.input}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          {passwordErr ? (
            <p className="text-sm text-red-400" role="alert">
              {passwordErr}
            </p>
          ) : null}
          {passwordMsg ? (
            <p className="text-sm text-emerald-400" role="status">
              {passwordMsg}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={passwordBusy}
            className={`${DASH.btnPrimary} sm:max-w-xs`}
          >
            {passwordBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
