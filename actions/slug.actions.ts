import axios from "axios";
import { baseUrl } from "./auth.actions";
import type {
  SlugCheckResponse,
  BusinessSlugUpdate,
  MyStoreLinkResponse,
} from "@/types/api";

/**
 * Typed clients for slug availability + store-slug management.
 *
 * Auth: all three endpoints require the merchant token (read from
 * localStorage at call time, same convention as the rest of `actions/`).
 * `getMyStoreLink` is included here (rather than `share-links.actions.ts`)
 * because it's the "manage Store Link" data source — naturally lives next
 * to the slug update/check actions that the same UI also calls.
 */

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("buzzToken") : null;
  return { Authorization: `token ${token}` };
}

export async function checkSlugAvailability(slug: string): Promise<SlugCheckResponse> {
  const res = await axios.get<SlugCheckResponse>(
    `${baseUrl}/accounts/business/slug/check/`,
    {
      headers: authHeaders(),
      params: { slug },
    },
  );
  return res.data;
}

export async function updateStoreSlug(slug: string): Promise<BusinessSlugUpdate> {
  const res = await axios.patch<BusinessSlugUpdate>(
    `${baseUrl}/accounts/business/slug/`,
    { slug },
    { headers: authHeaders() },
  );
  return res.data;
}

export async function getMyStoreLink(): Promise<MyStoreLinkResponse> {
  const res = await axios.get<MyStoreLinkResponse>(
    `${baseUrl}/accounts/store/link/`,
    { headers: authHeaders() },
  );
  return res.data;
}
