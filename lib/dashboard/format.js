export function formatUsd(amount) {
  const n = Number(amount) || 0;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCount(n) {
  return Number(n || 0).toLocaleString("en-US");
}
