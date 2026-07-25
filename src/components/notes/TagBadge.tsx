/** Colored tag badge for notes. Color is deterministic from the tag text, so any user-created tag stays consistent. */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TAG_COLORS = [
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-green-100 text-green-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
];

function colorFor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash + tag.charCodeAt(i)) % TAG_COLORS.length;
  return TAG_COLORS[hash];
}

export function TagBadge({ tag, className }: { tag: string; className?: string }) {
  return (
    <Badge variant="secondary" className={cn(colorFor(tag), className)}>
      {tag}
    </Badge>
  );
}
