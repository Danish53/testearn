import { connectDB } from "@/lib/mongodb";
import { normalizeEmail } from "@/lib/auth/normalize-email";
import { hashPassword } from "@/lib/auth/password";
import { generateOtpCode, hashOtp, otpExpiryDate } from "@/lib/auth/otp";
import { isValidUsername, referralCodeFromUsername } from "@/lib/auth/referral";
import { sendOtpEmail } from "@/lib/email/sendOtp";
import { jsonError, jsonOk } from "@/lib/api/response";
import { getReferralSettings } from "@/lib/referral/settings";
import { ensureUserWallet } from "@/lib/wallet/provision";
import User from "@/models/User";

export async function POST(request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim().toLowerCase();
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const sponsorCode = String(body.referralCode || body.sponsorCode || "")
      .trim()
      .toUpperCase();

    if (!isValidUsername(username)) {
      return jsonError("Username must be 3–32 letters and numbers only (a–z, 0–9)");
    }

    const ownReferralCode = referralCodeFromUsername(username);
    if (!ownReferralCode || ownReferralCode.length < 3) {
      return jsonError("Username must be at least 3 characters");
    }
    if (!email || !email.includes("@")) {
      return jsonError("Valid email is required");
    }
    if (password.length < 6) {
      return jsonError("Password must be at least 6 characters");
    }

    await connectDB();

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing?.isVerified) {
      return jsonError("Email or username already registered", 409);
    }

    const referralSettings = await getReferralSettings();

    let referredBy = null;
    if (sponsorCode) {
      if (sponsorCode === ownReferralCode) {
        return jsonError("You cannot use your own referral code");
      }
      const referrer = await User.findOne({ referralCode: sponsorCode, isVerified: true });
      if (!referrer) {
        return jsonError("Invalid referral code");
      }
      referredBy = referrer._id;
    } else if (referralSettings.requireSponsorOnRegister) {
      return jsonError("Referral / sponsor code is required to register");
    }

    const passwordHash = await hashPassword(password);
    const otp = generateOtpCode();
    const otpHash = await hashOtp(otp);

    let user = existing;
    if (user) {
      user.username = username;
      user.email = email;
      user.passwordHash = passwordHash;
      user.referredBy = referredBy;
      user.otpHash = otpHash;
      user.otpExpiresAt = otpExpiryDate();
      user.isVerified = false;
      user.referralCode = ownReferralCode;
      await user.save();
    } else {
      user = await User.create({
        username,
        email,
        passwordHash,
        referralCode: ownReferralCode,
        referredBy,
        isVerified: false,
        otpHash,
        otpExpiresAt: otpExpiryDate(),
      });
    }

    await ensureUserWallet(user);
    await sendOtpEmail(email, otp);

    return jsonOk({
      message: "Verification code sent. Your USDT wallets (BEP20 + TRC20) are ready after email verification.",
      email: user.email,
    });
  } catch (err) {
    console.error("register:", err);
    if (err.code === 11000) {
      return jsonError("Email or username already in use", 409);
    }
    return jsonError(err.message || "Registration failed", 500);
  }
}
