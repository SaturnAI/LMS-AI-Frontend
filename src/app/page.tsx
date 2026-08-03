"use client";

/**
 * Route: `/` — public marketing homepage for signed-out visitors, auth gate for
 * everyone else. The Google OAuth callback also lands here; we check the session
 * via get_profile and redirect straight to the dashboard if it's already signed in.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import FullPageLoader from "@/components/FullPageLoader";
import { HomePage } from "@/components/home/HomePage";

export default function Home() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.status === "authed") router.replace("/dashboard");
  }, [auth.status, router]);

  if (auth.status === "guest") return <HomePage />;
  return <FullPageLoader label="Loading your workspace…" />;
}
