/** Core-platform capability grid — real, shipped features, icons matching the app's own sidebar. */
import { Building2, Contact, NotebookText, ScrollText, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";

const DELAY_STEPS = [0, 150, 300, 0, 150, 300] as const;

interface Capability {
  icon: LucideIcon;
  title: string;
  description: string;
}

const CAPABILITIES: Capability[] = [
  {
    icon: Building2,
    title: "Multi-tenant company management",
    description: "Onboard companies as isolated tenants, set seat limits and billing plans, and manage every account from one console.",
  },
  {
    icon: Contact,
    title: "Lead pipeline",
    description: "Track status, priority, and source for every lead, assign sales reps, and keep the full comment history in one place.",
  },
  {
    icon: Users,
    title: "Team & employee management",
    description: "Add employees, control their access, and enable or disable accounts the moment a role changes.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based permissions",
    description: "Granular view/edit/none access per page, per employee — enforced the same way for people and for AI.",
  },
  {
    icon: ScrollText,
    title: "Activity audit trail",
    description: "Every add, edit, enable, and disable is logged with who, what, and when — searchable and filterable.",
  },
  {
    icon: NotebookText,
    title: "Personal notes & checklists",
    description: "A rich-text workspace for the notes, checklists, and attachments that don't belong in a CRM record.",
  },
];

export function CapabilitiesSection() {
  return (
    <section id="capabilities" className="w-full scroll-mt-20 px-4 py-20 sm:px-8 lg:px-12 xl:px-20 2xl:px-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Everything your team needs, one workspace
        </h2>
        <p className="mt-3 text-muted-foreground">
          Companies, leads, and people — with permissions that hold up everywhere the data goes.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map(({ icon: Icon, title, description }, i) => (
          <Reveal key={title} delayMs={DELAY_STEPS[i]}>
            <div className="group h-full rounded-2xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 group-hover:scale-110">
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
