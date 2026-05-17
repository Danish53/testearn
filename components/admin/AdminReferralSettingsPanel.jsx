"use client";

import { useCallback, useEffect, useState } from "react";
import { Gift, GitBranch, Loader2, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { ADMIN } from "@/components/admin/admin-ui";

const emptyMilestone = () => ({ directReferrals: "", bonusAmount: "", label: "" });

export default function AdminReferralSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    commissionEnabled: true,
    maxLevels: 3,
    level1Percent: "10",
    level2Percent: "5",
    level3Percent: "3",
    requireSponsorOnRegister: false,
    sponsorMustBeVerified: true,
    commissionOnPackagePurchaseOnly: true,
    minPackageInvestment: "0",
    bonusesEnabled: true,
    newUserBonus: "0",
    referrerSignupBonus: "0",
    milestones: [emptyMilestone()],
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/referral-settings", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load");
        return;
      }
      const s = data.settings;
      setForm({
        commissionEnabled: s.commissionEnabled,
        maxLevels: s.maxLevels,
        level1Percent: String(s.level1Percent),
        level2Percent: String(s.level2Percent),
        level3Percent: String(s.level3Percent),
        requireSponsorOnRegister: s.requireSponsorOnRegister,
        sponsorMustBeVerified: s.sponsorMustBeVerified,
        commissionOnPackagePurchaseOnly: s.commissionOnPackagePurchaseOnly,
        minPackageInvestment: String(s.minPackageInvestment),
        bonusesEnabled: s.bonusesEnabled,
        newUserBonus: String(s.newUserBonus),
        referrerSignupBonus: String(s.referrerSignupBonus),
        milestones:
          s.milestones?.length > 0
            ? s.milestones.map((m) => ({
                directReferrals: String(m.directReferrals),
                bonusAmount: String(m.bonusAmount),
                label: m.label || "",
              }))
            : [emptyMilestone()],
      });
    } catch {
      setError("Could not load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/referral-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionEnabled: form.commissionEnabled,
          maxLevels: Number(form.maxLevels),
          level1Percent: Number(form.level1Percent),
          level2Percent: Number(form.level2Percent),
          level3Percent: Number(form.level3Percent),
          requireSponsorOnRegister: form.requireSponsorOnRegister,
          sponsorMustBeVerified: form.sponsorMustBeVerified,
          commissionOnPackagePurchaseOnly: form.commissionOnPackagePurchaseOnly,
          minPackageInvestment: Number(form.minPackageInvestment),
          bonusesEnabled: form.bonusesEnabled,
          newUserBonus: Number(form.newUserBonus),
          referrerSignupBonus: Number(form.referrerSignupBonus),
          milestones: form.milestones
            .filter((m) => m.directReferrals && m.bonusAmount)
            .map((m) => ({
              directReferrals: Number(m.directReferrals),
              bonusAmount: Number(m.bonusAmount),
              label: m.label,
            })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Save failed");
        return;
      }
      setMsg(data.message || "Settings saved");
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateMilestone(i, field, value) {
    setForm((f) => ({
      ...f,
      milestones: f.milestones.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)),
    }));
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-solar-accent" />
      </div>
    );
  }

  return (
    <div className={ADMIN.wrap}>
      <AdminPageHeader
        title="Referral commission settings"
        description="Set L1–L3 percentages, registration rules, and bonus rewards. Changes apply to new package purchases and verifications."
        action={
          <button type="button" onClick={load} className={ADMIN.btnGhost}>
            <RefreshCw className="h-4 w-4" /> Reload
          </button>
        }
      />

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {msg ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {msg}
        </p>
      ) : null}

      <form onSubmit={handleSave} className="space-y-6">
        <section className={ADMIN.card}>
          <div className="mb-4 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-solar-accent" />
            <h2 className={ADMIN.sectionTitle}>Level percentages</h2>
          </div>
          <label className="mb-4 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.commissionEnabled}
              onChange={(e) => setForm((f) => ({ ...f, commissionEnabled: e.target.checked }))}
              className="h-4 w-4 accent-solar-accent"
            />
            <span className="text-sm text-slate-300">Commission system enabled</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { key: "level1Percent", label: "Level 1 — Direct (L1)", hint: "Sponsor of buyer" },
              { key: "level2Percent", label: "Level 2 — Indirect (L2)", hint: "Sponsor's sponsor" },
              { key: "level3Percent", label: "Level 3 — Indirect (L3)", hint: "Third upline" },
            ].map(({ key, label, hint }) => (
              <div key={key}>
                <label className={ADMIN.label}>{label}</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  className={ADMIN.input}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
                <p className="mt-1 text-xs text-slate-600">{hint}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className={ADMIN.label}>Max upline levels (1–3)</label>
            <input
              type="number"
              min={1}
              max={3}
              className={`${ADMIN.input} max-w-[120px]`}
              value={form.maxLevels}
              onChange={(e) => setForm((f) => ({ ...f, maxLevels: e.target.value }))}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Example: VIP $100 purchase → L1 earns ${(100 * Number(form.level1Percent || 0)) / 100}{" "}
            USDT, L2 earns ${(100 * Number(form.level2Percent || 0)) / 100} USDT.
          </p>
        </section>

        <section className={ADMIN.card}>
          <h2 className={`${ADMIN.sectionTitle} mb-4`}>Referral rules</h2>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <input
                type="checkbox"
                checked={form.requireSponsorOnRegister}
                onChange={(e) =>
                  setForm((f) => ({ ...f, requireSponsorOnRegister: e.target.checked }))
                }
                className="h-4 w-4 accent-solar-accent"
              />
              <span className="text-sm text-slate-300">Require sponsor code on registration</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <input
                type="checkbox"
                checked={form.sponsorMustBeVerified}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sponsorMustBeVerified: e.target.checked }))
                }
                className="h-4 w-4 accent-solar-accent"
              />
              <span className="text-sm text-slate-300">Only verified users earn commission</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <input
                type="checkbox"
                checked={form.commissionOnPackagePurchaseOnly}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    commissionOnPackagePurchaseOnly: e.target.checked,
                  }))
                }
                className="h-4 w-4 accent-solar-accent"
              />
              <span className="text-sm text-slate-300">
                Pay commission on VIP package purchase only
              </span>
            </label>
            <div>
              <label className={ADMIN.label}>Min package investment for commission (USDT)</label>
              <input
                type="number"
                min={0}
                className={`${ADMIN.input} max-w-xs`}
                value={form.minPackageInvestment}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minPackageInvestment: e.target.value }))
                }
              />
            </div>
          </div>
        </section>

        <section className={ADMIN.card}>
          <div className="mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-400" />
            <h2 className={ADMIN.sectionTitle}>Bonus system</h2>
          </div>
          <label className="mb-4 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.bonusesEnabled}
              onChange={(e) => setForm((f) => ({ ...f, bonusesEnabled: e.target.checked }))}
              className="h-4 w-4 accent-solar-accent"
            />
            <span className="text-sm text-slate-300">Bonuses enabled</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={ADMIN.label}>New user bonus (on verify)</label>
              <input
                type="number"
                min={0}
                className={ADMIN.input}
                value={form.newUserBonus}
                onChange={(e) => setForm((f) => ({ ...f, newUserBonus: e.target.value }))}
              />
            </div>
            <div>
              <label className={ADMIN.label}>Referrer bonus (when referral verifies)</label>
              <input
                type="number"
                min={0}
                className={ADMIN.input}
                value={form.referrerSignupBonus}
                onChange={(e) => setForm((f) => ({ ...f, referrerSignupBonus: e.target.value }))}
              />
            </div>
          </div>

          <p className="mt-6 mb-3 text-sm font-semibold text-white">Team milestones (direct referrals)</p>
          <ul className="space-y-3">
            {form.milestones.map((m, i) => (
              <li
                key={i}
                className="grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 sm:grid-cols-[1fr_1fr_1.5fr_auto]"
              >
                <input
                  type="number"
                  min={1}
                  placeholder="Direct count"
                  className={ADMIN.input}
                  value={m.directReferrals}
                  onChange={(e) => updateMilestone(i, "directReferrals", e.target.value)}
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Bonus USDT"
                  className={ADMIN.input}
                  value={m.bonusAmount}
                  onChange={(e) => updateMilestone(i, "bonusAmount", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Label"
                  className={ADMIN.input}
                  value={m.label}
                  onChange={(e) => updateMilestone(i, "label", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      milestones: f.milestones.filter((_, idx) => idx !== i),
                    }))
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({ ...f, milestones: [...f.milestones, emptyMilestone()] }))
            }
            className={`${ADMIN.btnGhost} mt-3`}
          >
            <Plus className="h-4 w-4" /> Add milestone
          </button>
        </section>

        <button type="submit" disabled={saving} className={ADMIN.btnPrimary}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save all settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}
