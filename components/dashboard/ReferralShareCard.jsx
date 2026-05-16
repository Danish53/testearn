"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Link2, Share2 } from "lucide-react";

/** Demo ref — replace with session user’s code from your API after auth. */
export const DEMO_REF_CODE = "ERN202601482";

export default function ReferralShareCard() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";
    setUrl(origin ? `${origin}/register?ref=${DEMO_REF_CODE}` : "");
  }, []);

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
          title: "Join Earning",
          text: "Register with my referral link:",
          url,
        });
      } catch {
        /* dismissed */
      }
    } else {
      await copy();
    }
  }, [url, copy]);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0b1018]/90 p-5 shadow-xl shadow-black/40 ring-1 ring-solar-accent/15 sm:p-6">
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-solar-accent/20 blur-3xl"
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-solar-accent/10 blur-2xl" aria-hidden />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-solar-accent/20 text-solar-accent ring-1 ring-solar-accent/35">
            <Link2 className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white sm:text-lg">Your referral link</h2>
            <p className="mt-1 text-sm text-slate-400">
              Share this link so new sign-ups count toward your team. Code:{" "}
              <span className="font-mono font-semibold text-solar-accent">{DEMO_REF_CODE}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
        <div className="flex min-h-[48px] min-w-0 flex-1 items-center rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 ring-1 ring-white/[0.04] sm:px-4">
          <p className="truncate font-mono text-[13px] text-slate-300 sm:text-sm" title={url || undefined}>
            {url || "Loading link…"}
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
    </section>
  );
}
