"use client";

/**
 * Shared layout for every authenticated route (the `(app)` group): runs the
 * auth guard, then renders the sidebar + header shell around the page.
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
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar profile={auth.profile} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader profile={auth.profile} />
        <div className="flex-1 overflow-y-auto">
          <main className="flex w-full flex-col gap-4 p-4 lg:gap-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
