/** Route: `/forgot-password` — 3-step OTP password reset. */
import AuthShell from "@/components/AuthShell";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
