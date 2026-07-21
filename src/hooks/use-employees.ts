"use client";

/** Query + mutation hooks: enabled/disabled employees, add, update, enable, disable. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addEmployee,
  disableEmployee,
  enableEmployee,
  fetchDisabledEmployees,
  fetchEnabledEmployees,
  updateEmployee,
  type EmployeeInput,
} from "@/lib/api";

export function useEnabledEmployees() {
  return useQuery({ queryKey: ["employees", "enabled"], queryFn: fetchEnabledEmployees });
}

export function useDisabledEmployees() {
  return useQuery({ queryKey: ["employees", "disabled"], queryFn: fetchDisabledEmployees });
}

function useInvalidateEmployees() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["employees"] });
}

export function useAddEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({ mutationFn: (input: EmployeeInput) => addEmployee(input), onSuccess: invalidate });
}

export function useUpdateEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({ mutationFn: (input: EmployeeInput) => updateEmployee(input), onSuccess: invalidate });
}

export function useSetEmployeeEnabled() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: ({ email, enabled }: { email: string; enabled: boolean }) =>
      enabled ? enableEmployee(email) : disableEmployee(email),
    onSuccess: invalidate,
  });
}
