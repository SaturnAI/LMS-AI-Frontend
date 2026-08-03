/**
 * The two AI features this product is built around. Copy is adapted from the
 * underlying feature research (see AI_COPILOT_RESEARCH.md) rather than quoted
 * verbatim from a spec — grounded in what the architecture actually guarantees
 * (permission-safe answers, CRM-context-aware drafts), not just buzzwords.
 */
import { Mail, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";

export function AIFeaturesSection() {
  return (
    <section id="ai-features" className="scroll-mt-20 bg-secondary/60 py-20">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-20 2xl:px-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-lime/40 px-3 py-1 text-xs font-medium text-foreground">
            <Sparkles className="size-3.5 animate-pulse" />
            AI, built in
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Two AI features, one permission model
          </h2>
          <p className="mt-3 text-muted-foreground">
            The AI layer never gets its own rules — it answers and drafts inside the exact same
            role and tenant boundaries every person on your team already works within.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* AI CRM Copilot */}
          <Reveal delayMs={0} className="group flex flex-col rounded-2xl border bg-card p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex size-12 items-center justify-center rounded-xl bg-brand-navy transition-transform duration-200 group-hover:scale-110">
              <Sparkles className="size-5 text-brand-lime" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-foreground">AI CRM Copilot</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Ask plain-language questions across your leads, employees, and activity logs —
              &ldquo;which leads haven&apos;t been followed up in two weeks?&rdquo; or &ldquo;which
              companies are close to their seat limit?&rdquo; — and get an answer grounded in your
              live CRM data, not a guess. Every question is resolved inside the asker&apos;s own
              role and tenant scope, so the Copilot can never surface a record a person couldn&apos;t
              already see themselves.
            </p>
            <div className="mt-6 flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/50 p-4">
              <div className="self-end rounded-xl rounded-br-sm bg-primary px-3.5 py-2 text-xs text-primary-foreground">
                Which leads haven&apos;t been contacted in 2 weeks?
              </div>
              <div className="self-start rounded-xl rounded-bl-sm bg-card px-3.5 py-2 text-xs text-foreground ring-1 ring-border">
                3 leads: Acme Corp, Riverbend Ltd, and Nova Textiles — all last touched over 14
                days ago.
              </div>
            </div>
          </Reveal>

          {/* AI Email Composer */}
          <Reveal delayMs={150} className="group flex flex-col rounded-2xl border bg-card p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex size-12 items-center justify-center rounded-xl bg-brand-navy transition-transform duration-200 group-hover:scale-110">
              <Mail className="size-5 text-brand-lime" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-foreground">AI Email Composer</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Generate a personalized sales email straight from a lead&apos;s CRM context — company,
              stage, source, and history are pulled in automatically, no copy-pasting between
              records and an inbox. Pick the tone and length that fit the moment, and every
              placeholder — name, company, deal stage — is mapped automatically, so the draft is
              ready to send, not just a template.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 rounded-xl border border-border/70 bg-muted/50 p-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-secondary px-2 py-1 font-medium text-secondary-foreground">Tone: Friendly</span>
                <span className="rounded-md bg-secondary px-2 py-1 font-medium text-secondary-foreground">Length: Short</span>
              </div>
              <p className="text-muted-foreground">
                &ldquo;Hi {"{{first_name}}"}, following up on {"{{company_name}}"}&apos;s trial —
                noticed your team hit the seat limit this week. Want to talk about upgrading
                to {"{{plan_name}}"}?&rdquo;
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
