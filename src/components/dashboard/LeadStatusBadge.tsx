/** Colored badges for lead status & priority. Used in lead lists/tables. */
import { Badge } from "@/components/ui/badge";
import type { LeadPriority, LeadStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-sky-100 text-sky-700",
  contacted: "bg-indigo-100 text-indigo-700",
  nurture: "bg-amber-100 text-amber-700",
  qualified: "bg-violet-100 text-violet-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-rose-100 text-rose-700",
};

const PRIORITY_STYLES: Record<LeadPriority, string> = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
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
