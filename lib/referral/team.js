import { connectDB } from "@/lib/mongodb";
import Commission from "@/models/Commission";
import User from "@/models/User";

async function memberIdsAtLevel(parentIds) {
  if (!parentIds.length) return [];
  const rows = await User.find({
    referredBy: { $in: parentIds },
    isVerified: true,
  })
    .select("_id")
    .lean();
  return rows.map((r) => r._id);
}

async function membersAtLevel(parentIds) {
  if (!parentIds.length) return [];
  return User.find({
    referredBy: { $in: parentIds },
    isVerified: true,
  })
    .select("username referralCode activePackage totalInvested createdAt")
    .sort({ createdAt: -1 })
    .lean();
}

async function commissionSumByLevel(earnerId, level) {
  const rows = await Commission.aggregate([
    { $match: { userId: earnerId, level } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return rows[0]?.total ?? 0;
}

export async function getReferralTeam(userId) {
  await connectDB();

  const level1Ids = await memberIdsAtLevel([userId]);
  const level2Ids = await memberIdsAtLevel(level1Ids);
  const level3Ids = await memberIdsAtLevel(level2Ids);

  const [l1Members, l2Members, l3Members] = await Promise.all([
    membersAtLevel([userId]),
    membersAtLevel(level1Ids),
    membersAtLevel(level2Ids),
  ]);

  const mapMember = (u, level) => ({
    id: u._id.toString(),
    username: u.username,
    referralCode: u.referralCode,
    name: u.username,
    level,
    package: u.activePackage || "—",
    joined: new Date(u.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    volume: u.totalInvested ?? 0,
  });

  const levels = [
    {
      level: 1,
      label: "Level 1 — Direct",
      count: level1Ids.length,
      volume: l1Members.reduce((s, m) => s + (m.totalInvested || 0), 0),
      commission: await commissionSumByLevel(userId, 1),
    },
    {
      level: 2,
      label: "Level 2 — Indirect",
      count: level2Ids.length,
      volume: l2Members.reduce((s, m) => s + (m.totalInvested || 0), 0),
      commission: await commissionSumByLevel(userId, 2),
    },
    {
      level: 3,
      label: "Level 3 — Network",
      count: level3Ids.length,
      volume: l3Members.reduce((s, m) => s + (m.totalInvested || 0), 0),
      commission: await commissionSumByLevel(userId, 3),
    },
  ];

  const members = [
    ...l1Members.map((m) => mapMember(m, 1)),
    ...l2Members.map((m) => mapMember(m, 2)),
    ...l3Members.map((m) => mapMember(m, 3)),
  ];

  const user = await User.findById(userId).select("username referralCode referralEarnings");

  return {
    referralCode: user?.referralCode || "",
    referralEarnings: user?.referralEarnings ?? 0,
    teamSize: level1Ids.length + level2Ids.length + level3Ids.length,
    directCount: level1Ids.length,
    levels,
    members,
    totalVolume: levels.reduce((s, l) => s + l.volume, 0),
    totalCommission: levels.reduce((s, l) => s + l.commission, 0),
  };
}
