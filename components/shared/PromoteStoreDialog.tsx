"use client";

import * as React from "react";
import {
  Megaphone,
  Download,
  ExternalLink,
  Loader2,
  Sparkles,
  RefreshCw,
  Printer,
  QrCode,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoreStatusImage, getStoreQrPoster } from "@/actions/products.actions";
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

const POSTER_TAGLINES = [
  "Same day delivery. Pay on delivery available.",
  "Fast WhatsApp orders. Trusted by hundreds.",
  "Order from your phone — delivered to your door.",
];

const PromoteStoreDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  // Status-tab state
  const [eyebrow, setEyebrow] = React.useState("");
  const [headline, setHeadline] = React.useState("");
  const [subhead, setSubhead] = React.useState("");
  const [statusUrl, setStatusUrl] = React.useState<string | null>(null);
  const [statusBlob, setStatusBlob] = React.useState<Blob | null>(null);
  const [statusGenerating, setStatusGenerating] = React.useState(false);
  const [showStatusInstructions, setShowStatusInstructions] = React.useState(false);

  // Poster-tab state
  const [tagline, setTagline] = React.useState("");
  const [posterGenerating, setPosterGenerating] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      void generateStatus({ eyebrow: "", headline: "", subhead: "" });
    } else {
      setEyebrow("");
      setHeadline("");
      setSubhead("");
      setTagline("");
      setStatusBlob(null);
      setShowStatusInstructions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    return () => {
      if (statusUrl) URL.revokeObjectURL(statusUrl);
    };
  }, [statusUrl]);

  // ── Status helpers ──────────────────────────────────────────────
  const generateStatus = async (override?: { eyebrow?: string; headline?: string; subhead?: string }) => {
    setStatusGenerating(true);
    try {
      const blob = await getStoreStatusImage({
        eyebrow: override?.eyebrow ?? eyebrow,
        headline: override?.headline ?? headline,
        subhead: override?.subhead ?? subhead,
      });
      if (statusUrl) URL.revokeObjectURL(statusUrl);
      setStatusUrl(URL.createObjectURL(blob));
      setStatusBlob(blob);
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't generate the Status image."));
    } finally {
      setStatusGenerating(false);
    }
  };

  const usePreset = (preset: (typeof QUICK_PRESETS)[number]) => {
    setEyebrow(preset.eyebrow);
    setHeadline(preset.headline);
    setSubhead(preset.subhead);
    void generateStatus(preset);
  };

  const statusFilename = () =>
    `buzzmart-status-${(headline || "store").replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40)}.png`;

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleStatusShare = async () => {
    if (!statusBlob) return;
    const file = new File([statusBlob], statusFilename(), { type: "image/png" });

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
    triggerDownload(statusBlob, statusFilename());
    setShowStatusInstructions(true);
  };

  // ── Poster helpers ──────────────────────────────────────────────
  const handlePosterDownload = async () => {
    setPosterGenerating(true);
    try {
      const blob = await getStoreQrPoster(tagline || undefined);
      triggerDownload(blob, "buzzmart-qr-poster.pdf");
      // Also open in a new tab so the merchant can preview + print immediately.
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      // The opened tab keeps its own reference; we can revoke after a delay.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      toast.success("Poster ready — opening in a new tab");
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't generate the poster."));
    } finally {
      setPosterGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="size-5 text-forest-700" /> Promote your store
          </DialogTitle>
          <DialogDescription>
            Generate branded assets that drive your existing audience back to your WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="status" className="mt-2">
          <TabsList variant="underline">
            <TabsTrigger value="status" variant="underline">
              <Sparkles className="size-4" /> WhatsApp Status
            </TabsTrigger>
            <TabsTrigger value="poster" variant="underline">
              <Printer className="size-4" /> Print poster
            </TabsTrigger>
          </TabsList>

          {/* ─── STATUS TAB ─────────────────────────────────────── */}
          <TabsContent value="status" className="mt-5">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div>
                  <Label className="text-[12px] uppercase tracking-[0.04em] text-muted-foreground">
                    Quick presets
                  </Label>
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
                  onClick={() => generateStatus()}
                  disabled={statusGenerating}
                  className="w-full"
                >
                  {statusGenerating ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                  Refresh preview
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="bg-ink-100 rounded-md aspect-[9/16] overflow-hidden border border-border relative">
                  {statusGenerating && !statusUrl && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Loader2 className="size-6 animate-spin" />
                    </div>
                  )}
                  {statusUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={statusUrl}
                      alt="WhatsApp Status preview"
                      className={`w-full h-full object-cover transition-opacity ${statusGenerating ? "opacity-50" : "opacity-100"}`}
                    />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  <Sparkles className="size-3 inline-block mb-0.5" /> 1080×1920 — perfect for WhatsApp Status
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-between gap-2 border-t border-border pt-4">
              {statusUrl && (
                <a
                  href={statusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 text-[13px] font-semibold text-forest-700 hover:underline self-center sm:self-auto"
                >
                  <ExternalLink className="size-4" /> Open in new tab
                </a>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => statusBlob && triggerDownload(statusBlob, statusFilename())}
                  disabled={!statusBlob}
                >
                  <Download className="size-4" /> Download
                </Button>
                <Button type="button" onClick={handleStatusShare} disabled={!statusBlob}>
                  <Megaphone className="size-4" /> Share to WhatsApp
                </Button>
              </div>
            </div>

            {showStatusInstructions && (
              <div className="mt-4 rounded-md border border-forest-300 bg-forest-50 p-4 text-[12px] text-foreground/85">
                <div className="font-semibold text-forest-700 mb-2">Saved — here&apos;s how to post:</div>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Transfer the image to your phone (AirDrop / Drive / email).</li>
                  <li>Open WhatsApp → <strong>Status</strong> tab → tap the camera icon.</li>
                  <li>Pick the saved image and post.</li>
                </ol>
              </div>
            )}
          </TabsContent>

          {/* ─── POSTER TAB ─────────────────────────────────────── */}
          <TabsContent value="poster" className="mt-5">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <p className="text-[14px] text-foreground/85 leading-[22px]">
                  A4 PDF you can print at home, on packaging stickers, or post on a market stall. The big QR opens a WhatsApp chat with you, pre-filled with an order intro.
                </p>

                <div>
                  <Label className="text-[12px] uppercase tracking-[0.04em] text-muted-foreground">
                    Quick taglines
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {POSTER_TAGLINES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTagline(t)}
                        className="text-[12px] font-semibold px-3 py-1.5 rounded-pill border border-border bg-paper hover:bg-ink-50 text-left"
                      >
                        {t.length > 38 ? t.slice(0, 36) + "…" : t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="poster-tagline">Tagline (optional)</Label>
                  <Input
                    id="poster-tagline"
                    placeholder="Same day delivery. Pay on delivery available."
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    maxLength={160}
                    className="mt-1"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">{160 - tagline.length} characters left</p>
                </div>

                <ul className="text-[12px] text-foreground/80 space-y-2 pt-2 border-t border-border">
                  <li className="flex gap-2"><QrCode className="size-4 shrink-0 text-forest-700" /> Big QR — readable from a few feet away</li>
                  <li className="flex gap-2"><FileText className="size-4 shrink-0 text-forest-700" /> Sized for A4 paper at print-quality (300dpi)</li>
                  <li className="flex gap-2"><Printer className="size-4 shrink-0 text-forest-700" /> Opens in a new tab for instant printing</li>
                </ul>
              </div>

              {/* Static A4 placeholder illustration */}
              <div className="flex flex-col gap-3">
                <div className="bg-ink-100 rounded-md aspect-[210/297] overflow-hidden border border-border relative p-4 flex flex-col">
                  <div className="bg-forest-700 text-white rounded-sm p-3 mb-3">
                    <div className="text-[7px] font-bold uppercase tracking-[0.08em] text-forest-400">Order from us on WhatsApp</div>
                    <div className="text-[16px] font-extrabold leading-[18px] mt-1">Your business name</div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="size-[60%] bg-white rounded-md flex items-center justify-center">
                      <QrCode className="size-12 text-foreground/30" strokeWidth={1.2} />
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <div className="text-[12px] font-bold text-foreground">SCAN TO ORDER</div>
                    <div className="text-[8px] font-semibold text-foreground/70 mt-0.5">ON WHATSAPP</div>
                    {tagline && (
                      <div className="text-[7px] text-foreground/60 mt-2 line-clamp-2">{tagline}</div>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  <FileText className="size-3 inline-block mb-0.5" /> A4 — 210mm × 297mm
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" onClick={handlePosterDownload} disabled={posterGenerating}>
                {posterGenerating ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                Download PDF
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PromoteStoreDialog;
