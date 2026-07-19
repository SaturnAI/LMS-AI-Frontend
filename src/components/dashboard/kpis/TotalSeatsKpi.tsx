"use client";

/** Featured (lime) KPI card: total seat capacity across all companies (sum of employee_limit). */
import { useCompanies } from "@/hooks/use-companies";
import { KpiCard } from "../KpiCard";

export function TotalSeatsKpi() {
  const { data, isPending, isError } = useCompanies();
  const seats = data?.reduce((sum, c) => sum + (c.employee_limit ?? 0), 0) ?? 0;

  return (
    <KpiCard
      label="Total seats"
      value={seats}
      hint="capacity across companies"
      accent
      loading={isPending}
      error={isError}
    />
  );
}
