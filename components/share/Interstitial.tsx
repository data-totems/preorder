"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { toast } from "sonner";
import { normalizePhone, isValidPhone } from "@/lib/phone";
import { errorMessage } from "@/lib/errors";
import type { ShareLinkResolve } from "@/types/api";

export default function Interstitial({ resolved, shortId }: { resolved: ShareLinkResolve; shortId: string }) {
  const router = useRouter();
  const [wa, setWa] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const valid = isValidPhone(wa);
  const product = resolved.product;
  const merchant = resolved.merchant;

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/share-link-identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortId, wa_number: normalizePhone(wa)!, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(errorMessage(data, "Could not submit your details.")); return; }
      router.replace(data.redirect_to);
    } catch (e) {
      toast.error(errorMessage(e, "Network error. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-8">
      <Card variant="elevated" padding="none" className="max-w-md w-full overflow-hidden rounded-xl">
        {product?.primary_image && (
          <div className="relative w-full aspect-[4/3]">
            <Image src={product.primary_image} alt={product.name} fill className="object-cover" sizes="448px" />
          </div>
        )}
        <div className="p-6">
          <Eyebrow className="block mb-2">{product ? "PRODUCT" : "STORE"}</Eyebrow>
          <h1 className="text-[22px] leading-[30px] font-bold tracking-[-0.005em] text-foreground">
            {product ? product.name : (merchant.business_name ?? "This store")}
          </h1>
          {product && (
            <div className="mt-2 text-[36px] leading-[44px] font-bold text-forest-700 tracking-[-0.01em]">₦{product.price}</div>
          )}
          {merchant.business_name && (
            <div className="mt-3 flex items-center gap-2 text-[14px] text-muted-foreground">
              <div className="size-6 rounded-full bg-forest-400 text-white text-[11px] font-bold flex items-center justify-center">
                {merchant.business_name[0]?.toUpperCase() ?? "B"}
              </div>
              <span>by {merchant.business_name}</span>
            </div>
          )}

          <div className="my-6 h-px bg-border" />

          <Eyebrow className="block mb-2">BEFORE YOU SEE THE DETAILS</Eyebrow>
          <p className="text-[13px] text-muted-foreground">
            We share your number with this merchant so they can answer questions and confirm your order.
          </p>

          <div className="mt-5 flex flex-col gap-4">
            <div>
              <Label htmlFor="wa">WhatsApp number</Label>
              <Input id="wa" type="tel" inputMode="tel" autoComplete="tel" placeholder="+234 _ _ _ _ _ _ _ _ _ _" value={wa} onChange={(e) => setWa(e.target.value)} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="name">Your name (optional)</Label>
              <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
            </div>
            <Button onClick={submit} disabled={!valid || submitting} size="lg" className="w-full">
              {submitting ? "Loading…" : "Continue →"}
            </Button>
          </div>

          <p className="mt-4 text-[12px] text-ink-500 text-center">
            🔒 Your number stays with this merchant only. Not shared with Buzzmart marketing.
          </p>
        </div>
      </Card>
    </div>
  );
}
