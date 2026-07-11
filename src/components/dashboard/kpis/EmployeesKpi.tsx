"use client";

/** KPI card: active employee count. Rendered on company_admin/employee `/dashboard`. */
import { Users } from "lucide-react";
import { useEnabledEmployees } from "@/hooks/use-employees";
import { KpiCard } from "../KpiCard";

export function EmployeesKpi({ label = "Employees" }: { label?: string }) {
  const { data, isPending, isError } = useEnabledEmployees();
  return (
    <KpiCard label={label} value={data?.length ?? 0} icon={Users} hint="Active" loading={isPending} error={isError} />
  );
}
