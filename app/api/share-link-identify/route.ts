import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ShareLinkIdentifyResponse } from "@/types/api";

const COOKIE_NAME = "bz_lead";
const NINETY_DAYS_SECONDS = 60 * 60 * 24 * 90;

export async function POST(req: Request) {
  const backendBase = process.env.NEXT_PUBLIC_BASE_URI;
  if (!backendBase) {
    return NextResponse.json({ message: "Backend not configured" }, { status: 500 });
  }
  const body = await req.json();
  const { shortId, wa_number, name } = body;
  const existing = cookies().get(COOKIE_NAME)?.value;

  const res = await fetch(`${backendBase}/share-links/${shortId}/identify/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wa_number,
      name,
      lead_token: existing,
    }),
  });
  const data = (await res.json()) as Partial<ShareLinkIdentifyResponse> & Record<string, unknown>;
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }
  // Guard against a 2xx response with a malformed body — we'd otherwise set
  // bz_lead=undefined and clobber the existing cookie.
  if (!data.lead_token || !data.redirect_to) {
    return NextResponse.json(
      { message: "Malformed response from backend" },
      { status: 502 },
    );
  }
  const response = NextResponse.json({ redirect_to: data.redirect_to });
  response.cookies.set(COOKIE_NAME, data.lead_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: NINETY_DAYS_SECONDS,
    path: "/",
  });
  return response;
}
