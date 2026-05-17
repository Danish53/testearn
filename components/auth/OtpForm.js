"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clearAuthError, resendOtp, verifyOtp } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { errorClass, fieldClass, labelClass, successClass } from "@/components/auth/auth-fields";

const OTP_LENGTH = 6;

export default function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") || "").trim().toLowerCase();

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [resent, setResent] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  function handleDigitChange(index, value) {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    if (v && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== OTP_LENGTH) return;

    dispatch(clearAuthError());
    try {
      await dispatch(verifyOtp({ email, otp })).unwrap();
      router.push("/");
    } catch {
      /* redux error */
    }
  }

  async function handleResend() {
    dispatch(clearAuthError());
    try {
      await dispatch(resendOtp({ email })).unwrap();
      setResent(true);
      window.setTimeout(() => setResent(false), 4000);
    } catch {
      /* redux error */
    }
  }

  if (!email) return null;

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {error ? <p className={errorClass}>{error}</p> : null}
      {resent ? <p className={successClass}>New code sent — check your email.</p> : null}

      <p className="text-center text-sm text-solar-text-muted">
        We sent a 6-digit code to{" "}
        <span className="font-semibold text-solar-text">{email}</span>
      </p>

      <div>
        <label className={`${labelClass} text-center`}>Verification code</label>
        <div className="mt-2 flex justify-center gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`${fieldClass} h-12 w-11 text-center text-lg font-bold tabular-nums sm:h-14 sm:w-12`}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-solar-text-muted">
          Dev: check server console if SMTP is not configured.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || digits.join("").length !== OTP_LENGTH}
        className="flex w-full min-h-[50px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-solar-accent to-solar-accent-strong px-6 text-sm font-semibold text-solar-foreground-on-accent shadow-lg shadow-solar-accent/25 transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Verifying…" : "Verify & open dashboard"}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={loading}
        className="w-full text-center text-sm font-medium text-solar-accent hover:underline disabled:opacity-50"
      >
        Resend code
      </button>
    </form>
  );
}
