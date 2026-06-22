import { CreditCard } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

export default function Payment() {
  return (
    <EmptyState
      icon={<CreditCard />}
      title="Payment settings coming soon"
      description="You'll manage your payout methods and bank details here."
    />
  );
}
