"use client";

/**
 * Route: `/leads` — CRM leads list.
 * Guarded by `leads` view permission + tenant context. Placeholder pending P3.
 */
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { ComingSoon } from "@/components/common/ComingSoon";
import { canViewPage, hasTenantContext } from "@/lib/rbac";

export default function LeadsPage() {
  return (
    <RequireAccess allow={(p) => canViewPage(p, "leads") && hasTenantContext(p)}>
      <div className="flex flex-col gap-6">
        <PageHeader title="Leads" description="Manage your CRM leads." />
        <ComingSoon feature="Lead management" />
      </div>
    </RequireAccess>
  );
}
