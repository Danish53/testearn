import { connectDB } from "@/lib/mongodb";
import { verifyAdminToken } from "@/lib/auth/admin-jwt";
import { getAdminTokenFromCookie } from "@/lib/api/admin-cookie";
import User from "@/models/User";

export async function getSessionAdmin() {
  const token = await getAdminTokenFromCookie();
  if (!token) return null;

  let payload;
  try {
    payload = await verifyAdminToken(token);
  } catch {
    return null;
  }

  await connectDB();
  const user = await User.findById(payload.adminId);
  if (!user || user.role !== "admin" || !user.isVerified) return null;
  return user;
}

export function adminToPublicJSON(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role,
  };
}
