"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Loader2,
  Pencil,
  Shield,
  UserRound,
  Wallet,
} from "lucide-react";
import CopyField from "@/components/dashboard/CopyField";
import { DASH } from "@/components/dashboard/dashboard-ui";
import PageHeader from "@/components/dashboard/PageHeader";
import { setUser } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function avatarUrl(username, email) {
  const name = encodeURIComponent(username || email || "User");
  return `https://ui-avatars.com/api/?name=${name}&background=1facee&color=ffffff&size=128&bold=true`;
}

function mnemonicWords(phrase) {
  return String(phrase || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
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

  const [mnemonic, setMnemonic] = useState("");
  const [revealPassword, setRevealPassword] = useState("");
  const [revealBusy, setRevealBusy] = useState(false);
  const [revealErr, setRevealErr] = useState("");
  const [phraseCopied, setPhraseCopied] = useState(false);

  const phraseVisible = Boolean(mnemonic);
  const words = mnemonicWords(mnemonic);

  const trc20 = user?.wallet?.trc20Address || "";
  const bep20 = user?.wallet?.bep20Address || "";
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

  function hideMnemonic() {
    setMnemonic("");
    setRevealPassword("");
    setRevealErr("");
    setPhraseCopied(false);
  }

  async function handleRevealMnemonic() {
    setRevealErr("");
    if (phraseVisible) {
      hideMnemonic();
      return;
    }
    if (!revealPassword) {
      setRevealErr("Enter your account password to reveal the phrase");
      return;
    }
    setRevealBusy(true);
    try {
      const res = await fetch("/api/user/mnemonic", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: revealPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRevealErr(data.message || "Could not load phrase");
        return;
      }
      setMnemonic(data.mnemonic || "");
      setRevealPassword("");
    } catch {
      setRevealErr("Could not load phrase");
    } finally {
      setRevealBusy(false);
    }
  }

  async function copyMnemonic() {
    if (!mnemonic) return;
    try {
      await navigator.clipboard.writeText(mnemonic);
      setPhraseCopied(true);
      window.setTimeout(() => setPhraseCopied(false), 2000);
    } catch {
      setRevealErr("Could not copy — copy manually or allow clipboard access");
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
        lead="Update account details, change password, and manage wallet recovery."
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={DASH.card}>
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-solar-accent" aria-hidden />
            <h2 className="text-sm font-semibold text-white">Your deposit wallets</h2>
          </div>
          <div className="space-y-4">
            {trc20 ? (
              <CopyField label="TRC20 (Tron)" value={trc20} />
            ) : (
              <p className="text-sm text-slate-500">TRC20 wallet not provisioned yet.</p>
            )}
            {bep20 ? (
              <CopyField label="BEP20 (BSC)" value={bep20} />
            ) : (
              <p className="text-sm text-slate-500">BEP20 wallet not provisioned yet.</p>
            )}
          </div>
        </div>

        <div className={DASH.card}>
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-amber-400" aria-hidden />
            <h2 className="text-sm font-semibold text-white">Recovery phrase (12 words)</h2>
          </div>
          <p className="mb-3 text-xs text-slate-500">
            Controls your deposit wallets. Write it offline once — never share it. Staff will never
            ask for it.
          </p>
          {!phraseVisible ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-white/10 bg-black/25 px-2 py-2 text-center"
                  >
                    <span className="text-[10px] text-slate-600">{i + 1}.</span>
                    <p className="mt-0.5 font-mono text-xs tracking-widest text-slate-600">•••••</p>
                  </div>
                ))}
              </div>
              <input
                type="password"
                className={DASH.input}
                placeholder="Account password to reveal"
                value={revealPassword}
                onChange={(e) => setRevealPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleRevealMnemonic();
                  }
                }}
                autoComplete="current-password"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {words.map((word, i) => (
                  <div
                    key={`${i}-${word}`}
                    className="rounded-lg border border-amber-500/20 bg-black/20 px-2 py-2"
                  >
                    <span className="text-[10px] font-semibold text-amber-400/80">{i + 1}.</span>
                    <p className="font-mono text-xs text-amber-50">{word}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={copyMnemonic}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/25"
              >
                {phraseCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden /> Copy phrase
                  </>
                )}
              </button>
            </div>
          )}

          {revealErr ? (
            <p className="mt-2 text-xs text-red-400" role="alert">
              {revealErr}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleRevealMnemonic}
            disabled={revealBusy}
            className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-amber-200 disabled:opacity-60"
          >
            {revealBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Verifying…
              </>
            ) : phraseVisible ? (
              <>
                <EyeOff className="h-4 w-4" aria-hidden /> Hide phrase
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" aria-hidden /> Reveal phrase
              </>
            )}
          </button>
        </div>
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
