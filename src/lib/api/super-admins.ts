import { apiGet, unwrap } from "./client";

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
