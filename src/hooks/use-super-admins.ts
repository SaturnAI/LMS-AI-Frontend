"use client";

/** Query hook: all super admins (super_admin). */
import { useQuery } from "@tanstack/react-query";
import { fetchAllSuperAdmins } from "@/lib/api";

export function useSuperAdmins() {
  return useQuery({ queryKey: ["super-admins"], queryFn: fetchAllSuperAdmins });
}
