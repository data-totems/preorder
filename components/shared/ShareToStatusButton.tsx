"use client";

import * as React from "react";
import { MessageCircle, Download, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getProductStatusImage } from "@/actions/products.actions";
import { errorMessage } from "@/lib/errors";
import { toast } from "sonner";

interface Props {
  productId: number;
  productName: string;
}

/**
 * "Share to WhatsApp Status" button for merchants. Generates a 1080x1920
 * branded image server-side, then:
 *  - On mobile with native share: opens the share sheet → user picks WhatsApp
 *    → Status (one-tap distribution to all their contacts).
 *  - On desktop or browsers without `canShare({files})`: downloads the image
 *    and opens a how-to-post dialog explaining the manual steps.
 */
const ShareToStatusButton: React.FC<Props> = ({ productId, productName }) => {
  const [loading, setLoading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [showInstructions, setShowInstructions] = React.useState(false);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const buildFilename = () =>
    `buzzmart-status-${productName.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40) || "product"}.png`;

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

  const handleClick = async () => {
    setLoading(true);
    try {
      const blob = await getProductStatusImage(productId);
      const previewBlobUrl = URL.createObjectURL(blob);
      setPreviewUrl(previewBlobUrl);

      const file = new File([blob], buildFilename(), { type: "image/png" });

      // Web Share API path (mobile) — works on iOS Safari + Android Chrome.
      // navigator.canShare guards against browsers that have share() but choke on files.
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: `${productName} — order on WhatsApp`,
            text: "Tap to view this product on WhatsApp",
          });
          toast.success("Shared — pick WhatsApp Status from the menu");
          return;
        } catch (e: any) {
          // User cancelled — fall back to download path silently.
          if (e?.name === "AbortError") return;
        }
      }

      // Desktop / unsupported browsers: download + show how-to-post dialog.
      triggerDownload(blob);
      setShowInstructions(true);
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't generate the Status image."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        type="button"
        onClick={handleClick}
        disabled={loading}
        title="Generate a branded image you can post to WhatsApp Status"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <MessageCircle className="size-4" />
        )}
        Share to WhatsApp Status
      </Button>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="size-5 text-forest-700" />
              Post to WhatsApp Status
            </DialogTitle>
            <DialogDescription>
              The image has been saved to your device. Here&apos;s how to post
              it from your phone:
            </DialogDescription>
          </DialogHeader>

          {previewUrl && (
            <div className="mt-2 mx-auto w-32 aspect-[9/16] rounded-md overflow-hidden border border-border bg-ink-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Status preview" className="w-full h-full object-cover" />
            </div>
          )}

          <ol className="mt-3 space-y-3 text-[13px] text-foreground/85">
            <li className="flex gap-3">
              <span className="shrink-0 size-6 inline-flex items-center justify-center rounded-full bg-forest-700 text-paper text-[11px] font-bold">1</span>
              <span>Transfer the downloaded image to your phone (or use AirDrop / Drive).</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 size-6 inline-flex items-center justify-center rounded-full bg-forest-700 text-paper text-[11px] font-bold">2</span>
              <span>Open WhatsApp → <strong>Status</strong> tab → tap the camera icon.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 size-6 inline-flex items-center justify-center rounded-full bg-forest-700 text-paper text-[11px] font-bold">3</span>
              <span>Pick the saved image and post. Your contacts see it for 24 hours and can scan the QR to order.</span>
            </li>
          </ol>

          <DialogFooter className="mt-4 sm:flex-row sm:justify-between gap-2">
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
            <Button type="button" onClick={() => setShowInstructions(false)}>
              <Download className="size-4" /> Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareToStatusButton;
