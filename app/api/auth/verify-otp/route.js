import { connectDB } from "@/lib/mongodb";
import { verifyOtp } from "@/lib/auth/otp";
import { signAuthToken } from "@/lib/auth/jwt";
import { applyVerificationBonuses } from "@/lib/referral/bonuses";
import { ensureUserWallet } from "@/lib/wallet/provision";
import { setAuthCookie } from "@/lib/api/auth-cookie";
import { jsonError, jsonOk } from "@/lib/api/response";
import User from "@/models/User";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const otp = String(body.otp || "").trim();

    if (!email || !otp) {
      return jsonError("Email and OTP are required");
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return jsonError("Account not found. Please register first.");
    }
    if (user.isVerified) {
      return jsonError("Account already verified. Please log in.", 409);
    }
    if (!user.otpHash || !user.otpExpiresAt) {
      return jsonError("No pending verification. Request a new code.");
    }
    if (user.otpExpiresAt < new Date()) {
      return jsonError("OTP expired. Request a new code.");
    }

    const valid = await verifyOtp(otp, user.otpHash);
    if (!valid) {
      return jsonError("Invalid verification code");
    }

    await ensureUserWallet(user);
    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    await user.save();
    await applyVerificationBonuses(user);
    await user.populate("referredBy", "username referralCode");

    const token = await signAuthToken({
      userId: user._id.toString(),
      email: user.email,
    });
    await setAuthCookie(token);

    return jsonOk({
      message: "Account verified. Wallet created.",
      user: user.toPublicJSON(),
    });
  } catch (err) {
    console.error("verify-otp:", err);
    return jsonError(err.message || "Verification failed", 500);
  }
}
