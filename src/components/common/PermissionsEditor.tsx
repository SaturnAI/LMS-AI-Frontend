/** 3-page permission matrix editor (employee_master / leads / log_manager × view/edit/not_allowed). */
import type { PermissionLevel } from "@/lib/api";
import { PERMISSION_PAGES } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAGE_LABELS: Record<(typeof PERMISSION_PAGES)[number], string> = {
  employee_master: "Employees",
  leads: "Leads",
  log_manager: "Activity Logs",
};

const LEVELS: PermissionLevel[] = ["not_allowed", "view", "edit"];
// Activity Logs has no edit-gated endpoint (§7.1 of the API doc — `get_logs` is `view`-only;
// logs are auto-written by the backend, never edited), so "edit" isn't a real option there.
const LEVELS_BY_PAGE: Record<(typeof PERMISSION_PAGES)[number], PermissionLevel[]> = {
  employee_master: LEVELS,
  leads: LEVELS,
  log_manager: ["not_allowed", "view"],
};

interface PermissionsEditorProps {
  value: Record<string, PermissionLevel>;
  onChange: (value: Record<string, PermissionLevel>) => void;
}

export function PermissionsEditor({ value, onChange }: PermissionsEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <Label>Permissions</Label>
      <div className="grid gap-3 divide-y sm:grid-cols-3 sm:divide-y-0">
        {PERMISSION_PAGES.map((page) => {
          const levels = LEVELS_BY_PAGE[page];
          const current = value[page] ?? "not_allowed";
          // Guard against a stale stored "edit" for log_manager (e.g. set before this
          // page lost that option) — fall back to "view" rather than an unmatched value.
          const selected = levels.includes(current) ? current : "view";
          return (
            <div key={page} className="flex flex-col gap-1.5 pt-3 first:pt-0 sm:pt-0">
              <span className="text-xs text-muted-foreground">{PAGE_LABELS[page]}</span>
              <Select value={selected} onValueChange={(v) => onChange({ ...value, [page]: v as PermissionLevel })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
