"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getStoreDetails } from "@/actions/products.actions";
import { toast } from "sonner";
import { errorMessage } from "@/lib/errors";
import MerchantHero from "@/components/store/MerchantHero";
import ProductCard from "@/components/shared/ProductCard";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, PublicStoreResponse } from "@/types/api";

const StoreDetails = () => {
  const slug = usePathname().split("/")[2];
  const [store, setStore] = useState<PublicStoreResponse>();
  const [query, setQuery] = useState("");

  useEffect(() => {
    getStoreDetails(slug)
      .then((r) => setStore(r.data))
      .catch((e) => toast.error(errorMessage(e, "Could not load store.")));
  }, [slug]);

  if (!store) {
    return (
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        <Skeleton className="h-8 w-24 mb-4" />
        <Skeleton className="h-12 w-2/3 mb-3" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </main>
    );
  }

  const products = (store.products ?? []).filter((p: Product) =>
    query ? p.name?.toLowerCase().includes(query.toLowerCase()) : true
  );

  return (
    <>
      <MerchantHero merchant={store.merchant ?? {}} />
      <div className="sticky top-14 md:top-16 z-30 bg-paper/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className="w-full h-10 rounded-md bg-ink-100 border-0 pl-10 pr-3 text-[14px] placeholder:text-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-white"
            />
          </div>
        </div>
      </div>
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p: Product) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              image_url={p.images?.[0]?.image_url ?? undefined}
              href={`/store/${slug}/${p.product_id}`}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default StoreDetails;
