"use client";

/**
 * Route: `/companies` — tenant companies management (super_admin only). Placeholder pending P3.
 */
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { ComingSoon } from "@/components/common/ComingSoon";
import { isSuperAdmin } from "@/lib/rbac";

export default function CompaniesPage() {
  return (
    <RequireAccess allow={isSuperAdmin}>
      <div className="flex flex-col gap-6">
        <PageHeader title="Companies" description="Manage tenant companies." />
        <ComingSoon feature="Company management" />
      </div>
    </RequireAccess>
  );
}
