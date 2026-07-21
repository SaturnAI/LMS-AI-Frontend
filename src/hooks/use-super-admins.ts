"use client";

/** Query + mutation hooks: super admins list, add, update, enable, disable. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addSuperAdmin,
  disableSuperAdmin,
  enableSuperAdmin,
  fetchAllSuperAdmins,
  updateSuperAdmin,
  type AddUpdateSuperAdminInput,
} from "@/lib/api";

const KEY = ["super-admins"] as const;

export function useSuperAdmins() {
  return useQuery({ queryKey: KEY, queryFn: fetchAllSuperAdmins });
}

function useInvalidateSuperAdmins() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: KEY });
}

export function useAddSuperAdmin() {
  const invalidate = useInvalidateSuperAdmins();
  return useMutation({
    mutationFn: (input: AddUpdateSuperAdminInput) => addSuperAdmin(input),
    onSuccess: invalidate,
  });
}

export function useUpdateSuperAdmin() {
  const invalidate = useInvalidateSuperAdmins();
  return useMutation({
    mutationFn: (input: AddUpdateSuperAdminInput) => updateSuperAdmin(input),
    onSuccess: invalidate,
  });
}

export function useSetSuperAdminEnabled() {
  const invalidate = useInvalidateSuperAdmins();
  return useMutation({
    mutationFn: ({ email, enabled }: { email: string; enabled: boolean }) =>
      enabled ? enableSuperAdmin(email) : disableSuperAdmin(email),
    onSuccess: invalidate,
  });
}
