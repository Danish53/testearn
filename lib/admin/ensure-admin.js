import { connectDB } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth/password";
import { referralCodeFromUsername } from "@/lib/auth/referral";
import User from "@/models/User";

function adminConfig() {
  return {
    email: String(process.env.ADMIN_EMAIL || "admin@gmail.com")
      .trim()
      .toLowerCase(),
    password: String(process.env.ADMIN_PASSWORD || "12345678"),
    username: String(process.env.ADMIN_USERNAME || "admin")
      .trim()
      .toLowerCase(),
  };
}

/** Ensures the platform admin account exists and has role admin. */
export async function ensureAdminUser() {
  const { email, password, username } = adminConfig();
  await connectDB();

  let user = await User.findOne({ email });
  const referralCode = referralCodeFromUsername(username) || "ADMIN";

  if (!user) {
    const passwordHash = await hashPassword(password);
    user = await User.create({
      username,
      email,
      passwordHash,
      referralCode,
      isVerified: true,
      role: "admin",
    });
    return user;
  }

  let changed = false;
  if (user.role !== "admin") {
    user.role = "admin";
    changed = true;
  }
  if (!user.isVerified) {
    user.isVerified = true;
    changed = true;
  }
  if (!user.referralCode) {
    user.referralCode = referralCode;
    changed = true;
  }
  if (changed) await user.save();
  return user;
}
