/** Active/Disabled badge — used across all enable/disable-able resource lists. */
import { Badge } from "@/components/ui/badge";
import { toneClass } from "@/lib/status-colors";

export function StatusBadge({ disabled }: { disabled: boolean }) {
  return (
    <Badge variant="secondary" className={toneClass(disabled ? "danger" : "success")}>
      {disabled ? "Disabled" : "Active"}
    </Badge>
  );
}
