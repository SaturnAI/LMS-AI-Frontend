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

interface PermissionsEditorProps {
  value: Record<string, PermissionLevel>;
  onChange: (value: Record<string, PermissionLevel>) => void;
}

export function PermissionsEditor({ value, onChange }: PermissionsEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <Label>Permissions</Label>
      <div className="grid gap-3 sm:grid-cols-3">
        {PERMISSION_PAGES.map((page) => (
          <div key={page} className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">{PAGE_LABELS[page]}</span>
            <Select
              value={value[page] ?? "not_allowed"}
              onValueChange={(v) => onChange({ ...value, [page]: v as PermissionLevel })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
