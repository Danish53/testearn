import { PACKAGES } from "@/components/dashboard/packages-data";

export { PACKAGES };

export function getPackageById(packageId) {
  return PACKAGES.find((p) => p.id === packageId) || null;
}
