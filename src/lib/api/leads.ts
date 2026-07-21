import { apiGet, apiPost, toQuery, unwrap } from "./client";

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

export const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "nurture", "qualified", "won", "lost"];
export const LEAD_PRIORITIES: LeadPriority[] = ["high", "medium", "low"];
export const LEAD_SOURCES: LeadSource[] = [
  "website",
  "referral",
  "cold_call",
  "social_media",
  "email_campaign",
  "trade_show",
  "other",
];

export interface SalesRep {
  name: string;
  email: string;
  phone_number?: string;
}

export interface LeadAddress {
  address_1?: string;
  address_2?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
}

export interface PersonOfContact {
  name?: string;
  email?: string;
  phone_number?: string;
  designation?: string;
}

export interface LeadComment {
  comment: string;
  comment_id: string;
  created_at: string;
  commented_user: SalesRep;
}

export interface LeadListItem {
  lead_code: string;
  name: string;
  company_name: string;
  email?: string;
  alt_email?: string | null;
  phone_number?: string;
  alt_phone_number?: string | null;
  designation?: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  remarks?: string;
  created_by?: string;
  created_at?: string;
  company_registered_address?: LeadAddress;
  company_operational_address?: LeadAddress;
  person_of_contact?: PersonOfContact;
  sales_representatives?: SalesRep[];
  comments?: LeadComment[];
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

/** Assignable sales reps (active employees + company admin) for the lead-assignment dropdown. */
export async function fetchDropdownSalesRepresentatives(): Promise<SalesRep[]> {
  const data = unwrap(
    await apiGet<{ sales_representatives: SalesRep[] }>("/lead_management/fetch_dropdown_sales_representatives"),
  );
  return data.sales_representatives;
}

export interface LeadInput {
  name: string;
  company_name: string;
  sales_representative_emails: string[];
  email?: string;
  alt_email?: string | null;
  phone_number?: string;
  alt_phone_number?: string | null;
  designation?: string;
  company_registered_address?: LeadAddress;
  company_operational_address?: LeadAddress;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  remarks?: string;
  person_of_contact?: PersonOfContact;
}

export async function addLead(input: LeadInput): Promise<{ message: string }> {
  const res = await apiPost<{ message: string }>("/lead_management/add_lead", input);
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

export async function updateLead(leadCode: string, input: LeadInput): Promise<{ message: string }> {
  const res = await apiPost<{ message: string }>("/lead_management/update_lead", {
    ...input,
    lead_code: leadCode,
  });
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

/** `comment` max length 200 chars (enforced server-side; also validated client-side). */
export async function addComment(leadCode: string, comment: string): Promise<{ message: string }> {
  const res = await apiPost<{ message: string }>("/lead_management/add_comment", {
    lead_code: leadCode,
    comment,
  });
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}
