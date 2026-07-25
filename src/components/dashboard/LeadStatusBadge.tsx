/** Colored badges for lead status & priority. Used in lead lists/tables. */
import { Badge } from "@/components/ui/badge";
import type { LeadPriority, LeadStatus } from "@/lib/api";
import { PROGRESSION_STYLES, toneClass } from "@/lib/status-colors";
import { cn } from "@/lib/utils";

// Pipeline order: new -> contacted -> nurture -> qualified -> won/lost.
// Middle stages get distinct progression shades; the terminal stages stay meaning-based.
const STATUS_STYLES: Record<LeadStatus, string> = {
  new: toneClass("info"),
  contacted: PROGRESSION_STYLES[0],
  nurture: PROGRESSION_STYLES[1],
  qualified: PROGRESSION_STYLES[2],
  won: toneClass("success"),
  lost: toneClass("danger"),
};

const PRIORITY_STYLES: Record<LeadPriority, string> = {
  high: toneClass("danger"),
  medium: toneClass("warning"),
  low: toneClass("neutral"),
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="secondary" className={cn("capitalize", STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}

export function LeadPriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <Badge variant="secondary" className={cn("capitalize", PRIORITY_STYLES[priority])}>
      {priority}
    </Badge>
  );
}
