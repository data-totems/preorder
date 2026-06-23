"use client";

import * as React from "react";
import { Megaphone, Download, ExternalLink, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoreStatusImage } from "@/actions/products.actions";
import { errorMessage } from "@/lib/errors";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_PRESETS: Array<{ label: string; eyebrow: string; headline: string; subhead: string }> = [
  {
    label: "Promo / Sale",
    eyebrow: "LIMITED TIME",
    headline: "20% off — today only",
    subhead: "DM me to lock in your order.",
  },
  {
    label: "New arrivals",
    eyebrow: "JUST IN",
    headline: "New arrivals just dropped",
    subhead: "Scan to see everything in stock.",
  },
  {
    label: "Restock",
    eyebrow: "BACK IN STOCK",
    headline: "Back in stock — order before it goes again",
    subhead: "Scan the QR or chat me on WhatsApp.",
  },
  {
    label: "Generic",
    eyebrow: "",
    headline: "",
    subhead: "",
  },
];

/**
 * Lets merchants generate a branded store-wide WhatsApp Status image with
 * optional eyebrow / headline / subhead. Two-pane layout: form on the left
 * (or top on mobile), live PNG preview on the right.
 */
const PromoteStoreDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const [eyebrow, setEyebrow] = React.useState("");
  const [headline, setHeadline] = React.useState("");
  const [subhead, setSubhead] = React.useState("");
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = React.useState<Blob | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [showInstructions, setShowInstructions] = React.useState(false);

  // Auto-generate the default preview when the dialog opens so the merchant
  // sees a real image immediately, not an empty box with a "generate" CTA.
  React.useEffect(() => {
    if (open) {
      void generate({ eyebrow: "", headline: "", subhead: "" });
    } else {
      setEyebrow("");
      setHeadline("");
      setSubhead("");
      setPreviewBlob(null);
      setShowInstructions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const generate = async (override?: { eyebrow?: string; headline?: string; subhead?: string }) => {
    setGenerating(true);
    try {
      const blob = await getStoreStatusImage({
        eyebrow: override?.eyebrow ?? eyebrow,
        headline: override?.headline ?? headline,
        subhead: override?.subhead ?? subhead,
      });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewBlob(blob);
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't generate the image."));
    } finally {
      setGenerating(false);
    }
  };

  const usePreset = (preset: (typeof QUICK_PRESETS)[number]) => {
    setEyebrow(preset.eyebrow);
    setHeadline(preset.headline);
    setSubhead(preset.subhead);
    void generate(preset);
  };

  const buildFilename = () =>
    `buzzmart-status-${(headline || "store").replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40)}.png`;

  const triggerDownload = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildFilename();
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!previewBlob) return;
    const file = new File([previewBlob], buildFilename(), { type: "image/png" });

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          files: [file],
          title: "Promote my store on WhatsApp",
          text: "Tap to view my store on WhatsApp",
        });
        toast.success("Shared — pick WhatsApp Status from the menu");
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
      }
    }

    triggerDownload(previewBlob);
    setShowInstructions(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="size-5 text-forest-700" /> Promote your store on WhatsApp Status
          </DialogTitle>
          <DialogDescription>
            Generate a branded image to post to your WhatsApp Status. Your contacts see it for 24 hours and can scan the QR to visit your store.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-2">
          {/* Form */}
          <div className="flex flex-col gap-4">
            <div>
              <Label className="text-[12px] uppercase tracking-[0.04em] text-muted-foreground">Quick presets</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => usePreset(p)}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-pill border border-border bg-paper hover:bg-ink-50"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="status-eyebrow">Tag (optional)</Label>
              <Input
                id="status-eyebrow"
                placeholder="LIMITED TIME"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                maxLength={32}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="status-headline">Headline (optional)</Label>
              <Input
                id="status-headline"
                placeholder="20% off — today only"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={80}
                className="mt-1"
              />
              <p className="text-[11px] text-muted-foreground mt-1">{80 - headline.length} characters left</p>
            </div>
            <div>
              <Label htmlFor="status-subhead">Supporting text (optional)</Label>
              <Input
                id="status-subhead"
                placeholder="Use code BUZZ20 at checkout"
                value={subhead}
                onChange={(e) => setSubhead(e.target.value)}
                maxLength={140}
                className="mt-1"
              />
              <p className="text-[11px] text-muted-foreground mt-1">{140 - subhead.length} characters left</p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => generate()}
              disabled={generating}
              className="w-full"
            >
              {generating ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Refresh preview
            </Button>
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-3">
            <div className="bg-ink-100 rounded-md aspect-[9/16] overflow-hidden border border-border relative">
              {generating && !previewUrl && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              )}
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="WhatsApp Status preview"
                  className={`w-full h-full object-cover transition-opacity ${generating ? "opacity-50" : "opacity-100"}`}
                />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              <Sparkles className="size-3 inline-block mb-0.5" /> 1080×1920 — perfect for WhatsApp Status
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4 sm:flex-row sm:justify-between gap-2 border-t border-border pt-4">
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 text-[13px] font-semibold text-forest-700 hover:underline"
            >
              <ExternalLink className="size-4" /> Open in new tab
            </a>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => previewBlob && triggerDownload(previewBlob)}
              disabled={!previewBlob}
            >
              <Download className="size-4" /> Download
            </Button>
            <Button type="button" onClick={handleShare} disabled={!previewBlob}>
              <Megaphone className="size-4" /> Share to WhatsApp
            </Button>
          </div>
        </DialogFooter>

        {showInstructions && (
          <div className="mt-4 rounded-md border border-forest-300 bg-forest-50 p-4 text-[12px] text-foreground/85">
            <div className="font-semibold text-forest-700 mb-2">Saved — here&apos;s how to post:</div>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Transfer the image to your phone (AirDrop / Drive / email).</li>
              <li>Open WhatsApp → <strong>Status</strong> tab → tap the camera icon.</li>
              <li>Pick the saved image and post. Contacts see it for 24h and can scan the QR.</li>
            </ol>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PromoteStoreDialog;
