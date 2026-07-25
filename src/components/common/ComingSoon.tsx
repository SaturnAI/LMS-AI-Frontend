/** Placeholder for not-yet-built screens. Used by the resource route stubs (leads, employees, …). */
import { Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "./EmptyState";

export function ComingSoon({ feature }: { feature: string }) {
  return (
    <EmptyState
      icon={Construction}
      title={`${feature} is coming soon`}
      description="This screen is planned for an upcoming phase and will build on the same data layer."
      action={
        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
          Not built yet
        </Badge>
      }
    />
  );
}
