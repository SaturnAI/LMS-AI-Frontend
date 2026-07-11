"use client";

/** Query hook: paginated/searchable leads (auto-scoped to the user's tenant/assignments). */
import { useQuery } from "@tanstack/react-query";
import { fetchLeads, type FetchLeadsParams } from "@/lib/api";

export function useLeads(params: FetchLeadsParams = {}) {
  return useQuery({ queryKey: ["leads", params], queryFn: () => fetchLeads(params) });
}
