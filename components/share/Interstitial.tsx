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
import { saveBuyerProfile } from "@/lib/buyerProfile";
import type { ShareLinkResolve } from "@/types/api";

export default function Interstitial({ resolved, shortId }: { resolved: ShareLinkResolve; shortId: string }) {
  const router = useRouter();
  const [wa, setWa] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const valid = isValidPhone(wa);
  const product = resolved.product;
  const merchant = resolved.merchant;
  const outOfStock = product?.in_stock === false;

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
      // Persist so the customer doesn't retype name/WA on the order form.
      saveBuyerProfile({ name: name.trim(), wa_number: normalizePhone(wa) ?? wa.trim() });
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
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              className={`object-cover ${outOfStock ? "opacity-40 grayscale" : ""}`}
              sizes="448px"
            />
            {outOfStock && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="rotate-[-8deg] border-2 border-white bg-destructive/95 text-white px-5 py-2 rounded-md shadow-lg text-[16px] font-extrabold uppercase tracking-[0.08em]">
                  Out of stock
                </div>
              </div>
            )}
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

          {outOfStock ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
              <div className="text-[14px] font-bold text-destructive uppercase tracking-[0.04em]">
                Currently unavailable
              </div>
              <p className="mt-2 text-[13px] text-foreground/80">
                This product is out of stock right now. The merchant will restock soon — message them directly on WhatsApp to ask when, or check back later.
              </p>
              {merchant.business_name && (
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Hi ${merchant.business_name}, when will "${product?.name ?? "this product"}" be back in stock?`)}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-foreground text-paper px-4 py-3 text-[14px] font-semibold hover:bg-foreground/90"
                >
                  Ask the merchant on WhatsApp
                </a>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
