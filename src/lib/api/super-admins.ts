import { apiGet, apiPost, toQuery, unwrap } from "./client";

export interface SuperAdmin {
  code: string;
  email: string;
  name: string;
  phone_number?: string;
  is_disabled: boolean;
}

/** super_admin only. */
export async function fetchAllSuperAdmins(): Promise<SuperAdmin[]> {
  const data = unwrap(await apiGet<{ user_data: SuperAdmin[] }>("/super_admin_master/fetch_all_super_admins"));
  return data.user_data;
}

export interface AddUpdateSuperAdminInput {
  email: string;
  name: string;
  /** The backend schema types this as an int (unlike employee/company phone numbers, which are strings). */
  phone_number: number;
}

export async function addSuperAdmin(input: AddUpdateSuperAdminInput): Promise<{ message: string }> {
  const res = await apiPost<{ message: string }>("/super_admin_master/add_super_admin", input);
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

export async function updateSuperAdmin(input: AddUpdateSuperAdminInput): Promise<{ message: string }> {
  const res = await apiPost<{ message: string }>("/super_admin_master/update_super_admin", input);
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

export async function disableSuperAdmin(email: string): Promise<{ message: string }> {
  const res = await apiGet<{ message: string }>(
    `/super_admin_master/disable_super_admin${toQuery({ disable_user_email: email })}`,
  );
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

export async function enableSuperAdmin(email: string): Promise<{ message: string }> {
  const res = await apiGet<{ message: string }>(
    `/super_admin_master/enable_super_admin${toQuery({ enable_user_email: email })}`,
  );
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}
