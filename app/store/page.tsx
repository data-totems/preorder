"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAllProducts } from "@/actions/products.actions";
import ProductCard from "@/components/shared/ProductCard";
import DataPagination, { usePaginated } from "@/components/shared/DataPagination";
import CategoryGrid from "@/components/store/CategoryGrid";
import StoreSearchBox from "@/components/store/StoreSearchBox";
import EmptyState from "@/components/shared/EmptyState";

const PAGE_SIZE = 12;
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";
import { matchesCategory, getCategoryName } from "@/lib/categories";
import type { Product } from "@/types/api";

const Store = () => {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  const category = (searchParams.get("category") ?? "").trim();
  const filtering = query.length > 0 || category.length > 0;

  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    getAllProducts()
      .then((r) => Array.isArray(r.data) && setProducts(r.data))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!filtering) return [];
    const q = query.toLowerCase();
    return products.filter((p) => {
      if (query && !p.name?.toLowerCase().includes(q)) return false;
      if (category && !matchesCategory(p.name ?? "", category)) return false;
      return true;
    });
  }, [products, query, category, filtering]);

  const trending = products.slice(0, 8);
  const newest = [...products].reverse().slice(0, 8);
  const { slice: filteredPage, page, setPage, totalItems } = usePaginated(filtered, PAGE_SIZE);

  if (filtering) {
    const label = query
      ? `“${query}”`
      : `Category: ${getCategoryName(category)}`;
    return (
      <main className="max-w-7xl mx-auto">
        <section className="px-6 md:px-10 py-8 md:py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow className="block mb-2">RESULTS</Eyebrow>
              <h1 className="text-[28px] md:text-[32px] leading-[36px] font-bold tracking-[-0.01em] text-foreground">
                {label}
              </h1>
              <p className="mt-1 text-[14px] text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </p>
            </div>
            <Link href="/store">
              <Button variant="outline" type="button">Clear filters</Button>
            </Link>
          </div>
          <div className="mt-6 max-w-xl">
            <StoreSearchBox size="lg" />
          </div>
        </section>

        <section className="px-6 md:px-10 pb-16">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<SearchX />}
              title="Nothing matches yet"
              description="Try a different search, or clear the filter to see everything."
              action={
                <Link href="/store">
                  <Button type="button">Browse everything</Button>
                </Link>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredPage.map((p) => (
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
                />
              </div>
            </>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto">
      <section className="px-6 md:px-10 py-12 md:py-16">
        <Eyebrow tone="accent" className="block mb-3">BUZZMART</Eyebrow>
        <h1 className="text-[44px] md:text-[56px] leading-[1.1] font-bold tracking-[-0.02em] text-foreground max-w-2xl">
          Discover stores you&apos;ll love.
        </h1>
        <p className="mt-4 text-[17px] leading-[26px] text-muted-foreground max-w-xl">
          Find products from merchants you can talk to directly. Every order is one tap to a real human on WhatsApp.
        </p>
        <div className="mt-8 max-w-xl">
          <StoreSearchBox size="lg" />
        </div>
      </section>

      {trending.length > 0 && (
        <section className="px-6 md:px-10 py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <Eyebrow className="block mb-1">TRENDING NOW</Eyebrow>
              <h2 className="text-[28px] leading-[36px] font-bold tracking-[-0.01em] text-foreground">Most clicked this week</h2>
            </div>
            <Link href="/store/top-sellers">
              <Button variant="link" className="text-forest-500" type="button">See all →</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {trending.map((p) => (
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
        </section>
      )}

      {newest.length > 0 && (
        <section className="px-6 md:px-10 py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <Eyebrow className="block mb-1">NEW ARRIVALS</Eyebrow>
              <h2 className="text-[28px] leading-[36px] font-bold tracking-[-0.01em] text-foreground">Just listed</h2>
            </div>
            <Link href="/store/new-arrival">
              <Button variant="link" className="text-forest-500" type="button">See all →</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newest.map((p) => (
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
        </section>
      )}

      <section className="px-6 md:px-10 py-8 pb-16">
        <div className="mb-6">
          <Eyebrow className="block mb-1">BROWSE BY CATEGORY</Eyebrow>
          <h2 className="text-[28px] leading-[36px] font-bold tracking-[-0.01em] text-foreground">Categories</h2>
        </div>
        <CategoryGrid />
      </section>
    </main>
  );
};

export default Store;
