"use client";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  title: string;
  text: string;
  url: string;
}

export default function ShareButton({ title, text, url }: Props) {
  const handleShare = async () => {
    const fullMessage = `${text}\n${url}`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text: fullMessage, url });
        return;
      } catch (err) {
        // User cancelled the native share sheet — no-op.
        if (
          (err as DOMException)?.name === "AbortError" ||
          (err as DOMException)?.name === "NotAllowedError"
        ) {
          return;
        }
        // Real failure — fall through to clipboard/wa.me fallback.
      }
    }
    // Desktop / fallback
    try {
      await navigator.clipboard.writeText(fullMessage);
      toast.success("Copied to clipboard");
    } catch {
      // ignore clipboard errors silently
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(fullMessage)}`,
      "_blank"
    );
  };

  return (
    <Button onClick={handleShare} variant="ghost" className="text-[#27BA5F]">
      <Share2 className="w-4 h-4 mr-2" /> Share
    </Button>
  );
}
