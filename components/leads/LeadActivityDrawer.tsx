"use client";
import { useEffect, useState } from "react";
import { Eye, Inbox, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/shared/EmptyState";
import { getLeadActivity } from "@/actions/share-links.actions";
import { errorMessage } from "@/lib/errors";
import type { LeadActivity } from "@/types/api";

interface Props {
  leadId: number | null;
  onClose: () => void;
}

const iconFor = (t: string) => {
  if (t === "submit") return UserPlus;
  if (t === "view") return Eye;
  return Inbox;
};

const labelFor = (t: string): string => {
  if (t === "submit") return "First identified";
  if (t === "view") return "Viewed product";
  return t;
};

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

        <div className="mt-4 px-4 pb-4">
          {!data && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-md" />
              ))}
            </div>
          )}

          {data && data.events.length === 0 && (
            <EmptyState
              icon={<Inbox />}
              title="No activity yet"
              description="When this customer clicks your links or views products, it'll show up here."
            />
          )}

          {data && data.events.length > 0 && (
            <ul className="flex flex-col divide-y divide-border">
              {data.events.map((e) => {
                const Icon = iconFor(e.event_type);
                return (
                  <li key={e.id} className="py-3 flex items-start gap-3">
                    <div className="size-8 rounded-md bg-forest-50 text-forest-700 flex items-center justify-center shrink-0">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-semibold text-foreground">
                        {labelFor(e.event_type)}
                      </div>
                      {e.share_link?.product && (
                        <div className="text-[13px] text-muted-foreground truncate">
                          {e.share_link.product.name}
                        </div>
                      )}
                      <div className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">
                        {new Date(e.occurred_at).toLocaleString()}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
