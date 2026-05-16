import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Register — Earning",
  description: "Create your Earning account to access solar insights and tools.",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <AuthShell
        variant="register"
        title="Register"
        subtitle="Create an account with username, email, and password. Referral code is optional."
      >
        <RegisterForm />
      </AuthShell>
    </main>
  );
}
