"use client";

/** KPI cards: total & active companies. Rendered on super_admin `/dashboard`. */
import { useCompanies } from "@/hooks/use-companies";
import { KpiCard } from "../KpiCard";

export function CompaniesKpis() {
  const { data, isPending, isError } = useCompanies();
  const total = data?.length ?? 0;
  const disabled = data?.filter((c) => c.is_disabled).length ?? 0;
  const active = total - disabled;
  const activePct = total ? Math.round((active / total) * 100) : 0;

  return (
    <>
      <KpiCard
        label="Companies"
        value={total}
        hint={disabled > 0 ? `${disabled} disabled` : undefined}
        loading={isPending}
        error={isError}
      />
      <KpiCard
        label="Active companies"
        value={active}
        hint={total > 0 ? `${activePct}% of total` : undefined}
        loading={isPending}
        error={isError}
      />
    </>
  );
}
