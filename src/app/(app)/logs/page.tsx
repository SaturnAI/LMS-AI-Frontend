"use client";

/**
 * Route: `/logs` — activity/audit log.
 * Guarded by `log_manager` view permission + tenant context. Placeholder pending P3.
 */
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { ComingSoon } from "@/components/common/ComingSoon";
import { canViewPage, hasTenantContext } from "@/lib/rbac";

export default function LogsPage() {
  return (
    <RequireAccess allow={(p) => canViewPage(p, "log_manager") && hasTenantContext(p)}>
      <div className="flex flex-col gap-6">
        <PageHeader title="Activity Logs" description="Audit trail of actions in your workspace." />
        <ComingSoon feature="Activity logs" />
      </div>
    </RequireAccess>
  );
}
