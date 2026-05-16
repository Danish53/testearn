import { redirect } from "next/navigation";

/** Unified login at /login */
export default function AdminLoginRedirect() {
  redirect("/login?from=%2Fadmin");
}
