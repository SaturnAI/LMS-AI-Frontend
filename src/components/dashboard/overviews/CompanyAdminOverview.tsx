"use client";

/** company_admin dashboard: employee/lead KPIs + recent leads & activity. Rendered on `/dashboard`. */
import type { Profile } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { firstName } from "@/lib/utils";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiGrid } from "../KpiGrid";
import { EmployeesKpi } from "../kpis/EmployeesKpi";
import { LeadsKpi } from "../kpis/LeadsKpi";
import { QuickActions } from "../QuickActions";
import { RecentLeadsCard } from "../RecentLeadsCard";
import { RecentActivityCard } from "../RecentActivityCard";

export function CompanyAdminOverview({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${firstName(profile.name)}`}
        description="Here's what's happening in your company."
        actions={
          <QuickActions
            actions={[
              { label: "Add lead", href: ROUTES.leads },
              { label: "Add employee", href: ROUTES.employees },
            ]}
          />
        }
      />
      <KpiGrid>
        <LeadsKpi />
        <EmployeesKpi />
      </KpiGrid>
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentLeadsCard />
        <RecentActivityCard />
      </div>
    </div>
  );
}
