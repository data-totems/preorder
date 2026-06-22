"use client";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MapPin, Star, Copy } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Props {
  merchant: {
    business_name?: string | null;
    business_description?: string | null;
    display_picture?: string | null;
    store_url?: string | null;
    phone_number?: string | null;
    address?: string | null;
  };
}

const MerchantHero = ({ merchant }: Props) => {
  const copy = async () => {
    if (!merchant.store_url) return;
    try {
      await navigator.clipboard.writeText(merchant.store_url);
      toast.success("Store link copied");
    } catch {
      /* ignore */
    }
  };
  return (
    <section className="px-6 md:px-10 py-12 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start">
        <div className="md:col-span-2">
          <Eyebrow className="block mb-3">MERCHANT</Eyebrow>
          <h1 className="text-[36px] md:text-[44px] leading-[1.1] font-bold tracking-[-0.01em] text-foreground">
            {merchant.business_name ?? "This store"}
          </h1>
          {merchant.business_description && (
            <p className="mt-3 text-[17px] leading-[26px] text-muted-foreground line-clamp-3 max-w-xl">
              {merchant.business_description}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="success">Verified</Badge>
            {merchant.address && (
              <Badge>
                <MapPin className="size-3" /> {merchant.address}
              </Badge>
            )}
            <Badge variant="info">
              <Star className="size-3" /> 4.8 · 123 orders
            </Badge>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {merchant.phone_number && (
              <a
                href={`https://wa.me/${merchant.phone_number.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>
                  <MessageCircle className="size-4" /> Chat on WhatsApp
                </Button>
              </a>
            )}
            <Button variant="outline" onClick={copy}>
              <Copy className="size-4" /> Copy store link
            </Button>
          </div>
        </div>
        <div className="md:col-span-1">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-ink-100">
            {merchant.display_picture ? (
              <Image
                src={merchant.display_picture}
                alt={merchant.business_name ?? "Merchant"}
                fill
                className="object-cover"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MerchantHero;
