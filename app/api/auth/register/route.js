import { connectDB } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth/password";
import { generateOtpCode, hashOtp, otpExpiryDate } from "@/lib/auth/otp";
import { buildReferralCode } from "@/lib/auth/referral";
import { sendOtpEmail } from "@/lib/email/sendOtp";
import { jsonError, jsonOk } from "@/lib/api/response";
import User from "@/models/User";

export async function POST(request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim().toLowerCase();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const referralCode = String(body.referralCode || "").trim().toUpperCase();

    if (!username || username.length < 3) {
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

    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode, isVerified: true });
      if (!referrer) {
        return jsonError("Invalid referral code");
      }
      referredBy = referrer._id;
    }

    const passwordHash = await hashPassword(password);
    const otp = generateOtpCode();
    const otpHash = await hashOtp(otp);

    let user = existing;
    if (user) {
      user.username = username;
      user.passwordHash = passwordHash;
      user.referredBy = referredBy;
      user.otpHash = otpHash;
      user.otpExpiresAt = otpExpiryDate();
      user.isVerified = false;
      if (!user.referralCode) user.referralCode = buildReferralCode(username);
    } else {
      user = await User.create({
        username,
        email,
        passwordHash,
        referralCode: buildReferralCode(username),
        referredBy,
        isVerified: false,
        otpHash,
        otpExpiresAt: otpExpiryDate(),
      });
    }

    await sendOtpEmail(email, otp);

    return jsonOk({
      message: "Verification code sent to your email",
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
