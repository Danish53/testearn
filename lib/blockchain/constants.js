export const BLOCKCHAIN_MONITOR_ENABLED =
  process.env.BLOCKCHAIN_MONITOR_ENABLED !== "false";

export const STALE_PENDING_HOURS = Number(process.env.STALE_PENDING_HOURS) || 72;

export const STUCK_WITHDRAWAL_HOURS = Number(process.env.STUCK_WITHDRAWAL_HOURS) || 48;

export const MONITOR_USER_BATCH = Number(process.env.MONITOR_USER_BATCH) || 50;
