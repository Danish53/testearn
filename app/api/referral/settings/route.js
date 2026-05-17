import { getReferralSettings } from "@/lib/referral/settings";
import { jsonOk } from "@/lib/api/response";

/** Public commission rates for dashboard display. */
export async function GET() {
  try {
    const doc = await getReferralSettings();
    return jsonOk({ settings: doc.toPublicJSON() });
  } catch (err) {
    console.error("referral/settings GET:", err);
    return jsonOk({
      settings: {
        commissionEnabled: true,
        maxLevels: 3,
        levels: [
          { level: 1, label: "Direct (L1)", percent: 10 },
          { level: 2, label: "Indirect (L2)", percent: 5 },
          { level: 3, label: "Indirect (L3)", percent: 3 },
        ],
        requireSponsorOnRegister: false,
      },
    });
  }
}
