"use client";

/** employee dashboard: permission-scoped KPIs + lists (empty state if no modules). Rendered on `/dashboard`. */
import { LayoutDashboard } from "lucide-react";
import type { Profile } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { canEditPage, canViewPage } from "@/lib/rbac";
import { firstName } from "@/lib/utils";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { KpiGrid } from "../KpiGrid";
import { EmployeesKpi } from "../kpis/EmployeesKpi";
import { LeadsKpi } from "../kpis/LeadsKpi";
import { QuickActions, type QuickAction } from "../QuickActions";
import { RecentLeadsCard } from "../RecentLeadsCard";
import { RecentActivityCard } from "../RecentActivityCard";

export function EmployeeOverview({ profile }: { profile: Profile }) {
  const canLeads = canViewPage(profile, "leads");
  const canTeam = canViewPage(profile, "employee_master");
  const canLogs = canViewPage(profile, "log_manager");

  const actions: QuickAction[] = [];
  if (canEditPage(profile, "leads")) actions.push({ label: "Add lead", href: ROUTES.leads });
  if (canEditPage(profile, "employee_master")) actions.push({ label: "Add employee", href: ROUTES.employees });

  const hasAnyModule = canLeads || canTeam || canLogs;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${firstName(profile.name)}`}
        description="Your workspace."
        actions={<QuickActions actions={actions} />}
      />

      {hasAnyModule ? (
        <>
          <KpiGrid>
            {canLeads && <LeadsKpi label="My leads" />}
            {canTeam && <EmployeesKpi label="Team" />}
          </KpiGrid>
          <div className="grid gap-6 lg:grid-cols-2">
            {canLeads && <RecentLeadsCard title="My recent leads" />}
            {canLogs && <RecentActivityCard />}
          </div>
        </>
      ) : (
        <EmptyState
          icon={LayoutDashboard}
          title="Nothing to show yet"
          description="You don't currently have access to any modules. Contact your admin to request access."
        />
      )}
    </div>
  );
}
