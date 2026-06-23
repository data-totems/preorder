"use client";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: number;
  name: string;
  price?: string | number;
  image_url?: string;
  storeName?: string;
  storeHref?: string;
  href?: string;
  inStock?: boolean;
}

const ProductCard = ({
  id, name, price, image_url, storeName, storeHref, href, inStock = true,
}: ProductCardProps) => {
  const target = href ?? `/marketplace/product/${id}`;
  return (
    <Link href={target} className="group block">
      <Card
        variant="flat"
        padding="none"
        className={`overflow-hidden ${!inStock ? "ring-1 ring-destructive/30" : ""}`}
      >
        <div className="relative aspect-square w-full bg-ink-100 overflow-hidden">
          {image_url && (
            <Image
              src={image_url}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover transition-transform duration-300 group-hover:scale-[1.02] ${
                inStock ? "" : "opacity-40 grayscale"
              }`}
            />
          )}
          {!inStock && (
            <>
              <div className="absolute inset-0 bg-ink-900/30" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="rotate-[-8deg] border-2 border-white bg-destructive/95 text-white px-4 py-1.5 rounded-md shadow-lg text-[14px] font-extrabold uppercase tracking-[0.08em]">
                  Out of stock
                </div>
              </div>
            </>
          )}
        </div>
        <div className="p-4">
          {!inStock && (
            <div className="-mt-1 mb-2 inline-flex items-center gap-1 rounded-pill bg-destructive/10 text-destructive px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.04em]">
              Unavailable
            </div>
          )}
          <div className="text-[18px] leading-[26px] font-semibold text-foreground line-clamp-2 min-h-[52px]">
            {name}
          </div>
          {price !== undefined && (
            <div className="mt-1 text-[22px] leading-[30px] font-bold text-forest-700 tracking-[-0.005em]">
              ₦{price}
            </div>
          )}
          {storeName && (
            <Link
              href={storeHref ?? "#"}
              className="mt-1 block text-[12px] font-medium tracking-[0.02em] text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              {storeName}
            </Link>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
