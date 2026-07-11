import { apiGet, toQuery, unwrap } from "./client";

export type LeadStatus = "new" | "contacted" | "nurture" | "qualified" | "won" | "lost";
export type LeadPriority = "high" | "medium" | "low";
export type LeadSource =
  | "website"
  | "referral"
  | "cold_call"
  | "social_media"
  | "email_campaign"
  | "trade_show"
  | "other";

export interface SalesRep {
  name: string;
  email: string;
  phone_number?: string;
}

export interface LeadListItem {
  lead_code: string;
  name: string;
  company_name: string;
  email?: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  created_by?: string;
  created_at?: string;
  sales_representatives?: SalesRep[];
}

export interface LeadsPage {
  leads: LeadListItem[];
  total: number;
  total_pages: number;
}

export interface FetchLeadsParams {
  batch_number?: number;
  batch_size?: number;
  search_query?: string;
}

/** Tenant-scoped. Employees are auto-restricted to leads they're assigned to. */
export async function fetchLeads(params: FetchLeadsParams = {}): Promise<LeadsPage> {
  const qs = toQuery({
    batch_number: params.batch_number,
    batch_size: params.batch_size,
    search_query: params.search_query,
  });
  return unwrap(await apiGet<LeadsPage>(`/lead_management/fetch_leads${qs}`));
}
