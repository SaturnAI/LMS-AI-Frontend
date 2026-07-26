"use client";

/** Query + mutation hooks: companies list, add, update, enable, disable, tenant context. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCompany,
  disableCompany,
  enableCompany,
  fetchAllCompanies,
  removeTenantId,
  setTenantId,
  updateCompany,
  updateCompanyProfile,
  type CompanyDetailsInput,
  type CompanyProfileInput,
} from "@/lib/api";
import { profileQueryKey } from "./use-auth";
import { setStoredTenantId } from "@/lib/tenant-storage";

const KEY = ["companies"] as const;

export function useCompanies() {
  return useQuery({ queryKey: KEY, queryFn: fetchAllCompanies });
}

function useInvalidateCompanies() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: KEY });
}

export function useAddCompany() {
  const invalidate = useInvalidateCompanies();
  return useMutation({
    mutationFn: (input: CompanyDetailsInput) => addCompany(input),
    onSuccess: invalidate,
  });
}

export function useUpdateCompany() {
  const invalidate = useInvalidateCompanies();
  return useMutation({
    mutationFn: ({ companyCode, input }: { companyCode: string; input: CompanyDetailsInput }) =>
      updateCompany(companyCode, input),
    onSuccess: invalidate,
  });
}

export function useSetCompanyEnabled() {
  const invalidate = useInvalidateCompanies();
  return useMutation({
    mutationFn: ({ companyCode, enabled }: { companyCode: string; enabled: boolean }) =>
      enabled ? enableCompany(companyCode) : disableCompany(companyCode),
    onSuccess: invalidate,
  });
}

/**
 * Entering/exiting a tenant context rewrites the auth cookie for tenant-scoped
 * endpoints, but `get_profile` never surfaces `tenant_id` for a super_admin (see
 * tenant-storage.ts) — so we record it ourselves and invalidate the profile query
 * to force `useAuth` to re-derive with it merged back in.
 */
export function useEnterCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (companyCode: string) => setTenantId(companyCode),
    onSuccess: (_result, companyCode) => {
      setStoredTenantId(companyCode);
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
    },
  });
}

export function useExitCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => removeTenantId(),
    onSuccess: () => {
      setStoredTenantId(null);
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
    },
  });
}

/** company_admin — edit their own company profile. Refreshes the cached profile (company_data) on success. */
export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CompanyProfileInput) => updateCompanyProfile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileQueryKey }),
  });
}
