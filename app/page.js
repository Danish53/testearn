import { redirect } from "next/navigation";

/** Guests are sent to login via middleware; logged-in users go to /dashboard. */
export default function Home() {
  redirect("/login");
}
