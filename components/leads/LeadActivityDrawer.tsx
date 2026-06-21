"use client";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getLeadActivity } from "@/actions/share-links.actions";
import { errorMessage } from "@/lib/errors";
import { toast } from "sonner";
import type { LeadActivity } from "@/types/api";

interface Props {
  leadId: number | null;
  onClose: () => void;
}

export default function LeadActivityDrawer({ leadId, onClose }: Props) {
  const [data, setData] = useState<LeadActivity | null>(null);

  useEffect(() => {
    if (leadId === null) return;
    let cancelled = false;
    setData(null);
    getLeadActivity(leadId)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) toast.error(errorMessage(e, "Could not load lead activity."));
      });
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  return (
    <Sheet open={leadId !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{data?.lead?.name || "Lead"} activity</SheetTitle>
        </SheetHeader>
        <div className="mt-4 px-4">
          {!data && <div className="text-sm text-gray-500">Loading…</div>}
          {data && data.events.length === 0 && (
            <div className="text-sm text-gray-500">No activity yet.</div>
          )}
          {data &&
            data.events.map((e) => (
              <div key={e.id} className="border-b py-3 text-sm">
                <div className="font-medium">{labelFor(e.event_type)}</div>
                <div className="text-gray-500">
                  {new Date(e.occurred_at).toLocaleString()}
                </div>
                {e.share_link?.product && (
                  <div className="text-gray-700">{e.share_link.product.name}</div>
                )}
              </div>
            ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function labelFor(t: string): string {
  if (t === "submit") return "First identified";
  if (t === "view") return "Viewed product";
  return t;
}
