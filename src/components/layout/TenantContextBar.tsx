/** Shows the company a super_admin has entered. Rendered in the header (super_admin + tenant context only). */
import { Building2 } from "lucide-react";
import type { Profile } from "@/lib/api";
import { hasTenantContext, isSuperAdmin } from "@/lib/rbac";

/**
 * Shown when a super_admin has entered a company context (`set_tenant_id`).
 * The exit action (`remove_tenant_id`) is wired in the Companies phase.
 */
export function TenantContextBar({ profile }: { profile: Profile }) {
  if (!isSuperAdmin(profile) || !hasTenantContext(profile)) return null;
  return (
    <div className="flex items-center gap-1.5 rounded-full border bg-brand-lime/20 px-3 py-1 text-xs text-foreground">
      <Building2 className="size-3.5" aria-hidden />
      <span>
        Viewing: <strong>{profile.tenant_id}</strong>
      </span>
    </div>
  );
}
