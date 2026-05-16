"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyField({ label, value, mono = true }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div>
      {label ? (
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
      ) : null}
      <div className="flex gap-2">
        <div
          className={`min-w-0 flex-1 truncate rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white ${mono ? "font-mono" : ""}`}
        >
          {value}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex shrink-0 items-center justify-center rounded-xl border border-solar-accent/30 bg-solar-accent/15 px-3.5 text-solar-accent transition hover:bg-solar-accent/25"
          aria-label={copied ? "Copied" : "Copy"}
        >
          {copied ? (
            <Check className="h-5 w-5" strokeWidth={2} aria-hidden />
          ) : (
            <Copy className="h-5 w-5" strokeWidth={2} aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
