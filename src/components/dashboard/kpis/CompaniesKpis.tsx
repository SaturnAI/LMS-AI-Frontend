"use client";

/** KPI cards: total & active companies. Rendered on super_admin `/dashboard`. */
import { Building2, CheckCircle2 } from "lucide-react";
import { useCompanies } from "@/hooks/use-companies";
import { KpiCard } from "../KpiCard";

export function CompaniesKpis() {
  const { data, isPending, isError } = useCompanies();
  const total = data?.length ?? 0;
  const disabled = data?.filter((c) => c.is_disabled).length ?? 0;

  return (
    <>
      <KpiCard label="Companies" value={total} icon={Building2} loading={isPending} error={isError} />
      <KpiCard
        label="Active companies"
        value={total - disabled}
        icon={CheckCircle2}
        hint={disabled > 0 ? `${disabled} disabled` : undefined}
        loading={isPending}
        error={isError}
      />
    </>
  );
}
