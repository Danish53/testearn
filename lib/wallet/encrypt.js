import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const raw = process.env.WALLET_ENCRYPTION_KEY;
  if (!raw || raw.length < 16) {
    throw new Error("WALLET_ENCRYPTION_KEY must be at least 16 characters");
  }
  return crypto.scryptSync(raw, "earning-wallet-salt", 32);
}

/** Encrypt mnemonic / private key for database storage. */
export function encryptSecret(plainText) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}
