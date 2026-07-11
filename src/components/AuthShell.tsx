import type { ReactNode } from "react";

/**
 * Split-screen shell shared by all auth pages (login, forgot-password).
 * Left: brand panel. Right: the page's form, passed as children.
 */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_minmax(420px,520px)]">
      <aside className="relative hidden overflow-hidden p-13 lg:flex lg:flex-col bg-[radial-gradient(120%_100%_at_28%_0%,#f4f7fc_0%,#e7edf6_100%)]">
        {/* Decorative floating blocks */}
        <span
          aria-hidden
          className="absolute -top-8 right-16 size-36 rounded-3xl bg-brand-sky/80 animate-float-a"
        />
        <span
          aria-hidden
          className="absolute bottom-20 -right-8 size-30 rounded-3xl bg-brand-lime/75 animate-float-b"
        />
        <span
          aria-hidden
          className="absolute top-40 -left-6 size-22 rounded-2xl bg-brand-navy/90 animate-float-b"
        />

        <div className="relative z-10 flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-navy">
            <span className="size-3 rotate-45 rounded-[2px] bg-brand-lime" />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">LMS AI</span>
        </div>

        <div className="relative z-10 mt-auto max-w-sm">
          <h2 className="text-4xl leading-tight font-bold tracking-tight text-foreground">
            Your whole workspace,
            <br />
            one login.
          </h2>
          <p className="mt-4 text-[0.97rem] leading-relaxed text-muted-foreground">
            CRM, learning, and email automation — one platform, one login. Switch context without
            switching tabs.
          </p>
        </div>

        <div className="relative z-10 mt-9 text-xs text-muted-foreground/70">
          © 2026 LMS AI · one identity, every product
        </div>
      </aside>

      <section className="flex items-center justify-center bg-background p-8">{children}</section>
    </main>
  );
}
