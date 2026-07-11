"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import AuthShell from "@/components/AuthShell";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();

  // Auto-login: if a session already exists, skip the form.
  useEffect(() => {
    if (auth.status === "authed") router.replace("/dashboard");
  }, [auth.status, router]);

  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
