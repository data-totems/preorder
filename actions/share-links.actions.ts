import axios from "axios";
import { baseUrl } from "./auth.actions";
import type {
  ShareLinkResolve,
  ShareLinkIdentifyResponse,
  LeadActivity,
  PaginatedLeads,
  ShareStats,
} from "@/types/api";

/**
 * Typed clients for the share-link, leads, and share-stats endpoints.
 *
 * Auth model mirrors the rest of the codebase: the merchant-only endpoints
 * read `buzzToken` from localStorage and send it as `Authorization: token …`.
 * The two public endpoints (`resolve`, `identify`) are anonymous.
 *
 * Errors are intentionally NOT caught here — callers wrap their axios calls in
 * try/catch and feed the thrown error to `errorMessage()` from `lib/errors.ts`
 * (same pattern as the existing actions).
 */

// --- Public (no auth) -------------------------------------------------------

export async function resolveShareLink(shortId: string): Promise<ShareLinkResolve> {
  const res = await axios.get<ShareLinkResolve>(
    `${baseUrl}/share-links/${shortId}/resolve/`,
  );
  return res.data;
}

export async function identifyVisitor(
  shortId: string,
  body: { wa_number?: string; name?: string; lead_token?: string },
): Promise<ShareLinkIdentifyResponse> {
  const res = await axios.post<ShareLinkIdentifyResponse>(
    `${baseUrl}/share-links/${shortId}/identify/`,
    body,
  );
  return res.data;
}

// --- Merchant (auth required) ----------------------------------------------

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("buzzToken") : null;
  return { Authorization: `token ${token}` };
}

export async function getLeads(params: {
  search?: string;
  since?: string;
  page?: number;
} = {}): Promise<PaginatedLeads> {
  const res = await axios.get<PaginatedLeads>(`${baseUrl}/share-links/leads/`, {
    headers: authHeaders(),
    params,
  });
  return res.data;
}

export async function getLeadActivity(leadId: number): Promise<LeadActivity> {
  const res = await axios.get<LeadActivity>(
    `${baseUrl}/share-links/leads/${leadId}/activity/`,
    { headers: authHeaders() },
  );
  return res.data;
}

export async function getProductShareStats(productId: number): Promise<ShareStats> {
  const res = await axios.get<ShareStats>(
    `${baseUrl}/products/${productId}/share-stats/`,
    { headers: authHeaders() },
  );
  return res.data;
}

export async function getStoreShareStats(): Promise<ShareStats> {
  const res = await axios.get<ShareStats>(`${baseUrl}/share-links/store-link/`, {
    headers: authHeaders(),
  });
  return res.data;
}
