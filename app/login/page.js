import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login — Earning",
  description: "Sign in to your Earning solar dashboard.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <AuthShell
        variant="login"
        title="Login"
        subtitle="Sign in with your account — members go to the dashboard, administrators to the admin panel."
      >
        <Suspense fallback={<p className="text-sm text-solar-text-muted">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </AuthShell>
    </main>
  );
}
