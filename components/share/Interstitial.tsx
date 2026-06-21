"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { normalizePhone, isValidPhone } from "@/lib/phone";
import { errorMessage } from "@/lib/errors";
import type { ShareLinkResolve } from "@/types/api";

export default function Interstitial({
  resolved,
  shortId,
}: {
  resolved: ShareLinkResolve;
  shortId: string;
}) {
  const router = useRouter();
  const [wa, setWa] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const valid = isValidPhone(wa);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/share-link-identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortId,
          wa_number: normalizePhone(wa)!,
          name: name || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(errorMessage(data, "Could not submit your details."));
        return;
      }
      router.replace(data.redirect_to);
    } catch (e) {
      toast.error(errorMessage(e, "Network error. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const merchant = resolved.merchant;
  const product = resolved.product;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm overflow-hidden">
        {product && product.primary_image && (
          <div className="relative w-full h-64">
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
          </div>
        )}
        <div className="p-6">
          {product ? (
            <>
              <h1 className="text-xl font-bold">{product.name}</h1>
              <p className="text-orange-500 font-semibold mt-1">
                &#8358;{product.price}
              </p>
              {merchant.business_name && (
                <p className="text-sm text-gray-500 mt-1">
                  by {merchant.business_name}
                </p>
              )}
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold">{merchant.business_name ?? "This store"}</h1>
              <p className="text-sm text-gray-500 mt-1">Visit this store</p>
            </>
          )}

          <div className="mt-6">
            <label
              htmlFor="wa-number"
              className="text-sm font-medium text-[#03140A]"
            >
              Enter your WhatsApp to see details:
            </label>
            <Input
              id="wa-number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="bg-[#F0F0F0] rounded-[12px] mt-2"
              placeholder="+234 _ _ _ _ _ _ _ _ _ _"
              value={wa}
              onChange={(e) => setWa(e.target.value)}
            />
            <label
              htmlFor="visitor-name"
              className="text-sm font-medium text-[#03140A] mt-4 block"
            >
              Your name (optional)
            </label>
            <Input
              id="visitor-name"
              autoComplete="name"
              className="bg-[#F0F0F0] rounded-[12px] mt-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              onClick={submit}
              disabled={!valid || submitting}
              className="mt-6 w-full bg-[#27BA5F] hover:bg-[#1FA34E]"
            >
              {submitting ? "Loading..." : "Continue →"}
            </Button>
            <p className="text-xs text-gray-400 mt-3 text-center">
              We&apos;ll only use this to follow up about your order. No spam.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
