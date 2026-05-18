import User from "@/models/User";

export async function updateUserProfile(userId, { username, email }) {
  const current = await User.findById(userId);
  if (!current) {
    return { ok: false, message: "User not found" };
  }

  if (username !== undefined) {
    const normalizedUsername = String(username).trim().toLowerCase();
    if (normalizedUsername && normalizedUsername !== current.username) {
      return { ok: false, message: "Username cannot be changed" };
    }
  }

  const updates = {};
  const normalizedEmail =
    email !== undefined ? String(email).trim().toLowerCase() : undefined;

  if (normalizedEmail !== undefined) {
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return { ok: false, message: "Valid email is required" };
    }
    updates.email = normalizedEmail;
  }

  if (Object.keys(updates).length === 0) {
    return { ok: false, message: "Nothing to update" };
  }

  if (updates.email && updates.email !== current.email) {
    const taken = await User.findOne({ email: updates.email, _id: { $ne: userId } });
    if (taken) {
      return { ok: false, message: "Email already in use" };
    }
  }

  Object.assign(current, updates);
  await current.save();
  await current.populate("referredBy", "username referralCode");

  return { ok: true, user: current };
}
