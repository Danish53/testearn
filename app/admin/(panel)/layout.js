import AdminShell from "@/components/admin/AdminShell";
import { getSessionAdmin, adminToPublicJSON } from "@/lib/api/get-session-admin";
import { redirect } from "next/navigation";

export const metadata = {
  title: {
    default: "Admin",
    template: "%s — Admin",
  },
};

export default async function AdminPanelLayout({ children }) {
  const admin = await getSessionAdmin();
  if (!admin) {
    redirect("/login?from=/admin");
  }

  return (
    <AdminShell adminEmail={adminToPublicJSON(admin).email}>{children}</AdminShell>
  );
}
