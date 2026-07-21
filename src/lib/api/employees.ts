import { apiGet, apiPost, toQuery, unwrap } from "./client";
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

export interface EmployeeInput {
  name: string;
  email: string;
  phone_number: string;
  permissions: Record<string, PermissionLevel>;
}

/** Tenant-scoped. Requires `employee_master` edit permission. Enforces the company's employee_limit. */
export async function addEmployee(input: EmployeeInput): Promise<{ message: string }> {
  const res = await apiPost<{ message: string }>("/employee_master/add_employee", input);
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

/** `email` identifies the employee and is not changed. */
export async function updateEmployee(input: EmployeeInput): Promise<{ message: string }> {
  const res = await apiPost<{ message: string }>("/employee_master/update_employee", input);
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

export async function disableEmployee(email: string): Promise<{ message: string }> {
  const res = await apiGet<{ message: string }>(
    `/employee_master/disable_employee${toQuery({ employee_to_disable_email: email })}`,
  );
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

export async function enableEmployee(email: string): Promise<{ message: string }> {
  const res = await apiGet<{ message: string }>(
    `/employee_master/enable_employee${toQuery({ employee_to_enable_email: email })}`,
  );
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}
