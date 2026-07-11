import { apiGet, unwrap } from "./client";
import type { PermissionLevel } from "./auth";

export interface Employee {
  code: string;
  email: string;
  name: string;
  phone_number?: string;
  permissions?: Record<string, PermissionLevel>;
}

/** Tenant-scoped. Requires `employee_master` view permission. */
export async function fetchEnabledEmployees(): Promise<Employee[]> {
  const data = unwrap(await apiGet<{ user_data: Employee[] }>("/employee_master/fetch_enabled_employees"));
  return data.user_data;
}

export async function fetchDisabledEmployees(): Promise<Employee[]> {
  const data = unwrap(await apiGet<{ user_data: Employee[] }>("/employee_master/fetch_disabled_employees"));
  return data.user_data;
}
