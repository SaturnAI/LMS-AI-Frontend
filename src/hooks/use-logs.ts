"use client";

/** Query hook: paginated activity logs (log_manager view). */
import { useQuery } from "@tanstack/react-query";
import { getLogs, type GetLogsParams } from "@/lib/api";

export function useLogs(params: GetLogsParams = {}) {
  return useQuery({ queryKey: ["logs", params], queryFn: () => getLogs(params) });
}
