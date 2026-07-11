import type { ReactNode } from "react";
import styles from "./AuthShell.module.css";

/**
 * Split-screen shell shared by all auth pages (login, forgot-password).
 * Left: brand panel. Right: the page's form, passed as children.
 */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <aside className={styles.brandPanel}>
        <span className={`${styles.shape} ${styles.shapeBlue}`} aria-hidden="true" />
        <span className={`${styles.shape} ${styles.shapeLime}`} aria-hidden="true" />
        <span className={`${styles.shape} ${styles.shapeNavy}`} aria-hidden="true" />

        <div className={styles.brand}>
          <span className={styles.logo}>
            <span className={styles.logoMark} />
          </span>
          <span className={styles.brandName}>LMS AI</span>
        </div>

        <div className={styles.brandCopy}>
          <h2 className={styles.tagline}>
            Your whole workspace,
            <br />
            one login.
          </h2>
          <p className={styles.blurb}>
            CRM, learning, and email automation — one platform, one login. Switch context without
            switching tabs.
          </p>
        </div>

        <div className={styles.brandFoot}>© 2026 LMS AI · one identity, every product</div>
      </aside>

      <section className={styles.formPanel}>{children}</section>
    </main>
  );
}
