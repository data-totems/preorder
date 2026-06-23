"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/errors";
import { rateLead } from "@/actions/share-links.actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: number;
  customerName: string;
  initialRating: number | null;
  initialNote: string;
  onSaved: (rating: number | null, note: string) => void;
}

const LABELS: Record<number, string> = {
  1: "Avoid — flaky or fraudulent",
  2: "Risky — chargebacks or no-shows",
  3: "OK — average customer",
  4: "Good — pays on time, easy",
  5: "Excellent — top customer",
};

export default function RateLeadDialog({
  open,
  onOpenChange,
  leadId,
  customerName,
  initialRating,
  initialNote,
  onSaved,
}: Props) {
  const [rating, setRating] = useState<number | null>(initialRating);
  const [hover, setHover] = useState<number | null>(null);
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await rateLead(leadId, rating, note);
      toast.success(rating ? "Rating saved" : "Rating cleared");
      onSaved(rating, note);
      onOpenChange(false);
    } catch (e) {
      toast.error(errorMessage(e, "Could not save rating."));
    } finally {
      setSaving(false);
    }
  };

  const visualRating = hover ?? rating ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {customerName || "customer"}</DialogTitle>
          <DialogDescription>
            Private to you — helps you remember who&apos;s reliable next time
            they order.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-5">
          <div>
            <Label className="block mb-3">Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n === rating ? null : n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(null)}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  className="p-1 rounded-md hover:bg-ink-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Star
                    className={cn(
                      "size-7 transition-colors",
                      n <= visualRating
                        ? "fill-warning text-warning"
                        : "fill-transparent text-ink-300",
                    )}
                  />
                </button>
              ))}
              {rating !== null && (
                <button
                  type="button"
                  onClick={() => setRating(null)}
                  className="ml-2 text-[12px] font-semibold text-ink-500 hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="mt-2 text-[13px] text-muted-foreground min-h-[20px]">
              {visualRating > 0 ? LABELS[visualRating] : "Tap a star"}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="rating-note">Notes (optional)</Label>
            <Textarea
              id="rating-note"
              placeholder="e.g. Paid promptly, easy to reach on WhatsApp"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px]"
              maxLength={1000}
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : "Save rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
