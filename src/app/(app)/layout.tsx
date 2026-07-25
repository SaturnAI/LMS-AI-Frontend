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
import { TenantContextBar } from "@/components/layout/TenantContextBar";

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
    <div className="h-screen overflow-hidden bg-[radial-gradient(1100px_600px_at_100%_0%,#dbe7f8_0%,#eaf0f8_45%,#f3f6fb_100%)] lg:p-3">
      <div className="flex h-full overflow-hidden bg-card lg:h-[calc(100vh-1.5rem)] lg:rounded-3xl lg:border lg:shadow-sm">
        <AppSidebar profile={auth.profile} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AppHeader profile={auth.profile} />
          <div className="flex-1 overflow-y-auto">
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 lg:gap-6 lg:p-8">
              <TenantContextBar profile={auth.profile} />
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
