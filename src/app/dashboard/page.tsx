"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { logout } from "@/lib/api";
import FullPageLoader from "@/components/FullPageLoader";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (auth.status === "guest") router.replace("/login");
  }, [auth.status, router]);

  if (auth.status !== "authed") {
    return <FullPageLoader />;
  }

  const { profile } = auth;

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    router.replace("/login");
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <span className={styles.logoMark} />
          </span>
          <span className={styles.brandName}>LMS AI</span>
        </div>
        <button className={styles.logout} onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </header>

      <section className={styles.body}>
        <h1 className={styles.greeting}>Hello 👋</h1>
        <p className={styles.sub}>
          Welcome to LMS AI, <strong>{profile.name}</strong>. You&apos;re signed in as{" "}
          <strong>{profile.role.replace("_", " ")}</strong>
          {profile.email ? ` · ${profile.email}` : ""}.
        </p>
        <p className={styles.note}>This is your dashboard — more coming soon.</p>
      </section>
    </main>
  );
}
