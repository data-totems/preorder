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

const FALLBACK_IMAGE = `${SITE}/logo.png`;

export function buildShareMetadata(
  resolved: ShareLinkResolve,
  shortId: string,
  kind: "p" | "s",
): Metadata {
  const product = resolved.product;
  const merchant = resolved.merchant;
  const url = `${SITE}/${kind}/${shortId}`;

  // STORE link: title = merchant, description = merchant blurb, image =
  // merchant display picture if any, else site logo so the WA card still
  // renders with a visual instead of plain text.
  if (!product) {
    const title = merchant.business_name ?? "Store on Buzzmart";
    const description = `Shop ${merchant.business_name ?? "this store"} on Buzzmart — order directly via WhatsApp.`;
    const image = merchant.display_picture || FALLBACK_IMAGE;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: "Buzzmart",
        images: [{ url: image, alt: title, width: 1200, height: 630 }],
        type: "website",
      },
      twitter: { card: "summary_large_image", title, description, images: [image] },
    };
  }

  // PRODUCT link: title = product, description = product blurb, image =
  // product primary image (already an absolute URL from the backend).
  const title = merchant.business_name
    ? `${product.name} — ${merchant.business_name}`
    : product.name;
  const description = product.description?.slice(0, 160) ?? "";
  const image = product.primary_image || FALLBACK_IMAGE;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Buzzmart",
      images: [{ url: image, alt: title, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
