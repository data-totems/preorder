import { Truck } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

export default function Dispatch() {
  return (
    <EmptyState
      icon={<Truck />}
      title="Dispatch settings coming soon"
      description="You'll manage your dispatch riders and delivery zones here."
    />
  );
}
