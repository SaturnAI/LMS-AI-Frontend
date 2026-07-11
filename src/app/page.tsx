"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import FullPageLoader from "@/components/FullPageLoader";

/**
 * App entry / auth gate. The Google OAuth callback lands here; we check the
 * session via get_profile and route the user to the dashboard or to login.
 */
export default function Home() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.status === "authed") router.replace("/dashboard");
    else if (auth.status === "guest") router.replace("/login");
  }, [auth.status, router]);

  return <FullPageLoader label="Loading your workspace…" />;
}
