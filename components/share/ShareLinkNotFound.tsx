import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Link2Off } from "lucide-react";
import Link from "next/link";

export default function ShareLinkNotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <EmptyState
        icon={<Link2Off />}
        title="This link is no longer active"
        description="The merchant may have removed or updated it. Try browsing other stores instead."
        action={<Link href="/store"><Button>Browse all stores →</Button></Link>}
      />
    </div>
  );
}
