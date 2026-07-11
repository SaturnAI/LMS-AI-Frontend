"use client";

/** Client route guard: renders children, a loader, or ForbiddenState based on the profile. Wraps guarded pages. */
import type { ReactNode } from "react";
import type { Profile } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import FullPageLoader from "@/components/FullPageLoader";
import { ForbiddenState } from "./ForbiddenState";

/**
 * Client-side route guard. The (app) layout already ensures authentication;
 * this narrows access by role/permission. Server enforcement is still required.
 */
export function RequireAccess({
  allow,
  children,
}: {
  allow: (profile: Profile) => boolean;
  children: ReactNode;
}) {
  const auth = useAuth();
  if (auth.status === "loading") return <FullPageLoader />;
  if (auth.status !== "authed") return null; // layout handles the redirect to /login
  if (!allow(auth.profile)) return <ForbiddenState />;
  return <>{children}</>;
}
