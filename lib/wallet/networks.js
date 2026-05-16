/** Supported deposit networks — USDT on Tron (TRC20) and BSC (BEP20). */
export const SUPPORTED_NETWORKS = [
  {
    id: "trc20",
    label: "TRC20",
    chain: "Tron",
    token: "USDT",
    addressField: "trc20Address",
  },
  {
    id: "bep20",
    label: "BEP20",
    chain: "BNB Smart Chain",
    token: "USDT",
    addressField: "bep20Address",
  },
];

export function getNetworkAddress(wallet, networkId) {
  if (!wallet) return "";
  const net = SUPPORTED_NETWORKS.find((n) => n.id === networkId);
  if (!net) return "";
  return wallet[net.addressField] || "";
}

export function walletNetworksForUser(wallet) {
  return SUPPORTED_NETWORKS.map((n) => ({
    id: n.id,
    label: n.label,
    chain: n.chain,
    token: n.token,
    address: wallet?.[n.addressField] || "",
  }));
}
