"use client";

/** Auth hooks: `useAuth` (get_profile query) + `useLogin` / `useLogout` mutations. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, login, logout, type Profile } from "@/lib/api";

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
  return { status: "authed", profile: data };
}

/** Email/password login. On success, refreshes the cached profile. */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
    onSuccess: (result) => {
      if (result.ok) queryClient.invalidateQueries({ queryKey: profileQueryKey });
    },
  });
}

/** Logout — clears the server cookie and the cached profile. */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      queryClient.setQueryData(profileQueryKey, undefined);
      queryClient.removeQueries({ queryKey: profileQueryKey });
    },
  });
}
