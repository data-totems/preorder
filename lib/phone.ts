// Phone number helpers — thin wrapper around libphonenumber-js with NG as the
// default country (matches the backend's `accounts/phone.py` normalization).
//
// Both helpers return their unhappy path as `null` / `false` rather than
// throwing — callers (e.g. the share-link Interstitial form) want to drive
// validation UI off this without try/catch on every keystroke.

import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Parse `raw` and return the E.164 representation (`+2348012345678`) when
 * valid, or `null` when blank/unparseable/invalid. Trims whitespace and
 * defaults to NG so local-format numbers like `0801…` and `801…` parse.
 */
export function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  const parsed = parsePhoneNumberFromString(raw.trim(), "NG");
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number; // E.164
}

/** True when `normalizePhone(raw)` would succeed. */
export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== null;
}
