import { connectDB } from "@/lib/mongodb";
import { isValidUsername, referralCodeFromUsername } from "@/lib/auth/referral";
import { formatUserAdmin } from "@/lib/admin/format-user-admin";
import User from "@/models/User";

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listAdminUsers({ q = "", status = "all", page = 1, limit = 20 }) {
  await connectDB();

  const filter = { role: { $ne: "admin" } };
  const trimmed = String(q || "").trim();

  if (status === "blocked") {
    filter.isBlocked = true;
  } else if (status === "active") {
    filter.isBlocked = { $ne: true };
    filter.isVerified = true;
  } else if (status === "unverified") {
    filter.isVerified = false;
  }

  if (trimmed) {
    const rx = new RegExp(escapeRegex(trimmed), "i");
    filter.$or = [{ email: rx }, { username: rx }, { referralCode: rx }];
  }

  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("referredBy", "username referralCode")
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map((u) => formatUserAdmin(u)),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function getAdminUserById(userId) {
  await connectDB();
  const user = await User.findOne({ _id: userId, role: { $ne: "admin" } }).populate(
    "referredBy",
    "username referralCode"
  );
  if (!user) return null;
  return formatUserAdmin(user);
}

export async function updateAdminUser(userId, body) {
  await connectDB();
  const user = await User.findOne({ _id: userId, role: { $ne: "admin" } });
  if (!user) {
    return { ok: false, message: "User not found" };
  }

  if (body.isBlocked !== undefined) {
    const blocked = Boolean(body.isBlocked);
    user.isBlocked = blocked;
    user.blockedAt = blocked ? new Date() : null;
  }

  if (body.isVerified !== undefined) {
    user.isVerified = Boolean(body.isVerified);
  }

  const username =
    body.username !== undefined ? String(body.username).trim().toLowerCase() : undefined;
  const email =
    body.email !== undefined ? String(body.email).trim().toLowerCase() : undefined;

  if (username !== undefined) {
    if (!isValidUsername(username)) {
      return {
        ok: false,
        message: "Username must be 3–32 letters and numbers only (a–z, 0–9)",
      };
    }
    const referralCode = referralCodeFromUsername(username);
    const taken = await User.findOne({
      $or: [{ username }, { referralCode }],
      _id: { $ne: userId },
    });
    if (taken) {
      return { ok: false, message: "Username already taken" };
    }
    user.username = username;
    user.referralCode = referralCode;
  }

  if (email !== undefined) {
    if (!email || !email.includes("@")) {
      return { ok: false, message: "Valid email is required" };
    }
    const taken = await User.findOne({ email, _id: { $ne: userId } });
    if (taken) {
      return { ok: false, message: "Email already in use" };
    }
    user.email = email;
  }

  await user.save();
  await user.populate("referredBy", "username referralCode");

  return { ok: true, user: formatUserAdmin(user) };
}

export async function setUserBlocked(userId, blocked) {
  return updateAdminUser(userId, { isBlocked: blocked });
}
