"use client";

/** Public marketing homepage, rendered at `/` for signed-out visitors (see src/app/page.tsx). */
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { IconTooltip } from "@/components/common/IconTooltip";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { CapabilitiesSection } from "./CapabilitiesSection";
import { AIFeaturesSection } from "./AIFeaturesSection";
import { FAQSection } from "./FAQSection";

const CONTRIBUTORS = [
  {
    name: "Kashish Gupta",
    handle: "kashishg173",
    url: "https://github.com/kashishg173",
    avatar: "https://avatars.githubusercontent.com/u/99259681?v=4",
  },
  {
    name: "Vibhu Jain",
    handle: "VibhuJ01",
    url: "https://github.com/VibhuJ01",
    avatar: "https://avatars.githubusercontent.com/u/94007826?v=4",
  },
];

// No hard max-width: headline/paragraph text keep their own narrower `max-w` for
// readability, so the outer container is free to grow with the viewport instead of
// leaving a fixed, ever-widening dead margin on large screens.
const CONTAINER = "w-full px-4 sm:px-8 lg:px-12 xl:px-20 2xl:px-32";

const NAV_LINKS = [
  { href: "#capabilities", label: "Features" },
  { href: "#ai-features", label: "AI Assistant" },
  { href: "#security", label: "Security" },
];

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeHeader />
      <main className="flex-1">
        <HeroSection />
        <CapabilitiesSection />
        <AIFeaturesSection />
        <FAQSection />
      </main>
      <HomeFooter />
    </div>
  );
}

function HomeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className={cn(CONTAINER, "flex h-16 items-center")}>
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-brand-navy">
            <span className="size-2.5 rotate-45 rounded-[2px] bg-brand-lime" />
          </span>
          <span className="font-bold tracking-tight text-foreground">LMS AI</span>
        </Link>

        {/* Everything else lives in one right-aligned group, so nav + CTA + mobile trigger all sit flush against the right edge. */}
        <div className="ml-auto flex items-center gap-6">
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.login}
              className={cn(
                buttonVariants({ size: "sm" }),
                "shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95",
              )}
            >
              Sign in
            </Link>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <IconTooltip label="Open menu">
                <SheetTrigger
                  aria-label="Open navigation menu"
                  className="inline-flex size-9 items-center justify-center rounded-md text-foreground hover:bg-muted sm:hidden"
                >
                  <Menu className="size-5" />
                </SheetTrigger>
              </IconTooltip>
              <SheetContent side="right" className="w-72">
                <SheetTitle>Navigate</SheetTitle>
                <nav className="mt-6 flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(120%_80%_at_50%_0%,#eef3fb_0%,#ffffff_65%)]">
      <span aria-hidden className="absolute -top-10 right-[8%] size-40 rounded-3xl bg-brand-sky/70 animate-float-a" />
      <span aria-hidden className="absolute top-24 -left-10 size-32 rounded-3xl bg-brand-lime/60 animate-float-b" />
      <span aria-hidden className="absolute top-52 right-[18%] size-16 rounded-2xl bg-brand-navy/10 animate-float-b" />

      <div className={cn(CONTAINER, "relative flex flex-col items-center pt-20 pb-24 text-center sm:pt-28")}>
        <span className="hero-enter inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700">
          <Sparkles className="size-3.5 animate-pulse text-primary" />
          Now with an AI Assistant &amp; Email Composer
        </span>

        <h1 className="hero-enter mt-6 max-w-3xl text-4xl leading-tight font-extrabold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-6 fill-mode-both delay-150 duration-700 sm:text-5xl">
          The multi-tenant LMS that thinks alongside your team
        </h1>
        <p className="hero-enter mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-bottom-6 fill-mode-both delay-300 duration-700">
          Manage companies, leads, and employees with role-based permissions that hold up
          everywhere, then let AI answer the questions your dashboards can&apos;t,
          and draft the emails your reps don&apos;t have time to write.
        </p>

        <div className="hero-enter mt-8 flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-6 fill-mode-both delay-500 duration-700">
          {/* PROTOTYPE: new pill/gradient/glow treatment, applied here only pending review before rolling out to every button. */}
          <Link
            href={ROUTES.login}
            className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-navy to-[#3a4d82] px-9 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(44,58,100,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-6px_rgba(44,58,100,0.55)] hover:ring-4 hover:ring-brand-lime/30 active:translate-y-0"
          >
            Sign in
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <a
            href="#capabilities"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 border-2 border-brand-navy/15 bg-card px-8 text-base shadow-sm transition-all hover:scale-105 hover:border-brand-navy/25 hover:shadow-md active:scale-95",
            )}
          >
            Explore features
          </a>
        </div>

        <div className="hero-enter w-full animate-in fade-in slide-in-from-bottom-6 fill-mode-both delay-700 duration-700">
          <HeroPreviewCard />
        </div>
      </div>
    </section>
  );
}

/** Lightweight illustrative mockup, not a screenshot, just brand-consistent shapes. */
function HeroPreviewCard() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-3xl rounded-2xl border bg-card p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-destructive/60" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-green-500/70" />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-secondary p-4">
          <p className="text-xs text-muted-foreground">Leads</p>
          <p className="mt-1 text-2xl font-bold text-foreground">128</p>
        </div>
        <div className="rounded-xl bg-secondary p-4">
          <p className="text-xs text-muted-foreground">Employees</p>
          <p className="mt-1 text-2xl font-bold text-foreground">24</p>
        </div>
        <div className="rounded-xl border border-brand-navy/15 bg-brand-lime/20 p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Sparkles className="size-3.5" />
            AI Assistant
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">3 leads need follow-up</p>
        </div>
      </div>
    </div>
  );
}

function HomeFooter() {
  return (
    <footer className="relative border-t">
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-navy via-brand-lime to-brand-sky" />
      <div className={cn(CONTAINER, "flex flex-col items-center gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between")}>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <span>Built by</span>
          <div className="flex items-center gap-3">
            {CONTRIBUTORS.map((person) => (
              <a
                key={person.handle}
                href={person.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 rounded-full py-1 pr-3 pl-1 transition-colors hover:bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- external GitHub avatar, not a static asset */}
                <img
                  src={person.avatar}
                  alt=""
                  className="size-6 rounded-full ring-1 ring-border"
                  width={24}
                  height={24}
                />
                <span className="font-medium text-foreground group-hover:underline">{person.name}</span>
              </a>
            ))}
          </div>
        </div>

        <p>© 2026 LMS AI · one identity, every product</p>
      </div>
    </footer>
  );
}
