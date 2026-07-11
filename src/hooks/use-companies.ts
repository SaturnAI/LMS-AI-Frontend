"use client";

/** Query hook: all companies (super_admin). */
import { useQuery } from "@tanstack/react-query";
import { fetchAllCompanies } from "@/lib/api";

export function useCompanies() {
  return useQuery({ queryKey: ["companies"], queryFn: fetchAllCompanies });
}
