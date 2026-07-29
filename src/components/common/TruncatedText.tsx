"use client";

/**
 * Truncated text that shows its full value in a tooltip on hover. Renders as a plain
 * `<span>` (not a button), so it's safe to nest inside other interactive elements
 * (menu triggers, list-item buttons) without producing invalid nested controls.
 */
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function TruncatedText({ text, className }: { text: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className={cn("truncate", className)} />}>{text}</TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}
