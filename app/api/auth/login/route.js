import { connectDB } from "@/lib/mongodb";
import { comparePassword } from "@/lib/auth/password";
import { signAuthToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/api/auth-cookie";
import { jsonError, jsonOk } from "@/lib/api/response";
import User from "@/models/User";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return jsonError("Email and password are required");
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return jsonError("Invalid email or password", 401);
    }
    if (!user.isVerified) {
      return jsonError("Please verify your email first", 403);
    }

    const match = await comparePassword(password, user.passwordHash);
    if (!match) {
      return jsonError("Invalid email or password", 401);
    }

    const token = await signAuthToken({
      userId: user._id.toString(),
      email: user.email,
    });
    await setAuthCookie(token);

    return jsonOk({ user: user.toPublicJSON() });
  } catch (err) {
    console.error("login:", err);
    return jsonError(err.message || "Login failed", 500);
  }
}
