import { apiGet, toQuery, unwrap } from "./client";

export type ActionType = "add" | "edit" | "delete" | "disable" | "enable" | "uploaded";

export interface ActivityLog {
  action_performer_name: string;
  action_performer_email: string;
  action_type: ActionType;
  message: string;
  created_at: string;
}

export interface LogsPage {
  activity_logs: ActivityLog[];
  total_pages: number;
}

export interface GetLogsParams {
  page_number?: number;
  search_query?: string;
}

/** Tenant-scoped. Requires `log_manager` view permission. Page size fixed at 50. */
export async function getLogs(params: GetLogsParams = {}): Promise<LogsPage> {
  const qs = toQuery({ page_number: params.page_number, search_query: params.search_query });
  return unwrap(await apiGet<LogsPage>(`/log_manager/get_logs${qs}`));
}
