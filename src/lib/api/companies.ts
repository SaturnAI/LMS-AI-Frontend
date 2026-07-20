import { API_BASE_URL, apiGet, apiPostForm, toQuery, unwrap } from "./client";

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
  address_1?: string;
  address_2?: string;
  industry?: string;
  company_size?: string;
  gst_number?: string;
  pan_number?: string;
  mobile_number?: string;
  website?: string;
  designation?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

/** super_admin only. */
export async function fetchAllCompanies(): Promise<Company[]> {
  const data = unwrap(await apiGet<{ companies: Company[] }>("/company_master/fetch_all_companies"));
  return data.companies;
}

/** Fields shared by add_company / update_company (super_admin) and update_company_profile (company_admin). */
export interface CompanyDetailsInput {
  legal_name: string;
  phone_number: string;
  address_1: string;
  address_2?: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  name: string;
  email: string;
  industry?: string;
  company_size?: string;
  gst_number?: string;
  pan_number?: string;
  mobile_number?: string;
  website?: string;
  designation?: string;
  /** super_admin only fields. */
  employee_limit?: number;
  billing_plan?: BillingPlan;
  company_logo?: File;
}

/** super_admin only. multipart/form-data. */
export async function addCompany(input: CompanyDetailsInput): Promise<{ message: string }> {
  const res = await apiPostForm<{ message: string }>("/company_master/add_company", input);
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

/** super_admin only. multipart/form-data. Email cannot be changed. */
export async function updateCompany(
  companyCode: string,
  input: CompanyDetailsInput,
): Promise<{ message: string }> {
  const res = await apiPostForm<{ message: string }>("/company_master/update_company", {
    ...input,
    company_code: companyCode,
  });
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

/** company_admin only — edits their own company. Same shape minus billing_plan/employee_limit/email. */
export type CompanyProfileInput = Omit<CompanyDetailsInput, "employee_limit" | "billing_plan" | "email">;

export async function updateCompanyProfile(input: CompanyProfileInput): Promise<{ message: string }> {
  const res = await apiPostForm<{ message: string }>("/company_master/update_company_profile", input);
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

export async function disableCompany(companyCode: string): Promise<{ message: string }> {
  const res = await apiGet<{ message: string }>(
    `/company_master/disable_company${toQuery({ company_code: companyCode })}`,
  );
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

export async function enableCompany(companyCode: string): Promise<{ message: string }> {
  const res = await apiGet<{ message: string }>(
    `/company_master/enable_company${toQuery({ company_code: companyCode })}`,
  );
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

/** super_admin — enter a company's tenant context. Rewrites the auth cookie to include tenant_id. */
export async function setTenantId(companyCode: string): Promise<{ message: string }> {
  const res = await apiGet<{ message: string }>(
    `/company_master/set_tenant_id${toQuery({ company_code: companyCode })}`,
  );
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

/** super_admin — exit the current tenant context. */
export async function removeTenantId(): Promise<{ message: string }> {
  const res = await apiGet<{ message: string }>("/company_master/remove_tenant_id");
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

/** Logo URLs — used directly as <img src>; the endpoints stream bytes on success, JSON 404 when absent. */
export const companyLogoUrl = `${API_BASE_URL}/company_master/fetch_company_logo`;
export const companyLogoUrlForSuperAdmin = (tenantId: string) =>
  `${API_BASE_URL}/company_master/fetch_company_logo_for_super_admin${toQuery({ tenant_id: tenantId })}`;
