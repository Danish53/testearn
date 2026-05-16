import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Register — Earning",
  description: "Create your Earning account. Your username is your referral code.",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <AuthShell
        variant="register"
        title="Register"
        subtitle="Username becomes your referral code. Open an invite link to auto-fill your sponsor’s code."
      >
        <Suspense
          fallback={
            <p className="text-center text-sm text-solar-text-muted">Loading form…</p>
          }
        >
          <RegisterForm />
        </Suspense>
      </AuthShell>
    </main>
  );
}
