"use client";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import type { LeadListItem } from "@/types/api";

interface Props {
  lead: LeadListItem;
  onViewActivity: (leadId: number) => void;
}

export default function LeadRow({ lead, onViewActivity }: Props) {
  return (
    <div className="border-b py-4 flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="font-medium">
          {lead.name || "Unknown name"} ({lead.wa_number})
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          First clicked {formatRelative(lead.first_seen_at)} · {lead.click_count} views · {lead.order_count} orders
        </p>
        <p className="text-sm text-gray-500">Last seen {formatRelative(lead.last_seen_at)}</p>
      </div>
      <div className="flex items-center gap-2">
        <a href={lead.whatsapp_link} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <MessageCircle className="w-4 h-4 mr-1" /> Chat
          </Button>
        </a>
        <Button variant="ghost" size="sm" onClick={() => onViewActivity(lead.id)}>
          View activity →
        </Button>
      </div>
    </div>
  );
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
