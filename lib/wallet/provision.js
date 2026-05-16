import { generateUserWallet } from "@/lib/wallet/generate";

export function userHasWallet(user) {
  const w = user?.wallet;
  return Boolean(w?.bep20Address && w?.trc20Address && w?.encryptedPrivateKey && w?.encryptedMnemonic);
}

/**
 * Auto-provision wallet during registration: address + encrypted private key + mnemonic.
 * Idempotent — skips if wallet already exists.
 */
export async function ensureUserWallet(user) {
  if (userHasWallet(user)) {
    return user.wallet;
  }

  const wallet = await generateUserWallet();
  user.wallet = wallet;
  user.walletCreatedAt = user.walletCreatedAt || new Date();
  await user.save();
  return wallet;
}
