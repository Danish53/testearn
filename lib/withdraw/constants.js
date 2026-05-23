export const MIN_WITHDRAW_USDT = Number(process.env.MIN_WITHDRAW_USDT || 1);
/** @deprecated Use getWithdrawFeeForNetwork — kept for older env files */
export const WITHDRAW_FEE_USDT = Number(
  process.env.WITHDRAW_FEE_TRC20_USDT ?? process.env.WITHDRAW_FEE_USDT ?? 1
);
export const WITHDRAW_FEE_TRC20_USDT = Number(
  process.env.WITHDRAW_FEE_TRC20_USDT ?? process.env.WITHDRAW_FEE_USDT ?? 1
);
export const WITHDRAW_FEE_BEP20_USDT = Number(process.env.WITHDRAW_FEE_BEP20_USDT ?? 0.1);
export const MAX_DAILY_WITHDRAW_USDT = Number(process.env.MAX_DAILY_WITHDRAW_USDT || 5000);

/** TRC20: default $1 fee · BEP20: default $0.1 */
export function getWithdrawFeeForNetwork(network) {
  if (network === "bep20") return WITHDRAW_FEE_BEP20_USDT;
  if (network === "trc20") return WITHDRAW_FEE_TRC20_USDT;
  return WITHDRAW_FEE_TRC20_USDT;
}

export const WITHDRAW_AUTO_APPROVE = process.env.WITHDRAW_AUTO_APPROVE === "true";
/** If true, approve triggers on-chain send from platform wallet (not manual admin payout). */
export const WITHDRAW_AUTO_SEND = process.env.WITHDRAW_AUTO_SEND === "true";
export const WITHDRAW_DRY_RUN = process.env.WITHDRAW_DRY_RUN !== "false";
