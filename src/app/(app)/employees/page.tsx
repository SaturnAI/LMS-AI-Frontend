"use client";

/**
 * Route: `/employees` — company employees.
 * Guarded by `employee_master` view permission + tenant context. Placeholder pending P3.
 */
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { ComingSoon } from "@/components/common/ComingSoon";
import { canViewPage, hasTenantContext } from "@/lib/rbac";

export default function EmployeesPage() {
  return (
    <RequireAccess allow={(p) => canViewPage(p, "employee_master") && hasTenantContext(p)}>
      <div className="flex flex-col gap-6">
        <PageHeader title="Employees" description="Manage your company's employees." />
        <ComingSoon feature="Employee management" />
      </div>
    </RequireAccess>
  );
}
