/** Active/Disabled badge — used across all enable/disable-able resource lists. */
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ disabled }: { disabled: boolean }) {
  return (
    <Badge variant="secondary" className={disabled ? "bg-rose-100 text-rose-700" : "bg-green-100 text-green-700"}>
      {disabled ? "Disabled" : "Active"}
    </Badge>
  );
}
