"use client";

/** Query hooks: enabled / disabled employees for the current tenant. */
import { useQuery } from "@tanstack/react-query";
import { fetchDisabledEmployees, fetchEnabledEmployees } from "@/lib/api";

export function useEnabledEmployees() {
  return useQuery({ queryKey: ["employees", "enabled"], queryFn: fetchEnabledEmployees });
}

export function useDisabledEmployees() {
  return useQuery({ queryKey: ["employees", "disabled"], queryFn: fetchDisabledEmployees });
}
