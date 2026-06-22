"use client";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";

interface TopProduct {
  id: number;
  name: string;
  price: string;
  primary_image: string | null;
}

interface Props {
  products?: TopProduct[];
  loading?: boolean;
}

const TopProductsList = ({ products, loading }: Props) => {
  return (
    <Card padding="none" className="p-6">
      <div>
        <Eyebrow className="block">TOP PRODUCTS</Eyebrow>
        <ul className="mt-4 flex flex-col gap-1">
          {loading && (
            <>
              <li><Skeleton className="h-14 w-full rounded-md" /></li>
              <li><Skeleton className="h-14 w-full rounded-md" /></li>
              <li><Skeleton className="h-14 w-full rounded-md" /></li>
            </>
          )}
          {!loading && (products?.length ?? 0) === 0 && (
            <li className="py-8 text-center text-[14px] text-muted-foreground">
              No products yet.
            </li>
          )}
          {!loading &&
            products?.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/marketplace/product/${p.id}`}
                  className="-mx-3 px-3 py-2 flex items-center gap-3 rounded-md hover:bg-ink-50 transition-colors"
                >
                  <div className="size-12 rounded-md bg-ink-100 overflow-hidden relative shrink-0">
                    {p.primary_image && (
                      <Image
                        src={p.primary_image}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-foreground truncate">
                      {p.name}
                    </div>
                    <div className="text-[12px] text-forest-700 font-semibold tabular-nums">
                      ₦{p.price}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </Card>
  );
};

export default TopProductsList;
