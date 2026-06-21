import type { Metadata } from "next";
import type { ShareLinkResolve, ShareLinkIdentifyResponse } from "@/types/api";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const BACKEND = process.env.NEXT_PUBLIC_BASE_URI ?? "http://127.0.0.1:8000/api";

export async function fetchResolve(shortId: string): Promise<ShareLinkResolve | null> {
  try {
    const res = await fetch(`${BACKEND}/share-links/${shortId}/resolve/`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Passively identifies an existing lead by their cookie. Returns the
// redirect_to URL on success, or null if anything goes wrong. Callers MUST
// invoke `redirect()` themselves — we never call it here, because Next.js's
// `redirect()` works by throwing a special NEXT_REDIRECT error that would be
// swallowed by our internal try/catch.
export async function passiveIdentify(
  shortId: string,
  cookieValue: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND}/share-links/${shortId}/identify/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_token: cookieValue }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ShareLinkIdentifyResponse;
    return data.redirect_to ?? null;
  } catch {
    return null;
  }
}

export function buildShareMetadata(
  resolved: ShareLinkResolve,
  shortId: string,
  kind: "p" | "s",
): Metadata {
  const product = resolved.product;
  if (!product) return { title: resolved.merchant.business_name ?? "Store" };
  const title = resolved.merchant.business_name
    ? `${product.name} — ${resolved.merchant.business_name}`
    : product.name;
  const description = product.description?.slice(0, 160) ?? "";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE}/${kind}/${shortId}`,
      images: product.primary_image ? [product.primary_image] : [],
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}
