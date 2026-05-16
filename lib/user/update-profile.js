import { isValidUsername, referralCodeFromUsername } from "@/lib/auth/referral";
import User from "@/models/User";

export async function updateUserProfile(userId, { username, email }) {
  const updates = {};
  const normalizedEmail =
    email !== undefined ? String(email).trim().toLowerCase() : undefined;
  const normalizedUsername =
    username !== undefined ? String(username).trim().toLowerCase() : undefined;

  if (normalizedEmail !== undefined) {
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return { ok: false, message: "Valid email is required" };
    }
    updates.email = normalizedEmail;
  }

  if (normalizedUsername !== undefined) {
    if (!isValidUsername(normalizedUsername)) {
      return {
        ok: false,
        message: "Username must be 3–32 letters and numbers only (a–z, 0–9)",
      };
    }
    const referralCode = referralCodeFromUsername(normalizedUsername);
    updates.username = normalizedUsername;
    updates.referralCode = referralCode;
  }

  if (Object.keys(updates).length === 0) {
    return { ok: false, message: "Nothing to update" };
  }

  const current = await User.findById(userId);
  if (!current) {
    return { ok: false, message: "User not found" };
  }

  if (updates.email && updates.email !== current.email) {
    const taken = await User.findOne({ email: updates.email, _id: { $ne: userId } });
    if (taken) {
      return { ok: false, message: "Email already in use" };
    }
  }

  if (updates.username && updates.username !== current.username) {
    const taken = await User.findOne({
      $or: [{ username: updates.username }, { referralCode: updates.referralCode }],
      _id: { $ne: userId },
    });
    if (taken) {
      return { ok: false, message: "Username already taken" };
    }
  }

  Object.assign(current, updates);
  await current.save();
  await current.populate("referredBy", "username referralCode");

  return { ok: true, user: current };
}
