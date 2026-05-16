export const MIN_WITHDRAW_USDT = Number(process.env.MIN_WITHDRAW_USDT || 20);
export const WITHDRAW_FEE_USDT = Number(process.env.WITHDRAW_FEE_USDT || 1);
export const MAX_DAILY_WITHDRAW_USDT = Number(process.env.MAX_DAILY_WITHDRAW_USDT || 5000);

export const WITHDRAW_AUTO_APPROVE = process.env.WITHDRAW_AUTO_APPROVE === "true";
export const WITHDRAW_DRY_RUN = process.env.WITHDRAW_DRY_RUN !== "false";
