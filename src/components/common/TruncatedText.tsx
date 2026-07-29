"use client";

/**
 * Truncated text that shows its full value in a tooltip on hover. Renders as a plain
 * `<span>` (not a button), so it's safe to nest inside other interactive elements
 * (menu triggers, list-item buttons) without producing invalid nested controls.
 *
 * Forced to `block`: a bare `<span>` is inline, so two of these stacked inside a plain
 * (non-flex) container would render side by side with no separator — e.g. a lead name
 * immediately followed by its company name ("Lead 1Test company"). `block` restores the
 * line-per-item stacking the `<p>` tags this replaced had for free. Harmless when used as
 * a flex/grid item instead (e.g. side-by-side in a row) — flex blockifies items regardless
 * of their own declared display, so this doesn't change that layout.
 */
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function TruncatedText({ text, className }: { text: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className={cn("block truncate", className)} />}>{text}</TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}
