import { connectDB } from "@/lib/mongodb";
import { comparePassword } from "@/lib/auth/password";
import { signAuthToken } from "@/lib/auth/jwt";
import { signAdminToken } from "@/lib/auth/admin-jwt";
import { setAuthCookie, clearAuthCookie } from "@/lib/api/auth-cookie";
import { setAdminCookie, clearAdminCookie } from "@/lib/api/admin-cookie";
import { adminToPublicJSON } from "@/lib/api/get-session-admin";
import { ensureAdminUser } from "@/lib/admin/ensure-admin";
import User from "@/models/User";

/**
 * Single login for users and admins. Sets the correct session cookie(s).
 * @returns {{ ok: true, role: 'admin'|'user', admin?: object, user?: object } | { ok: false, message: string, status: number }}
 */
export async function performLogin(email, password) {
  if (!email || !password) {
    return { ok: false, message: "Email and password are required", status: 400 };
  }

  await connectDB();
  await ensureAdminUser();

  const user = await User.findOne({ email });
  if (!user) {
    return { ok: false, message: "Invalid email or password", status: 401 };
  }

  const match = await comparePassword(password, user.passwordHash);
  if (!match) {
    return { ok: false, message: "Invalid email or password", status: 401 };
  }

  if (user.role === "admin") {
    await clearAuthCookie();
    const token = await signAdminToken({
      adminId: user._id.toString(),
      email: user.email,
      role: "admin",
    });
    await setAdminCookie(token);
    return { ok: true, role: "admin", admin: adminToPublicJSON(user) };
  }

  if (!user.isVerified) {
    return { ok: false, message: "Please verify your email first", status: 403 };
  }

  await clearAdminCookie();
  const token = await signAuthToken({
    userId: user._id.toString(),
    email: user.email,
  });
  await setAuthCookie(token);
  await user.populate("referredBy", "username referralCode");

  return { ok: true, role: "user", user: user.toPublicJSON() };
}
