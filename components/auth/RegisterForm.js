"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clearAuthError, registerUser } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fieldClass, labelClass, errorClass } from "@/components/auth/auth-fields";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);

  const refFromLink = searchParams.get("ref")?.trim().toUpperCase() || "";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sponsorCode, setSponsorCode] = useState(refFromLink);

  useEffect(() => {
    if (refFromLink) setSponsorCode(refFromLink);
  }, [refFromLink]);

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearAuthError());

    const trimmedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9]{3,32}$/.test(trimmedUsername)) {
      return;
    }
    if (refFromLink && !sponsorCode.trim()) {
      return;
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await dispatch(
        registerUser({
          username: trimmedUsername,
          email: normalizedEmail,
          password,
          referralCode: sponsorCode.trim().toUpperCase(),
        })
      ).unwrap();
      router.push(`/verify-otp?email=${encodeURIComponent(normalizedEmail)}`);
    } catch {
      /* error in redux */
    }
  }

  const usernameInvalid =
    username.length > 0 && !/^[a-z0-9]{3,32}$/i.test(username.trim());

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {error ? <p className={errorClass}>{error}</p> : null}

      {refFromLink ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs leading-relaxed text-emerald-100/90">
          You are registering with referral code{" "}
          <span className="font-mono font-semibold text-emerald-300">{refFromLink}</span>.
        </div>
      ) : null}

      <div className="rounded-lg border border-solar-accent/25 bg-solar-accent/10 px-3 py-2.5 text-xs leading-relaxed text-solar-text-muted">
        On signup we auto-create your{" "}
        <span className="font-semibold text-solar-accent">USDT wallets</span> (BEP20 + TRC20):
        deposit address, private key, and mnemonic — all encrypted. Verify email to access the
        dashboard.
      </div>

      <div>
        <label htmlFor="register-username" className={labelClass}>
          Username <span className="text-red-400">*</span>
        </label>
        <input
          id="register-username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={32}
          pattern="[a-zA-Z0-9]{3,32}"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
          className={fieldClass}
          placeholder="e.g. ali123"
        />
        {usernameInvalid ? (
          <p className="mt-1 text-xs text-red-400">Use 3–32 letters and numbers only.</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="register-your-code" className={labelClass}>
          Your referral code <span className="text-red-400">*</span>
        </label>
        <input
          id="register-your-code"
          name="yourReferralCode"
          type="text"
          readOnly
          tabIndex={-1}
          value={username.toUpperCase()}
          className={`${fieldClass} cursor-default font-mono tracking-wide text-solar-accent opacity-95`}
          placeholder="Type username above — your code appears here"
        />
        <p className="mt-1 text-xs text-solar-text-muted">
          Updates automatically from your username. Friends will use this code to join your team.
        </p>
      </div>

      <div>
        <label htmlFor="register-email" className={labelClass}>
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="register-password" className={labelClass}>
          Password
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass}
          placeholder="At least 6 characters"
        />
      </div>

      <div>
        <label htmlFor="register-sponsor" className={labelClass}>
          Sponsor referral code{" "}
          {refFromLink ? (
            <span className="text-red-400">*</span>
          ) : (
            <span className="font-normal normal-case text-solar-text-muted/70">(optional)</span>
          )}
        </label>
        <input
          id="register-sponsor"
          name="referralCode"
          type="text"
          autoComplete="off"
          required={Boolean(refFromLink)}
          readOnly={Boolean(refFromLink)}
          value={sponsorCode}
          onChange={(e) => setSponsorCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          className={`${fieldClass}${refFromLink ? " cursor-not-allowed opacity-90" : ""}`}
          placeholder={refFromLink ? refFromLink : "Friend’s code"}
        />
        {refFromLink ? (
          <p className="mt-1 text-xs text-solar-text-muted">
            Filled automatically from your invitation link.
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={loading || usernameInvalid}
        className="mt-3 flex w-full min-h-[50px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-solar-accent to-solar-accent-strong px-6 text-sm font-semibold text-solar-foreground-on-accent shadow-lg shadow-solar-accent/25 transition hover:brightness-110 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solar-accent"
      >
        {loading ? "Sending code…" : "Create account"}
        {!loading ? <span aria-hidden>→</span> : null}
      </button>
    </form>
  );
}
