"use client";

/** super_admin dashboard: platform KPIs + recent companies. Rendered on `/dashboard`. */
import type { Profile } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { firstName } from "@/lib/utils";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiGrid } from "../KpiGrid";
import { CompaniesKpis } from "../kpis/CompaniesKpis";
import { SuperAdminsKpi } from "../kpis/SuperAdminsKpi";
import { QuickActions } from "../QuickActions";
import { RecentCompaniesCard } from "../RecentCompaniesCard";

export function SuperAdminOverview({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${firstName(profile.name)}`}
        description="Platform overview — companies and administrators."
        actions={
          <QuickActions
            actions={[
              { label: "Add company", href: ROUTES.companies },
              { label: "Add super admin", href: ROUTES.superAdmins },
            ]}
          />
        }
      />
      <KpiGrid>
        <CompaniesKpis />
        <SuperAdminsKpi />
      </KpiGrid>
      <RecentCompaniesCard />
    </div>
  );
}
