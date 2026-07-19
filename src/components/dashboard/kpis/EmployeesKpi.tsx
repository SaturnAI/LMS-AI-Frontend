"use client";

/** KPI card: active employee count. Rendered on company_admin/employee `/dashboard`. */
import { useEnabledEmployees } from "@/hooks/use-employees";
import { KpiCard } from "../KpiCard";

export function EmployeesKpi({ label = "Employees", accent }: { label?: string; accent?: boolean }) {
  const { data, isPending, isError } = useEnabledEmployees();
  return <KpiCard label={label} value={data?.length ?? 0} accent={accent} loading={isPending} error={isError} />;
}
