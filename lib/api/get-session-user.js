import { connectDB } from "@/lib/mongodb";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { getAuthTokenFromCookie } from "@/lib/api/auth-cookie";
import User from "@/models/User";

export async function getSessionUser() {
  const token = await getAuthTokenFromCookie();
  if (!token) return null;

  let payload;
  try {
    payload = await verifyAuthToken(token);
  } catch {
    return null;
  }

  await connectDB();
  const user = await User.findById(payload.userId).populate(
    "referredBy",
    "username referralCode"
  );
  if (!user || !user.isVerified) return null;
  return user;
}
