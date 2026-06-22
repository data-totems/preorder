"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPublicProductByUuid } from "@/actions/products.actions";
import { toast } from "sonner";
import { errorMessage } from "@/lib/errors";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  OrderFormInline,
  OrderFormSheet,
} from "@/components/store/OrderFormSheet";
import type { Product } from "@/types/api";

interface PublicProduct extends Product {
  merchant?: {
    business_name?: string;
    business_description?: string;
    store_slug?: string;
    store_url?: string;
  };
}

const CustomerProductDetail = () => {
  const path = usePathname().split("/");
  const storeSlug = path[2];
  const productUuid = path[3];

  const [product, setProduct] = useState<PublicProduct>();

  useEffect(() => {
    if (!storeSlug || !productUuid) return;
    getPublicProductByUuid(storeSlug, productUuid)
      .then((r) => setProduct(r.data))
      .catch((e) =>
        toast.error(errorMessage(e, "Could not load product."))
      );
  }, [storeSlug, productUuid]);

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto pb-24 md:pb-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 px-6 md:px-10 py-8">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-4 w-1/2 mt-2" />
            <Skeleton className="h-24 w-full mt-2" />
          </div>
        </div>
      </main>
    );
  }

  const primary = product.images?.[0]?.image_url ?? product.primary_image ?? "";
  const merchantName = product.merchant?.business_name ?? storeSlug;

  return (
    <main className="max-w-7xl mx-auto pb-24 md:pb-12">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 px-6 md:px-10 py-8">
        <div>
          <div className="relative aspect-square w-full bg-ink-100 rounded-lg overflow-hidden">
            {primary && (
              <Image
                src={primary}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-md overflow-hidden bg-ink-100"
                >
                  <Image
                    src={img.image_url}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <Eyebrow className="block mb-2">PRODUCT</Eyebrow>
          <h1 className="text-[28px] leading-[36px] font-bold tracking-[-0.01em] text-foreground">
            {product.name}
          </h1>
          <div className="mt-3 text-[36px] leading-[44px] font-bold text-forest-700 tracking-[-0.01em] tabular-nums">
            ₦{product.price}
          </div>
          <Link
            href={`/store/${storeSlug}`}
            className="mt-3 inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground"
          >
            by{" "}
            <span className="text-forest-500 font-semibold">
              {merchantName}
            </span>
          </Link>
          <p className="mt-4 text-[15px] leading-[24px] text-foreground/80 max-w-prose whitespace-pre-wrap">
            {product.description}
          </p>

          {/* Desktop inline form */}
          <div className="hidden lg:block mt-10">
            <OrderFormInline productId={product.id} />
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-paper/95 backdrop-blur pt-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <OrderFormSheet
          productId={product.id}
          trigger={<Button className="w-full">Place order →</Button>}
        />
      </div>
    </main>
  );
};

export default CustomerProductDetail;
