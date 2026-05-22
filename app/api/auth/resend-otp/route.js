import { normalizeEmail } from "@/lib/auth/normalize-email";
import { connectDB } from "@/lib/mongodb";
import { generateOtpCode, hashOtp, otpExpiryDate } from "@/lib/auth/otp";
import { sendOtpEmail } from "@/lib/email/sendOtp";
import { jsonError, jsonOk } from "@/lib/api/response";
import User from "@/models/User";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);

    if (!email) return jsonError("Email is required");

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) return jsonError("Account not found");
    if (user.isVerified) return jsonError("Account already verified. Please log in.");

    const otp = generateOtpCode();
    user.otpHash = await hashOtp(otp);
    user.otpExpiresAt = otpExpiryDate();
    await user.save();

    await sendOtpEmail(email, otp);

    return jsonOk({ message: "New verification code sent" });
  } catch (err) {
    console.error("resend-otp:", err);
    return jsonError(err.message || "Could not resend code", 500);
  }
}
