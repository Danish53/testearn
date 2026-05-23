import { connectDB } from "@/lib/mongodb";
import WalletAlert from "@/models/WalletAlert";

export async function upsertWalletAlert(userId, alert) {
  await connectDB();
  const doc = await WalletAlert.findOneAndUpdate(
    {
      userId,
      txHash: alert.txHash,
      alertType: alert.alertType,
    },
    {
      $set: {
        network: alert.network,
        assetSymbol: alert.assetSymbol || "",
        amount: alert.amount ?? 0,
        message: alert.message,
      },
      $setOnInsert: { read: false },
    },
    { upsert: true, new: true }
  );
  return doc;
}

/** Recent notices — includes older wrong payments (read + unread), last 90 days. */
export async function listWalletAlertsForUser(userId, limit = 30) {
  await connectDB();
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const rows = await WalletAlert.find({ userId, createdAt: { $gte: since } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return rows.map((a) => ({
    id: a._id.toString(),
    network: a.network,
    alertType: a.alertType,
    txHash: a.txHash,
    assetSymbol: a.assetSymbol,
    amount: a.amount,
    message: a.message,
    read: Boolean(a.read),
    createdAt: a.createdAt,
  }));
}

export async function listUnreadWalletAlerts(userId, limit = 15) {
  const all = await listWalletAlertsForUser(userId, limit * 2);
  return all.filter((a) => !a.read).slice(0, limit);
}

export async function markWalletAlertsRead(userId, alertIds = []) {
  await connectDB();
  const filter = { userId, read: false };
  if (alertIds.length > 0) {
    filter._id = { $in: alertIds };
  }
  await WalletAlert.updateMany(filter, { $set: { read: true } });
}
