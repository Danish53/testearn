import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import OtpForm from "@/components/auth/OtpForm";

export const metadata = {
  title: "Verify email — Solar Earning",
  description: "Enter the verification code sent to your email.",
};

function OtpFallback() {
  return (
    <p className="text-center text-sm text-solar-text-muted">Loading verification…</p>
  );
}

export default function VerifyOtpPage() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <AuthShell
        variant="register"
        title="Verify email"
        subtitle="Enter the 6-digit code we sent you. Your crypto wallet is created right after verification."
      >
        <Suspense fallback={<OtpFallback />}>
          <OtpForm />
        </Suspense>
      </AuthShell>
    </main>
  );
}
