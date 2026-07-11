"use client";

/**
 * Route: `/company-profile` — company details & logo (company_admin only). Placeholder pending P3.
 */
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { ComingSoon } from "@/components/common/ComingSoon";
import { isCompanyAdmin } from "@/lib/rbac";

export default function CompanyProfilePage() {
  return (
    <RequireAccess allow={isCompanyAdmin}>
      <div className="flex flex-col gap-6">
        <PageHeader title="Company Profile" description="Update your company's details and logo." />
        <ComingSoon feature="Company profile" />
      </div>
    </RequireAccess>
  );
}
