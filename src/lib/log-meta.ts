/** Shared action-type visuals (icon + tone) for the Activity Logs page and the "Recent activity" summary widgets. */
import { Ban, CircleCheck, Pencil, Plus, Trash2, Upload, type LucideIcon } from "lucide-react";
import type { ActionType } from "@/lib/api";
import { PROGRESSION_STYLES, toneClass } from "@/lib/status-colors";

export const ACTION_TYPE_ICONS: Record<ActionType, LucideIcon> = {
  add: Plus,
  edit: Pencil,
  delete: Trash2,
  disable: Ban,
  enable: CircleCheck,
  uploaded: Upload,
};

export const ACTION_TYPE_STYLES: Record<ActionType, string> = {
  add: toneClass("success"),
  edit: toneClass("info"),
  delete: toneClass("danger"),
  disable: toneClass("danger"),
  enable: toneClass("success"),
  uploaded: PROGRESSION_STYLES[2],
};

/** Parses the backend's `created_at` format ("HH:MM:SS DD-MM-YYYY UTC") into a Date, or null if unparseable. */
export function parseLogTimestamp(createdAt: string): Date | null {
  const match = createdAt.match(/(\d{2}):(\d{2}):(\d{2})\s+(\d{2})-(\d{2})-(\d{4})/);
  if (!match) return null;
  const [, hh, mm, ss, dd, mo, yyyy] = match;
  return new Date(Date.UTC(Number(yyyy), Number(mo) - 1, Number(dd), Number(hh), Number(mm), Number(ss)));
}
