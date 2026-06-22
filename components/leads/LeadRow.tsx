"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import type { LeadListItem } from "@/types/api";

const formatRelative = (iso: string): string => {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

interface Props {
  lead: LeadListItem;
  onViewActivity: (leadId: number) => void;
}

export default function LeadRow({ lead, onViewActivity }: Props) {
  return (
    <Card padding="compact" className="flex items-center justify-between gap-4 px-4">
      <div className="min-w-0 flex-1">
        <div className="text-[18px] leading-[26px] font-semibold text-foreground truncate">
          {lead.name || "Unknown name"}{" "}
          <span className="text-muted-foreground font-normal">
            ({lead.wa_number})
          </span>
        </div>
        <div className="mt-1 text-[13px] text-muted-foreground flex flex-wrap items-center gap-1">
          <span>
            First clicked {formatRelative(lead.first_seen_at)} · {lead.click_count} view
            {lead.click_count === 1 ? "" : "s"} ·{" "}
          </span>
          {lead.order_count > 0 ? (
            <Badge variant="success">
              {lead.order_count} order{lead.order_count === 1 ? "" : "s"}
            </Badge>
          ) : (
            <span>{lead.order_count} orders</span>
          )}
        </div>
        <div className="mt-1 text-[13px] text-muted-foreground">
          Last seen {formatRelative(lead.last_seen_at)}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a href={lead.whatsapp_link} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <MessageCircle className="size-4" /> Chat
          </Button>
        </a>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewActivity(lead.id)}
        >
          View activity →
        </Button>
      </div>
    </Card>
  );
}
