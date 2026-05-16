import { ethers } from "ethers";

export function validateWithdrawAddress(network, address) {
  const raw = String(address || "").trim();
  if (!raw) return { ok: false, message: "Destination address is required" };

  if (network === "bep20") {
    if (!ethers.isAddress(raw)) {
      return { ok: false, message: "Invalid BEP20 address (must start with 0x)" };
    }
    return { ok: true, normalized: ethers.getAddress(raw) };
  }

  if (network === "trc20") {
    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(raw)) {
      return { ok: false, message: "Invalid TRC20 address (must start with T)" };
    }
    return { ok: true, normalized: raw };
  }

  return { ok: false, message: "Unsupported network" };
}
