"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getAllProducts } from "@/actions/products.actions";
import ProductCard from "@/components/shared/ProductCard";
import DataPagination, { usePaginated } from "@/components/shared/DataPagination";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types/api";

const PAGE_SIZE = 12;

const TopSellers = () => {
  const [products, setProducts] = useState<Product[] | null>(null);
  useEffect(() => {
    getAllProducts()
      .then((r) => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProducts([]));
  }, []);

  const { slice, page, setPage, totalItems } = usePaginated(products ?? [], PAGE_SIZE);
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <main className="max-w-7xl mx-auto">
      <section className="px-6 md:px-10 py-10">
        <div className="flex items-end justify-between">
          <div>
            <Eyebrow className="block mb-2">TRENDING NOW</Eyebrow>
            <h1 className="text-[32px] leading-[40px] font-bold tracking-[-0.01em] text-foreground">Most clicked this week</h1>
            <p className="mt-1 text-[14px] text-muted-foreground">
              The products shoppers are tapping on most across Buzzmart.
            </p>
          </div>
          <Link href="/store">
            <Button variant="outline" type="button">← Back to storefront</Button>
          </Link>
        </div>
      </section>

      <section className="px-6 md:px-10 pb-16">
        {!products ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        ) : (
          <>
            <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {slice.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  image_url={p.images?.[0]?.image_url ?? undefined}
                  href={`/store/${p.store_slug}/${p.product_id}`}
                  inStock={p.in_stock !== false}
                />
              ))}
            </div>
            <div className="mt-10">
              <DataPagination
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
                currentPage={page}
                onPageChange={setPage}
                scrollTargetRef={gridRef}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default TopSellers;
