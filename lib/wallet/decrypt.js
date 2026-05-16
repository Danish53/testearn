import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const raw = process.env.WALLET_ENCRYPTION_KEY;
  if (!raw || raw.length < 16) {
    throw new Error("WALLET_ENCRYPTION_KEY must be at least 16 characters");
  }
  return crypto.scryptSync(raw, "earning-wallet-salt", 32);
}

/** Server-only — decrypt stored private key or mnemonic. Never expose via public API. */
export function decryptSecret(payload) {
  const key = getEncryptionKey();
  const [ivHex, tagHex, dataHex] = String(payload).split(":");
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error("Invalid encrypted payload");
  }
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return plain.toString("utf8");
}
