"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthError, registerUser } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fieldClass, labelClass, errorClass } from "@/components/auth/auth-fields";

export default function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setReferralCode((prev) => (prev ? prev : ref.trim()));
  }, []);

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearAuthError());
    try {
      await dispatch(
        registerUser({ username, email, password, referralCode })
      ).unwrap();
      router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch {
      /* error in redux */
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {error ? <p className={errorClass}>{error}</p> : null}

      <div className="rounded-lg border border-solar-accent/25 bg-solar-accent/10 px-3 py-2.5 text-xs leading-relaxed text-solar-text-muted">
        After email verification we create your{" "}
        <span className="font-semibold text-solar-accent">USDT wallets</span> (TRC20 + BEP20)
        with encrypted keys — then you enter the dashboard.
      </div>

      <div>
        <label htmlFor="register-username" className={labelClass}>
          Username
        </label>
        <input
          id="register-username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={fieldClass}
          placeholder="Choose a username"
        />
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
        <label htmlFor="register-referral" className={labelClass}>
          Referral code{" "}
          <span className="font-normal normal-case text-solar-text-muted/70">(optional)</span>
        </label>
        <input
          id="register-referral"
          name="referralCode"
          type="text"
          autoComplete="off"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className={fieldClass}
          placeholder="Friend’s code"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-3 flex w-full min-h-[50px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-solar-accent to-solar-accent-strong px-6 text-sm font-semibold text-solar-foreground-on-accent shadow-lg shadow-solar-accent/25 transition hover:brightness-110 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solar-accent"
      >
        {loading ? "Sending code…" : "Create account"}
        {!loading ? <span aria-hidden>→</span> : null}
      </button>
    </form>
  );
}
