/**
 * Persists the customer's identity captured on the share-link interstitial so
 * later flows (order form, future support page) don't make them retype.
 *
 * Stored client-side only. Lives in localStorage with no expiry; the customer
 * can always edit the prefilled values before submitting.
 */

const KEY = "bz_buyer";

export interface BuyerProfile {
  name: string;
  wa_number: string;
  address?: string;
  savedAt: string;
}

export function saveBuyerProfile(profile: Omit<BuyerProfile, "savedAt">): void {
  if (typeof window === "undefined") return;
  if (!profile.wa_number) return;
  try {
    // Merge with whatever's already there so partial saves (e.g. interstitial
    // without an address) don't wipe an address captured on a prior order.
    let existing: BuyerProfile | null = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) existing = JSON.parse(raw) as BuyerProfile;
    } catch {
      existing = null;
    }
    const payload: BuyerProfile = {
      name: profile.name || existing?.name || "",
      wa_number: profile.wa_number,
      address: profile.address || existing?.address || "",
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* localStorage can throw in private mode — silent failure is fine */
  }
}

export function readBuyerProfile(): BuyerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BuyerProfile;
    if (!parsed.wa_number) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearBuyerProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* silent */
  }
}
