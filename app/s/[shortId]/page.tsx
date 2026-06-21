import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Interstitial from "@/components/share/Interstitial";
import ShareLinkNotFound from "@/components/share/ShareLinkNotFound";
import { fetchResolve, passiveIdentify, buildShareMetadata } from "@/lib/share/shareLinkPage";

export async function generateMetadata({ params }: { params: { shortId: string } }): Promise<Metadata> {
  const resolved = await fetchResolve(params.shortId);
  if (!resolved) return { title: "Link not found" };
  return buildShareMetadata(resolved, params.shortId, "s");
}

export default async function StoreSharePage({ params }: { params: { shortId: string } }) {
  const resolved = await fetchResolve(params.shortId);
  if (!resolved) return <ShareLinkNotFound />;

  const existingCookie = cookies().get("bz_lead")?.value;
  if (existingCookie) {
    const redirectTo = await passiveIdentify(params.shortId, existingCookie);
    if (redirectTo) redirect(redirectTo);
  }

  return <Interstitial resolved={resolved} shortId={params.shortId} />;
}
