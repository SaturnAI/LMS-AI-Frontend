/** Placeholder for not-yet-built screens. Used by the resource route stubs (leads, employees, …). */
import { Construction } from "lucide-react";
import { EmptyState } from "./EmptyState";

export function ComingSoon({ feature }: { feature: string }) {
  return (
    <EmptyState
      icon={Construction}
      title={`${feature} is coming soon`}
      description="This screen is planned for an upcoming phase and will build on the same data layer."
    />
  );
}
