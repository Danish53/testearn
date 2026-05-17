/** Supported deposit networks — BEP20 first, then TRC20 (display order everywhere). */
export const SUPPORTED_NETWORKS = [
  {
    id: "bep20",
    label: "BEP20",
    chain: "BNB Smart Chain",
    token: "USDT",
    addressField: "bep20Address",
  },
  {
    id: "trc20",
    label: "TRC20",
    chain: "Tron",
    token: "USDT",
    addressField: "trc20Address",
  },
];

export const DEFAULT_NETWORK_ID = "bep20";

export const NETWORK_IDS = SUPPORTED_NETWORKS.map((n) => n.id);

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

export function networkTabLabel(id) {
  if (id === "bep20") return "BEP20 · BSC";
  if (id === "trc20") return "TRC20 · Tron";
  return id;
}
