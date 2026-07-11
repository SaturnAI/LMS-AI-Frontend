"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import FullPageLoader from "@/components/FullPageLoader";

export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const logout = useLogout();

  useEffect(() => {
    if (auth.status === "guest") router.replace("/login");
  }, [auth.status, router]);

  if (auth.status !== "authed") {
    return <FullPageLoader />;
  }

  const { profile } = auth;

  async function handleLogout() {
    await logout.mutateAsync();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-muted">
      <header className="flex items-center justify-between border-b bg-card px-7 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-[9px] bg-brand-navy">
            <span className="size-2.5 rotate-45 rounded-[2px] bg-brand-lime" />
          </span>
          <span className="font-bold tracking-tight text-foreground">LMS AI</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} disabled={logout.isPending}>
          {logout.isPending ? "Signing out…" : "Sign out"}
        </Button>
      </header>

      <section className="mx-auto max-w-4xl px-7 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Hello 👋</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to LMS AI, <strong>{profile.name}</strong>. You&apos;re signed in as{" "}
          <strong>{profile.role.replace("_", " ")}</strong>
          {profile.email ? ` · ${profile.email}` : ""}.
        </p>
        <p className="mt-8 text-sm text-muted-foreground/70">This is your dashboard — more coming soon.</p>
      </section>
    </main>
  );
}
