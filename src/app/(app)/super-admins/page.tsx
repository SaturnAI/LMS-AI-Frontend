"use client";

/**
 * Route: `/super-admins` — platform administrators management (super_admin only). Placeholder pending P3.
 */
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { ComingSoon } from "@/components/common/ComingSoon";
import { isSuperAdmin } from "@/lib/rbac";

export default function SuperAdminsPage() {
  return (
    <RequireAccess allow={isSuperAdmin}>
      <div className="flex flex-col gap-6">
        <PageHeader title="Super Admins" description="Manage platform administrators." />
        <ComingSoon feature="Super admin management" />
      </div>
    </RequireAccess>
  );
}
