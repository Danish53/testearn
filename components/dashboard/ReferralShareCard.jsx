"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Link2, Share2, UserPlus } from "lucide-react";
import { buildRegisterReferralUrl } from "@/lib/auth/referral";
import { useAppSelector } from "@/store/hooks";

function ReferralLinkBlock({ title, description, code, variant = "own" }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) return;
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";
    setUrl(origin ? buildRegisterReferralUrl(origin, code) : "");
  }, [code]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = useCallback(async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [url]);

  const share = useCallback(async () => {
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Solar Earning",
          text: "Register with this referral link:",
          url,
        });
      } catch {
        /* dismissed */
      }
    } else {
      await copy();
    }
  }, [url, copy]);

  const isOwn = variant === "own";

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-xl shadow-black/40 sm:p-6 ${
        isOwn
          ? "border-white/[0.1] bg-[#0b1018]/90 ring-1 ring-solar-accent/15"
          : "border-emerald-500/20 bg-emerald-950/20 ring-1 ring-emerald-500/20"
      }`}
    >
      {isOwn ? (
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-solar-accent/20 blur-3xl"
          aria-hidden
        />
      ) : null}
      <div className="relative flex flex-col gap-4">
        <div className="flex min-w-0 flex-1 gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isOwn
                ? "bg-solar-accent/20 text-solar-accent ring-1 ring-solar-accent/35"
                : "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/35"
            }`}
          >
            {isOwn ? (
              <Link2 className="h-5 w-5" strokeWidth={2} aria-hidden />
            ) : (
              <UserPlus className="h-5 w-5" strokeWidth={2} aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white sm:text-lg">{title}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {description}{" "}
              <span className="font-mono font-semibold text-solar-accent">{code}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
          <div className="flex min-h-[48px] min-w-0 flex-1 items-center rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 ring-1 ring-white/[0.04] sm:px-4">
            <p className="truncate font-mono text-[13px] text-slate-300 sm:text-sm" title={url || undefined}>
              {url || (code ? "Loading link…" : "Sign in to see your link")}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => void copy()}
              disabled={!url}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-solar-accent px-4 text-sm font-semibold text-solar-foreground-on-accent shadow-lg shadow-solar-accent/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial sm:px-5"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  Copy
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => void share()}
              disabled={!url}
              className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 text-slate-200 shadow-sm transition hover:border-solar-accent/40 hover:bg-solar-accent/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[52px]"
              aria-label="Share link"
              title="Share"
            >
              <Share2 className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ReferralShareCard() {
  const user = useAppSelector((s) => s.auth.user);
  const code = user?.referralCode || "";
  const referrer = user?.referrer;

  return (
    <div className="space-y-4">
      {referrer ? (
        <ReferralLinkBlock
          variant="sponsor"
          title={`You joined via @${referrer.username}`}
          description="Invitation link you used — code:"
          code={referrer.referralCode}
        />
      ) : null}
      <ReferralLinkBlock
        variant="own"
        title="Your referral link"
        description="Share so new sign-ups join your team. Your code:"
        code={code}
      />
    </div>
  );
}
