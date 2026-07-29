/**
 * Company card for the super_admin dashboard. Uses only fields from `fetch_all_companies` (no fabricated data).
 * `fetch_all_companies` doesn't return a `tenant_id`, and the logo endpoint requires one — so this shows a
 * deterministic color-initials avatar rather than the real logo. Revisit once the list endpoint exposes tenant_id.
 */
import { Badge } from "@/components/ui/badge";
import { TruncatedText } from "@/components/common/TruncatedText";
import type { Company } from "@/lib/api";
import { avatarTintFor } from "@/lib/avatar-color";
import { PLAN_STYLES, toneClass } from "@/lib/status-colors";
import { cn, initials } from "@/lib/utils";

export function CompanyCard({ company }: { company: Company }) {
  const location = [company.city, company.country].filter(Boolean).join(", ");

  return (
    <div className="rounded-xl border bg-muted/60 p-5">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold",
            avatarTintFor(company.company_code),
          )}
        >
          {initials(company.legal_name)}
        </span>
        <div className="min-w-0 flex-1">
          <TruncatedText text={company.legal_name} className="font-semibold text-foreground" />
          <TruncatedText text={company.email} className="text-sm text-muted-foreground" />
        </div>
        <Badge variant="secondary" className={toneClass(company.is_disabled ? "danger" : "success")}>
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
