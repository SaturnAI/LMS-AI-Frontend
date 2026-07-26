/** Colored icon square for an activity log's action type. Shared by the Activity Logs table and "Recent activity" summaries. */
import type { ActionType } from "@/lib/api";
import { ACTION_TYPE_ICONS, ACTION_TYPE_STYLES } from "@/lib/log-meta";
import { cn } from "@/lib/utils";

export function ActionTypeIcon({ type, className }: { type: ActionType; className?: string }) {
  const Icon = ACTION_TYPE_ICONS[type];
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", ACTION_TYPE_STYLES[type], className)}>
      <Icon className="size-4" />
    </span>
  );
}
