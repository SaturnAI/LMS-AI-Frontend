"use client";

/** Auth hooks: `useAuth` (get_profile query) + `useLogin` / `useLogout` mutations. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, login, logout, type Profile } from "@/lib/api";
import { getStoredTenantId, setStoredTenantId } from "@/lib/tenant-storage";

export const profileQueryKey = ["profile"] as const;

export type AuthState =
  | { status: "loading" }
  | { status: "authed"; profile: Profile }
  | { status: "guest" };

/**
 * Resolves the current session via GET /api/get_profile (cached by TanStack
 * Query). A failed/401 response resolves to `guest` (retry is disabled).
 */
export function useAuth(): AuthState {
  const { data, isPending, isError } = useQuery({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const res = await getProfile();
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });

  if (isPending) return { status: "loading" };
  if (isError || !data) return { status: "guest" };

  // super_admin's entered-company context is never part of `get_profile` (see
  // tenant-storage.ts) — restore it from what we locally remember, so nav/page
  // guards that key off `profile.tenant_id` see it consistently.
  if (data.role === "super_admin" && !data.tenant_id) {
    const enteredTenant = getStoredTenantId();
    if (enteredTenant) return { status: "authed", profile: { ...data, tenant_id: enteredTenant } };
  }

  return { status: "authed", profile: data };
}

/** Email/password login. On success, refreshes the cached profile. */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
    onSuccess: (result) => {
      if (result.ok) {
        // Guard against a stale entered-tenant leaking in from a previous session on a shared machine.
        setStoredTenantId(null);
        queryClient.invalidateQueries({ queryKey: profileQueryKey });
      }
    },
  });
}

/** Logout — clears the server cookie and the cached profile. */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      setStoredTenantId(null);
      queryClient.setQueryData(profileQueryKey, undefined);
      queryClient.removeQueries({ queryKey: profileQueryKey });
    },
  });
}
