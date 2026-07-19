/** Company card for the super_admin dashboard. Uses only fields from `fetch_all_companies` (no fabricated data). */
import { Badge } from "@/components/ui/badge";
import type { BillingPlan, Company } from "@/lib/api";
import { cn, initials } from "@/lib/utils";

const PLAN_STYLES: Record<BillingPlan, string> = {
  free: "bg-slate-100 text-slate-600",
  pro: "bg-sky-100 text-sky-700",
  enterprise: "bg-violet-100 text-violet-700",
};

// Deterministic avatar tint so a company always looks the same (not random/mock).
const AVATAR_TINTS = [
  "bg-brand-navy text-white",
  "bg-sky-200 text-sky-900",
  "bg-green-200 text-green-900",
  "bg-violet-200 text-violet-900",
  "bg-amber-200 text-amber-900",
];

function tintFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) % AVATAR_TINTS.length;
  return AVATAR_TINTS[h];
}

export function CompanyCard({ company }: { company: Company }) {
  const location = [company.city, company.country].filter(Boolean).join(", ");

  return (
    <div className="rounded-2xl bg-muted/60 p-4">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold",
            tintFor(company.company_code),
          )}
        >
          {initials(company.legal_name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{company.legal_name}</p>
          <p className="truncate text-sm text-muted-foreground">{company.email}</p>
        </div>
        <Badge
          variant="secondary"
          className={company.is_disabled ? "bg-rose-100 text-rose-700" : "bg-green-100 text-green-700"}
        >
          {company.is_disabled ? "Disabled" : "Active"}
        </Badge>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          {company.billing_plan && (
            <Badge variant="secondary" className={cn("capitalize", PLAN_STYLES[company.billing_plan])}>
              {company.billing_plan}
            </Badge>
          )}
          {location && <span>{location}</span>}
        </span>
        {company.employee_limit != null && <span>Up to {company.employee_limit} seats</span>}
      </div>
    </div>
  );
}
