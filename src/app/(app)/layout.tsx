"use client";

/**
 * Shared layout for every authenticated route (the `(app)` group): runs the
 * auth guard, then renders the sidebar + header shell around the page inside a
 * rounded, floating container.
 */
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/constants";
import FullPageLoader from "@/components/FullPageLoader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.status === "guest") router.replace(ROUTES.login);
  }, [auth.status, router]);

  if (auth.status !== "authed") {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1100px_600px_at_100%_0%,#dbe7f8_0%,#eaf0f8_45%,#f3f6fb_100%)] lg:p-3">
      <div className="flex min-h-screen overflow-hidden bg-card lg:min-h-[calc(100vh-1.5rem)] lg:rounded-3xl lg:border lg:shadow-sm">
        <AppSidebar profile={auth.profile} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader profile={auth.profile} />
          <main className="mx-auto w-full max-w-6xl flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
