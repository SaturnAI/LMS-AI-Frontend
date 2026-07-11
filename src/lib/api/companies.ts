import { apiGet, unwrap } from "./client";

export type BillingPlan = "free" | "pro" | "enterprise";

export interface Company {
  company_code: string;
  legal_name: string;
  name: string;
  email: string;
  is_disabled: boolean;
  billing_plan?: BillingPlan;
  employee_limit?: number;
  phone_number?: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
}

/** super_admin only. */
export async function fetchAllCompanies(): Promise<Company[]> {
  const data = unwrap(await apiGet<{ companies: Company[] }>("/company_master/fetch_all_companies"));
  return data.companies;
}
