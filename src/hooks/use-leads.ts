"use client";

/** Query + mutation hooks: paginated/searchable leads, sales-rep dropdown, add/update lead, add comment. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addComment,
  addLead,
  fetchDropdownSalesRepresentatives,
  fetchLeads,
  updateLead,
  type FetchLeadsParams,
  type LeadInput,
} from "@/lib/api";

export function useLeads(params: FetchLeadsParams = {}) {
  return useQuery({ queryKey: ["leads", params], queryFn: () => fetchLeads(params) });
}

export function useSalesRepDropdown() {
  return useQuery({ queryKey: ["leads", "sales-reps"], queryFn: fetchDropdownSalesRepresentatives });
}

function useInvalidateLeads() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["leads"] });
}

export function useAddLead() {
  const invalidate = useInvalidateLeads();
  return useMutation({ mutationFn: (input: LeadInput) => addLead(input), onSuccess: invalidate });
}

export function useUpdateLead() {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: ({ leadCode, input }: { leadCode: string; input: LeadInput }) => updateLead(leadCode, input),
    onSuccess: invalidate,
  });
}

export function useAddComment() {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: ({ leadCode, comment }: { leadCode: string; comment: string }) => addComment(leadCode, comment),
    onSuccess: invalidate,
  });
}
