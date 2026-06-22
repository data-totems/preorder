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
}

const ProductCard = ({ id, name, price, image_url, storeName, storeHref, href }: ProductCardProps) => {
  const target = href ?? `/marketplace/product/${id}`;
  return (
    <Link href={target} className="group block">
      <Card variant="flat" padding="none" className="overflow-hidden">
        <div className="relative aspect-square w-full bg-ink-100 overflow-hidden">
          {image_url && (
            <Image
              src={image_url}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          )}
        </div>
        <div className="p-4">
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
