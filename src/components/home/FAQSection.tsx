/**
 * Closing content section — merges the permission/trust message with the FAQ
 * (research on 2026 SaaS landing pages recommends an FAQ as the last content
 * block before the footer, since visitors who scroll this far are high-intent).
 * Every answer here is honest to the actual product, not aspirational.
 */
import { ShieldCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "./Reveal";

const FAQS = [
  {
    question: "Is my company's data isolated from other companies?",
    answer:
      "Yes. Every company is its own tenant — leads, employees, and activity logs are scoped to that company everywhere in the product, including in exports and the AI Copilot.",
  },
  {
    question: "Can the AI Copilot see data a user isn't allowed to see?",
    answer:
      "No. The Copilot answers inside the asker's own role and tenant permissions — the same view/edit/not-allowed rules that gate every page also gate what the Copilot can query and return.",
  },
  {
    question: "Can I control what each employee can access?",
    answer:
      "Yes. Company admins set per-employee permissions — view, edit, or no access — separately for Leads, Employees, and Activity Logs.",
  },
  {
    question: "What does the AI Email Composer actually generate?",
    answer:
      "A ready-to-send draft, not a template: it pulls the lead's CRM context automatically, lets you pick tone and length, and maps placeholders like name, company, and deal stage for you.",
  },
  {
    question: "How do I get started?",
    answer:
      "Companies are provisioned by your workspace administrator. Sign in with the account they've set up for you — or ask them to add your company to get one created.",
  },
];

export function FAQSection() {
  return (
    <section
      id="security"
      className="scroll-mt-20 bg-[radial-gradient(80%_60%_at_50%_0%,#eef3fb_0%,transparent_70%)] py-20"
    >
      <Reveal className="mx-auto w-full max-w-2xl px-4 sm:px-8">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-navy shadow-lg shadow-brand-navy/20">
            <ShieldCheck className="size-6 text-brand-lime" />
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Permission-safe by design — AI included
          </h2>
          <p className="mt-3 text-muted-foreground">
            Dashboards, exports, and the AI Copilot all run inside the same per-company, per-role
            permission model. Multi-tenant by design, isolated by default — no exceptions for AI.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <h3 className="text-center text-xl font-semibold text-foreground">Questions, answered</h3>
          <Accordion className="mt-6">
            {FAQS.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Reveal>
    </section>
  );
}
