import { ethers } from "ethers";
import { encryptSecret } from "@/lib/wallet/encrypt";

async function tronAddressFromPrivateKey(privateKeyHex) {
  const mod = await import("tronweb");
  const TronWeb = mod.default?.TronWeb ?? mod.TronWeb ?? mod.default;
  const tronWeb = new TronWeb({ fullHost: "https://api.trongrid.io" });
  return tronWeb.address.fromPrivateKey(privateKeyHex.replace(/^0x/, ""));
}

/**
 * Create BEP20 (ethers) + TRC20 (Tron) wallets from one mnemonic.
 * Keys are encrypted before persistence.
 */
export async function generateUserWallet() {
  const wallet = ethers.Wallet.createRandom();
  const mnemonic = wallet.mnemonic.phrase;
  const privateKey = wallet.privateKey;
  const bep20Address = wallet.address;
  const trc20Address = await tronAddressFromPrivateKey(privateKey);

  return {
    bep20Address,
    trc20Address,
    encryptedPrivateKey: encryptSecret(privateKey),
    encryptedMnemonic: encryptSecret(mnemonic),
  };
}
