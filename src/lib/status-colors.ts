/**
 * Single source of truth for "meaning-based" badge colors.
 * Same meaning -> same color everywhere (success = green, danger = red, warning = amber, info = blue/slate).
 * Avatar tint colors are a separate, unrelated system — see `avatar-color.ts`.
 */

export type SemanticTone = "success" | "danger" | "warning" | "info" | "neutral";

export const TONE_STYLES: Record<SemanticTone, string> = {
  success: "bg-green-100 text-green-700",
  danger: "bg-rose-100 text-rose-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-sky-100 text-sky-700",
  neutral: "bg-slate-100 text-slate-600",
};

export function toneClass(tone: SemanticTone): string {
  return TONE_STYLES[tone];
}

/**
 * Distinct shades for a linear pipeline's in-progress stages (e.g. lead status).
 * Reserved for multi-step progressions where stages need to look different from
 * each other, not just "good/bad" — the start/end of the pipeline should still use
 * `TONE_STYLES` (info for the first stage, success/danger for the terminal stages).
 */
export const PROGRESSION_STYLES = [
  "bg-sky-100 text-sky-700",
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
] as const;

/** Billing plan tiers — a shared constant so it isn't copy-pasted across pages. */
export const PLAN_STYLES = {
  free: toneClass("neutral"),
  pro: toneClass("info"),
  enterprise: PROGRESSION_STYLES[2],
} as const;
