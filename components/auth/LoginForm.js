"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { clearAuthError, loginUser } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fieldClass, labelClass, errorClass } from "@/components/auth/auth-fields";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearAuthError());
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      const from = searchParams.get("from") || "/dashboard";
      router.push(from.startsWith("/dashboard") ? from : "/dashboard");
    } catch (err) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("verify")) {
        router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {error ? <p className={errorClass}>{error}</p> : null}

      <div>
        <label htmlFor="login-email" className={labelClass}>
          Email
        </label>
        <input
          id="login-email"
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
        <label htmlFor="login-password" className={labelClass}>
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass}
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex w-full min-h-[50px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-solar-accent to-solar-accent-strong px-6 text-sm font-semibold text-solar-foreground-on-accent shadow-lg shadow-solar-accent/25 transition hover:brightness-110 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solar-accent"
      >
        {loading ? "Signing in…" : "Sign in"}
        {!loading ? <span aria-hidden>→</span> : null}
      </button>
      <p className="border-t border-solar-border/70 pt-5 text-center text-xs text-solar-text-muted">
        New here?{" "}
        <Link
          href="/register"
          className="font-semibold text-solar-accent underline-offset-2 hover:underline"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}
