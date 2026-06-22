"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface ProductImageLike {
  image?: string | null;
  image_url?: string | null;
}

interface Props {
  images: ProductImageLike[];
  alt: string;
  /** Optional fallback when there's no image at all. */
  fallback?: string | null;
  className?: string;
}

const sourceFor = (img: ProductImageLike): string | null =>
  img.image || img.image_url || null;

export default function ProductImageCarousel({
  images,
  alt,
  fallback,
  className,
}: Props) {
  const sources = images
    .map(sourceFor)
    .filter((s): s is string => Boolean(s));
  const finalSources = sources.length > 0 ? sources : fallback ? [fallback] : [];

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const handler = () => setCurrent(api.selectedScrollSnap());
    api.on("select", handler);
    return () => {
      api.off("select", handler);
    };
  }, [api]);

  if (finalSources.length === 0) {
    return (
      <div
        className={cn(
          "relative aspect-square w-full bg-ink-100 rounded-lg overflow-hidden flex flex-col items-center justify-center text-ink-300 gap-2",
          className,
        )}
      >
        <ImagePlus className="size-8" />
        <span className="text-[13px]">No image yet</span>
      </div>
    );
  }

  if (finalSources.length === 1) {
    return (
      <div
        className={cn(
          "relative aspect-square w-full bg-ink-100 rounded-lg overflow-hidden",
          className,
        )}
      >
        <Image
          src={finalSources[0]}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Carousel setApi={setApi} opts={{ loop: true }} className="relative">
        <CarouselContent>
          {finalSources.map((src, i) => (
            <CarouselItem key={i}>
              <div className="relative aspect-square w-full bg-ink-100 rounded-lg overflow-hidden">
                <Image
                  src={src}
                  alt={`${alt} — ${i + 1} of ${finalSources.length}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3 size-9 bg-white/90 border-border shadow-md hover:bg-white" />
        <CarouselNext className="right-3 size-9 bg-white/90 border-border shadow-md hover:bg-white" />
      </Carousel>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5">
        {finalSources.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to image ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              current === i ? "w-6 bg-forest-700" : "w-1.5 bg-ink-200 hover:bg-ink-300",
            )}
          />
        ))}
      </div>

      {/* Thumbnail strip — hidden on small screens to save space */}
      <div className="hidden sm:grid grid-cols-4 gap-3">
        {finalSources.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => api?.scrollTo(i)}
            aria-label={`Show image ${i + 1}`}
            className={cn(
              "relative aspect-square rounded-md overflow-hidden bg-ink-100 transition-colors",
              current === i
                ? "ring-2 ring-forest-500"
                : "border border-border hover:border-ink-300",
            )}
          >
            <Image src={src} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
