/**
 * Coerce an unknown error into a user-facing message string.
 *
 * Handles:
 *  - the raw `error.response.data` shape from a fresh axios error
 *  - the post-throw shape from actions (which throw `error.response.data ?? { message }`)
 *  - DRF field-error maps (`{ email: ["already in use"] }`)
 *  - plain `Error` instances and strings
 */
export function errorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return fallback;

  const e = error as Record<string, unknown>;

  // Fresh axios error: drill into response.data first.
  const responseData = (e.response as { data?: unknown } | undefined)?.data;
  const fromAxios = extractFromBody(responseData);
  if (fromAxios) return fromAxios;

  // Already-normalized (post-throw) body, or plain Error.
  const fromBody = extractFromBody(e);
  if (fromBody) return fromBody;

  return fallback;
}

function extractFromBody(body: unknown): string | null {
  if (!body) return null;
  if (typeof body === "string") return body;
  if (typeof body !== "object") return null;

  const b = body as Record<string, unknown>;
  if (typeof b.detail === "string") return b.detail;
  if (typeof b.message === "string") return b.message;
  if (typeof b.error === "string") return b.error;

  // DRF field errors: { fieldName: ["error message"] }
  for (const value of Object.values(b)) {
    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }
  }
  return null;
}
