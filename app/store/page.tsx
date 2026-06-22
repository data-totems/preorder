"use client";
import { useEffect, useState } from "react";
import { getAllProducts } from "@/actions/products.actions";
import ProductCard from "@/components/shared/ProductCard";
import CategoryGrid from "@/components/store/CategoryGrid";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { Product } from "@/types/api";

const Store = () => {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    getAllProducts()
      .then((r) => Array.isArray(r.data) && setProducts(r.data))
      .catch(() => {});
  }, []);

  const trending = products.slice(0, 8);
  const newest = [...products].reverse().slice(0, 8);

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
        <div className="mt-8 max-w-xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-ink-300" />
          <input
            placeholder="Search products or stores"
            className="w-full h-14 rounded-md bg-ink-100 border-0 pl-12 pr-4 text-[16px] placeholder:text-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-white"
          />
        </div>
      </section>

      {trending.length > 0 && (
        <section className="px-6 md:px-10 py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <Eyebrow className="block mb-1">TRENDING NOW</Eyebrow>
              <h2 className="text-[28px] leading-[36px] font-bold tracking-[-0.01em] text-foreground">Most clicked this week</h2>
            </div>
            <Button variant="link" className="text-forest-500">See all →</Button>
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
            <Button variant="link" className="text-forest-500">See all →</Button>
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
