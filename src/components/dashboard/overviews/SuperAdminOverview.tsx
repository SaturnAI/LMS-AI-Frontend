"use client";

/** super_admin dashboard: platform KPIs + searchable companies board. Rendered on `/dashboard`. */
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Profile } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { firstName } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiGrid } from "../KpiGrid";
import { CompaniesKpis } from "../kpis/CompaniesKpis";
import { SuperAdminsKpi } from "../kpis/SuperAdminsKpi";
import { TotalSeatsKpi } from "../kpis/TotalSeatsKpi";
import { CompaniesBoard } from "../CompaniesBoard";

export function SuperAdminOverview({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${firstName(profile.name)}`}
        description="Platform overview — companies and administrators."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`${ROUTES.superAdmins}?create=true`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Plus className="size-4" />
              Super admin
            </Link>
            <Link href={`${ROUTES.companies}?create=true`} className={buttonVariants({ size: "sm" })}>
              <Plus className="size-4" />
              Add company
            </Link>
          </div>
        }
      />
      <KpiGrid>
        <CompaniesKpis />
        <SuperAdminsKpi />
        <TotalSeatsKpi />
      </KpiGrid>
      <CompaniesBoard />
    </div>
  );
}
