"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageCircle, ShoppingBag, Star } from "lucide-react";
import RateLeadDialog from "./RateLeadDialog";
import { cn } from "@/lib/utils";
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

const initialsOf = (name?: string | null) => {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "?";
};

const isWithin24h = (iso: string) =>
  Date.now() - new Date(iso).getTime() < 24 * 60 * 60 * 1000;

interface RatableLead extends LeadListItem {
  rating?: number | null;
  rating_note?: string | null;
}

interface Props {
  lead: RatableLead;
  onViewActivity: (leadId: number) => void;
}

export default function LeadRow({ lead, onViewActivity }: Props) {
  const isNew = isWithin24h(lead.first_seen_at);
  const [rateOpen, setRateOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(lead.rating ?? null);
  const [ratingNote, setRatingNote] = useState<string>(lead.rating_note ?? "");

  return (
    <>
      <Card padding="compact" className="px-4">
        <div className="flex items-start gap-4">
          <div className="size-10 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-bold text-[13px] shrink-0">
            {initialsOf(lead.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[16px] font-semibold text-foreground truncate">
                {lead.name || "Unknown name"}
              </span>
              {isNew && <Badge variant="accent" className="shrink-0">NEW</Badge>}
              {rating !== null && (
                <span
                  className="inline-flex items-center gap-0.5 text-warning"
                  aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
                  title={ratingNote || `${rating} of 5`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3.5",
                        i < rating ? "fill-warning" : "fill-transparent text-ink-200",
                      )}
                    />
                  ))}
                </span>
              )}
            </div>
            <div className="text-[13px] text-muted-foreground tabular-nums">
              {lead.wa_number}
            </div>

            <div className="mt-2 flex items-center gap-1.5 flex-wrap text-[12px]">
              <Badge variant="default" className="bg-ink-100">
                <Eye className="size-3" /> {lead.click_count}{" "}
                {lead.click_count === 1 ? "view" : "views"}
              </Badge>
              {lead.order_count > 0 && (
                <Badge variant="success">
                  <ShoppingBag className="size-3" /> {lead.order_count}{" "}
                  {lead.order_count === 1 ? "order" : "orders"}
                </Badge>
              )}
              <span className="text-muted-foreground">
                Last seen {formatRelative(lead.last_seen_at)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRateOpen(true)}
              aria-label={`Rate ${lead.name || lead.wa_number}`}
              title={rating ? `Rated ${rating}/5` : "Rate this customer"}
            >
              <Star
                className={cn(
                  "size-4",
                  rating ? "fill-warning text-warning" : "text-ink-500",
                )}
              />
              {rating ? rating : "Rate"}
            </Button>
            <a
              href={lead.whatsapp_link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Chat with ${lead.name || lead.wa_number} on WhatsApp`}
            >
              <Button variant="outline" size="sm">
                <MessageCircle className="size-4" /> Chat
              </Button>
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewActivity(lead.id)}
            >
              Activity
            </Button>
          </div>
        </div>
      </Card>

      <RateLeadDialog
        open={rateOpen}
        onOpenChange={setRateOpen}
        leadId={lead.id}
        customerName={lead.name || lead.wa_number}
        initialRating={rating}
        initialNote={ratingNote}
        onSaved={(r, note) => {
          setRating(r);
          setRatingNote(note);
        }}
      />
    </>
  );
}
