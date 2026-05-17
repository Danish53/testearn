"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { ADMIN } from "@/components/admin/admin-ui";

function mnemonicWords(phrase) {
  return String(phrase || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export default function AdminRecoveryPhrase({ userId }) {
  const [mnemonic, setMnemonic] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const visible = Boolean(mnemonic);
  const words = mnemonicWords(mnemonic);

  async function loadPhrase() {
    if (visible) {
      setMnemonic("");
      setError("");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/mnemonic`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not load phrase");
        return;
      }
      setMnemonic(data.mnemonic || "");
    } catch {
      setError("Could not load phrase");
    } finally {
      setBusy(false);
    }
  }

  async function copyPhrase() {
    if (!mnemonic) return;
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed");
    }
  }

  return (
    <section className={`${ADMIN.card} mb-6`}>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <KeyRound className="h-4 w-4 text-amber-400" aria-hidden />
        Recovery phrase (12 words)
      </h3>
      <p className="mb-3 text-xs text-slate-500">
        Admin-only wallet backup. Store securely — never share with the user over unsecured channels.
      </p>

      {!visible ? (
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
            onClick={copyPhrase}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/25"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy phrase
              </>
            )}
          </button>
        </div>
      )}

      {error ? (
        <p className="mt-2 text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={loadPhrase}
        disabled={busy}
        className={`${ADMIN.btnGhost} mt-3 w-full sm:w-auto`}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </>
        ) : visible ? (
          <>
            <EyeOff className="h-4 w-4" /> Hide phrase
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" /> Reveal phrase
          </>
        )}
      </button>
    </section>
  );
}
