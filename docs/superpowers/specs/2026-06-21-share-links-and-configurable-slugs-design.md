# Share Links, Lead Capture, and Configurable Store Slugs

**Date:** 2026-06-21
**Scope:** v1 — ships in ~2 weeks, fully local until merged
**Spans:** `Buzzmart_backend` (`final` branch), `preorder` (frontend)

## Problem

Merchants want to drive traffic from WhatsApp — both their personal Status and the groups they're in — to their Buzzmart store. Today they can paste a `/store/<slug>/<product_uuid>/` URL into WhatsApp, but:

1. WhatsApp's link preview is generic (no product image, no price) because the page lacks Open Graph metadata.
2. The merchant has no idea who tapped the link unless that person also placed an order.
3. The store slug is auto-generated from the business name at signup with no way to change it later, blocking campaign-specific URLs (e.g. Black Friday).

The feature adds shareable per-product and per-store URLs with rich WhatsApp previews, a mandatory identity gate that captures every visitor's WhatsApp number, a Leads inbox where the merchant can chat any captured visitor back, and an editable store slug with redirect aliases so old shared links keep working when the slug changes.

## Out of scope (deferred, documented in Future Work)

- OTP verification of WhatsApp numbers
- Multiple simultaneously-active slugs (parallel campaign URLs)
- WhatsApp Business API broadcast to captured leads
- Custom share-message templates per merchant
- Per-channel attribution (Status vs Group vs DM)
- Programmatic auto-posting to WhatsApp Status or groups — **impossible**; WhatsApp does not expose any API or URL scheme for this. Best UX achievable is `navigator.share()` (mobile) and `wa.me/?text=` (desktop): one tap to open WhatsApp with the message pre-filled, user still picks the destination.

## Data model

Four new tables in `accounts/models.py`, one behavioral change to the existing `BusinessDetails`.

### `ShareLink`

One row per product (kind="product"), one per store (kind="store"). Auto-created — merchants never POST/DELETE these.

| Column | Type | Notes |
|---|---|---|
| id | PK | |
| short_id | string(8) unique indexed | `secrets.token_urlsafe(6)` — ~2.8×10¹⁴ space, brute-force infeasible |
| kind | enum("product", "store") | |
| product | FK → Products, nullable | Set when kind=product |
| merchant | FK → User | Always set, denormalized for fast lookup |
| created_at | datetime | |
| is_active | bool default true | Soft-delete; never hard-delete rows with ClickEvents |

### `Lead`

One row per WhatsApp number per merchant. Per-merchant intentionally — same customer browsing two merchants is two Lead rows (privacy + isolation).

| Column | Type | Notes |
|---|---|---|
| id | PK | |
| merchant | FK → User | |
| wa_number | string(20) | Stored in normalized E.164 (`+234…`) — single source of truth |
| name | string(80) nullable | Optional field on interstitial |
| first_seen_at | datetime | |
| last_seen_at | datetime | |

Unique constraint on `(merchant, wa_number)`.

### `ClickEvent`

Raw funnel events. Powers analytics rollups and per-lead activity views.

| Column | Type | Notes |
|---|---|---|
| id | PK | |
| share_link | FK → ShareLink | |
| lead | FK → Lead, nullable | Null only during the ~200ms between page load and identify submit; intentional so a future "abandoned" event is paintable |
| event_type | enum("submit", "view") | submit = first identification, view = returning identified visitor |
| occurred_at | datetime indexed | |
| ip | string | For abuse only; never shown to merchant |
| user_agent | string | Same |

Index `(share_link, occurred_at desc)` for recent-clicks queries.
Index `(lead, occurred_at desc)` for activity drawer.

### `StoreSlugAlias`

Redirect history. Enables editable slugs without breaking old shared URLs.

| Column | Type | Notes |
|---|---|---|
| id | PK | |
| slug | string unique indexed | |
| business_details | FK → BusinessDetails | |
| is_current | bool | Exactly one true per merchant (enforced in app code + a partial unique index where supported) |
| retired_at | datetime nullable | Set when is_current flips to false |

Index `(business_details, last_seen_at desc)` for the leads inbox sort.

### Change to existing `BusinessDetails`

`store_slug` field stays. Invariant: every `BusinessDetails.store_slug` value must also exist as a `StoreSlugAlias` row with `is_current=true` and the matching `business_details` FK. Enforced by:

- Migration: backfills aliases for every existing `BusinessDetails`.
- Slug-update endpoint: atomic — flip old alias to `is_current=false` + set `retired_at=now()`, create new alias with `is_current=true`, update `BusinessDetails.store_slug`.

### Invariants summary

- `wa_number` is always E.164. Normalization happens at API ingress; no other layer touches it.
- `Lead` is per-merchant. Cross-merchant recognition is explicitly not v1.
- `ShareLink.short_id` collisions are retried on insert (try up to 5 times before raising — practically never happens but defensive).
- A retired `StoreSlugAlias.slug` stays reserved (blocked from re-use even by the same merchant). Prevents redirect-chain confusion and squatting.

## API surface

### Public (no auth)

#### `GET /api/share-links/<short_id>/resolve/`

```
200 OK
{
  "kind": "product" | "store",
  "merchant": {
    "business_name": "Aunty Bola's Tech Shop",
    "store_slug": "aunty-bola",
    "display_picture": "https://..."
  },
  "product": {                              // present iff kind=product
    "id": 42,
    "name": "XIAOMI Redmi 14C",
    "price": "85000.00",
    "primary_image": "https://...",
    "description": "..."
  }
}

404 if short_id unknown OR is_active=false
```

The Next.js interstitial page calls this server-side to render the OG meta tags and decide what to show.

#### `POST /api/share-links/<short_id>/identify/`

```
Request:
{
  "wa_number": "08127778036",      // accepted in NG-local or E.164; normalized server-side
  "name": "Adekunle",              // optional
  "lead_token": "<signed-blob>"    // optional; from existing bz_lead cookie
}

200 OK
{
  "lead_token": "<new signed blob>",
  "redirect_to": "/store/aunty-bola/<product_uuid>"
}
```

Side effects:
- Normalize `wa_number` to E.164 (libphonenumber-python).
- Upsert `Lead(merchant, wa_number)` inside an atomic block; update `last_seen_at`.
- Create `ClickEvent`.
  - With valid incoming `lead_token` matching the merchant: `event_type="view"`.
  - Otherwise (new or mismatched cookie): `event_type="submit"`.

Token signing: HMAC-SHA256 of `lead_id|merchant_id|exp_unix` keyed by `LEAD_TOKEN_SECRET`. Decoded server-side only.

### Slug routing (un-prefixed Django URLs — behavior change)

#### `GET /store/<slug>/`

Look up `StoreSlugAlias` by slug:

- `is_current=true` → serve store (current behavior preserved).
- `is_current=false` → `301 Moved Permanently` to `/store/<current_slug_for_that_merchant>/`.
- no match → `404`.

#### `GET /store/<slug>/<product_uuid>/`

Same alias resolution, redirect preserves the product path.

### Merchant (authenticated)

#### `PATCH /api/accounts/business/slug/`

```
Request: { "slug": "aunty-bola-blackfriday" }

200 OK
{
  "slug": "aunty-bola-blackfriday",
  "store_url": "https://buzzmart.app/store/aunty-bola-blackfriday",
  "aliases": [
    { "slug": "aunty-bola", "retired_at": "2026-06-21T14:30:00Z" },
    { "slug": "aunty-bola-store", "retired_at": "2026-04-05T09:00:00Z" }
  ]
}

400 if slug in use, reserved, or format invalid
{ "slug": ["already in use" | "reserved" | "invalid format"] }
```

Atomic: retire old alias, create new alias, update `BusinessDetails.store_slug`.

#### `GET /api/accounts/business/slug/check/?slug=foo`

```
200 OK
{
  "available": false,
  "reason": "taken" | "reserved" | "format",
  "suggestions": ["foo-2", "foo-tech", "foo-ng"]    // when reason=taken
}
```

Used by the slug-input debounced availability check.

#### `GET /api/share-links/leads/?ordering=-last_seen_at&page=1&since=<iso>`

Paginated 20 per page. `since` query param returns only leads with `last_seen_at > since` (used for the sidebar new-leads badge).

```
200 OK
{
  "count": 47,
  "next": "?page=2",
  "previous": null,
  "results": [
    {
      "id": 12,
      "wa_number": "+2348127778036",
      "name": "Adekunle Adeyemi",
      "first_seen_at": "2026-06-18T09:14:00Z",
      "last_seen_at": "2026-06-21T13:46:00Z",
      "whatsapp_link": "https://wa.me/2348127778036",
      "click_count": 12,
      "order_count": 2
    },
    ...
  ]
}
```

#### `GET /api/share-links/leads/<id>/activity/`

```
200 OK
{
  "lead": { ... same shape as above ... },
  "events": [
    { "occurred_at": "...", "event_type": "submit", "share_link": { "kind": "product", "product": { "id": 42, "name": "XIAOMI..." } } },
    { "occurred_at": "...", "event_type": "view",   "share_link": { ... } },
    ...
  ]
}
```

#### `GET /api/products/<id>/share-stats/`

```
200 OK
{
  "short_id": "abc12345",
  "full_url": "https://buzzmart.app/p/abc12345",
  "total_clicks": 47,
  "unique_leads": 12,
  "total_orders": 4,
  "recent_clicks": [ ...last 20 ClickEvents with lead snippets ... ]
}
```

#### `GET /api/share-links/store-link/`

Same shape as `share-stats` but for the merchant's store-level link.

### What's deliberately not in the API

- No CRUD on `ShareLink`. Auto-created on Product create and on BusinessDetails create.
- No CRUD on `ClickEvent`. Only created by `/identify/`, only read via the aggregate endpoints.
- No CRUD on `StoreSlugAlias`. Only changes via the slug-update endpoint, in atomic transactions.

This keeps the surface tiny and intent-clear.

## Interstitial UX flow

### Routes (Next.js)

```
app/p/[shortId]/page.tsx     # product share landing
app/s/[shortId]/page.tsx     # store share landing
```

### Server-side page lifecycle

1. Page hit: `GET /p/abc12345`.
2. Server fetches `/api/share-links/abc12345/resolve/`.
   - 404 → render "This link is no longer active" with link to `/store`.
3. `generateMetadata` builds OG tags from resolve response:
   - `og:title` = `<product.name> — <merchant.business_name>`
   - `og:description` = `product.description` truncated to 160 chars
   - `og:image` = `product.primary_image` (absolute URL)
   - `og:url` = canonical full URL
   - `og:type` = `product`
   - `twitter:card` = `summary_large_image`
4. Read `bz_lead` cookie. If present, server-side POST to `/identify/` with the existing token.
   - 200 with `redirect_to` → set refreshed cookie, server-side `302` to `redirect_to`. Visitor never sees the interstitial.
   - 400 (expired or wrong-merchant token) → fall through to step 5.
5. Render the interstitial component (client-side from here).

### Interstitial UI (`components/share/Interstitial.tsx`)

```
┌────────────────────────────────────────┐
│  [product image, full bleed]           │
│                                         │
│  XIAOMI Redmi 14C                      │
│  ₦85,000                                │
│  by Aunty Bola's Tech Shop             │
│                                         │
│  Enter your WhatsApp to see details:   │
│  [+234 _ _ _ _ _ _ _ _ _ _ _]          │
│  Your name (optional)                  │
│  [_______________________]              │
│                                         │
│  [ Continue → ]                         │
│                                         │
│  We'll only use this to follow up      │
│  about your order. No spam.            │
└────────────────────────────────────────┘
```

Fields:
- WhatsApp number: required. `libphonenumber-js` validation with NG default. Auto-normalize to E.164 on submit.
- Name: optional. shadcn `Input`. Sentence-cased on blur.

Behavior:
- Continue button disabled until WA number passes format validation.
- Submit → `POST /api/share-link-identify/` (Next.js Route Handler proxy).
- Route Handler sets the `bz_lead` cookie from the response (`HttpOnly`, `SameSite=Lax`, `Secure` in prod, 90-day TTL), returns the redirect target.
- Client uses `router.replace(redirect_to)` so the interstitial doesn't stay in history.
- Errors surface through the existing `errorMessage()` helper in `lib/errors.ts`.

### Cookie

- Name: `bz_lead`
- Value: HMAC-signed `lead_id|merchant_id|exp_unix`
- TTL: 90 days
- `HttpOnly`, `SameSite=Lax`, `Secure` in production
- Scoped to the frontend domain

Per-merchant: a visitor identified for merchant A who taps merchant B's link gets the form again (the token's merchant_id won't match). This is intentional v1 behavior; multi-merchant recognition is a v2 cookie-payload change.

### Edge cases in this flow

- Share link deactivated between resolve and submit → identify returns 404 → frontend shows "no longer available".
- Visitor tampers with cookie → HMAC fails → backend treats as no-cookie → form re-renders.
- Visitor reloads after identifying → cookie present → instant redirect.
- WhatsApp scraper (`User-Agent: WhatsApp/2`) fetches the URL → gets HTML with full OG tags in `<head>`; the visible body is irrelevant to the preview card.

## Merchant analytics view

Three surfaces, one new and two additions.

### New: `app/(dashboard)/leads/page.tsx`

Sits next to `/orders` in dashboard nav. Per-customer view, not per-event.

```
LEADS                                          [search 080…]

47 leads · sorted by most recent

┌──────────────────────────────────────────────────────────────┐
│  Adekunle Adeyemi (+234 812 777 8036)                        │
│  First clicked 3 days ago · 12 views · 2 orders              │
│  Last seen 14m ago — viewed XIAOMI Redmi 14C                 │
│  [💬 Chat on WhatsApp]   [View activity →]                   │
├──────────────────────────────────────────────────────────────┤
│  Unknown name (+234 901 234 5678)                            │
│  First clicked yesterday · 3 views · 0 orders                │
│  Last seen 2h ago — viewed Samsung A15                       │
│  [💬 Chat on WhatsApp]   [View activity →]                   │
└──────────────────────────────────────────────────────────────┘
```

- Driven by `GET /api/share-links/leads/` (paginated 20).
- Search filters by WA prefix (client-side dedupe for v1; server-side filter when leads > 1000).
- "Chat on WhatsApp" opens `https://wa.me/<E.164>` in a new tab.
- "View activity" opens a drawer showing every `ClickEvent` for this lead via `GET /api/share-links/leads/<id>/activity/`.
- Empty state: "No leads yet. Share your store or product links on WhatsApp to start collecting leads. [Copy store link]".

### Modified: `app/(dashboard)/marketplace/product/[id]/page.tsx`

Drop a `SharePanel` at the top of the existing product detail page:

```
┌──────────────────────────────────────────────────────────────┐
│  SHARE LINK                                                  │
│  buzzmart.app/p/abc12345           [📋 Copy]   [💬 Share]    │
│                                                              │
│  47 clicks · 12 unique leads · 4 orders                      │
│                                                              │
│  Recent clicks:                                              │
│  · 14m ago — Adekunle (+234 812…) viewed                    │
│  · 1h ago  — Unknown (+234 901…) viewed                     │
│  · 2h ago  — Adekunle (+234 812…) ordered ↗                 │
│                                                              │
│  [See all activity →]                                        │
└──────────────────────────────────────────────────────────────┘
```

Driven by `GET /api/products/<id>/share-stats/`.

The Share button:
- Mobile: `navigator.share({ title, text, url })` → native share sheet → user picks WhatsApp destination.
- Desktop: clipboard copy + open `https://wa.me/?text=<encoded>` in new tab.

Pre-filled message template (hardcoded in v1):

```
📱 *<product name>* — ₦<price>
Tap to view: <full url>
```

### Modified: `app/(dashboard)/manage/page.tsx`

New "Store Link" tab alongside existing Account / Business / Payment / Dispatch tabs:

```
┌──────────────────────────────────────────────────────────────┐
│  YOUR STORE LINK                                             │
│  buzzmart.app/store/aunty-bola      [Edit slug]              │
│                                                              │
│  Share to bring customers in:                                │
│  buzzmart.app/s/xyz98765            [📋 Copy]   [💬 Share]   │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  STORE-LINK STATS                                            │
│  124 clicks · 38 unique leads · 9 orders                     │
│                                                              │
│  Recent clicks:                                              │
│  · 5m ago  — Unknown (+234 …) viewed store                  │
│  · 12m ago — Funmi (+234 …) viewed store                    │
│                                                              │
│  [See all activity →]                                        │
└──────────────────────────────────────────────────────────────┘
```

"Edit slug" opens the slug edit modal (next section). Driven by `GET /api/share-links/store-link/`.

### Sidebar nav change

Add `Leads` between `Orders` and `Manage`. Badge shows new-leads-since-last-visit count, fetched once on dashboard mount via `GET /api/share-links/leads/?since=<localStorage.lastSeenLeadsAt>`. Stored client-side; reset on visit to `/leads`.

## Slug editor UI

### Shared `components/slug/SlugInput.tsx`

Used in setup wizard and edit modal.

```
┌──────────────────────────────────────────────────────────────┐
│  STORE LINK                                                  │
│  buzzmart.app/store/ [aunty-bola_______]   ✓ Available       │
│  3–40 characters · lowercase, numbers, hyphens               │
└──────────────────────────────────────────────────────────────┘
```

Features:
- Prefix label is visual context, non-editable.
- Auto-lowercase on type.
- Inline format validation: 3–40 chars, `[a-z0-9-]`, no leading/trailing/consecutive hyphens.
- Reserved-word check (client-side first, server authoritative).
- Debounced availability check (300ms after last keystroke): `GET /api/accounts/business/slug/check/`.
- Visual states beside the field: `…` (debouncing), `✓ Available`, `✗ Already taken`, `✗ Reserved`, `✗ Invalid format`.
- When `available=false reason=taken`, render suggestions as clickable chips below the input.

Reserved word list (v1, extend as features ship):

```
admin api auth login register setup manage marketplace orders leads
notifications p s store dispatch www mail static media _next
```

### Setup wizard integration (`components/setup/BussinessDetails.tsx`)

Current form has business name, description, email. Add the slug field directly under business name:

```
Business name:        [Aunty Bola's Tech Shop]
Your store link:      buzzmart.app/store/ [aunty-bola] ✓
Business description: [...]
Business email:       [...]
```

Auto-suggest: as the merchant types into the business-name field, the slug field fills with `slugify(business_name)` (lowercase, replace non-alnum with `-`, trim). Merchant can override. Submitted as part of the existing `/setup/` payload — backend's `SetupAccountSerializer` accepts `store_slug` as a real input now (was previously optional + auto-generated).

### Edit modal (`components/slug/EditSlugModal.tsx`)

Triggered by "Edit slug" in the Store Link tab.

```
┌──────────────────────────────────────────────────────────────┐
│  Edit your store link                                  ✕     │
│                                                              │
│  Your current link:                                          │
│  buzzmart.app/store/aunty-bola                               │
│                                                              │
│  New link:                                                   │
│  buzzmart.app/store/ [aunty-bola-blackfriday] ✓ Available    │
│                                                              │
│  ⚠ Old links keep working                                    │
│  Customers who tap your old link will be redirected to       │
│  your new one. You can change this any time.                 │
│                                                              │
│  Previously used slugs (still redirect to your store):       │
│  · aunty-bola (active until 5 mins ago)                      │
│  · aunty-bola-store (retired 2 weeks ago)                    │
│                                                              │
│              [Cancel]              [Update store link]       │
└──────────────────────────────────────────────────────────────┘
```

Submit flow:
1. PATCH `/api/accounts/business/slug/` with `{ slug }`.
2. Success → toast "Store link updated", close modal, refresh Store Link tab data.
3. 400 → inline error under the field via `errorMessage()`.

Alias history sourced from the existing `GET /api/accounts/store/link/` response (extended to include `aliases: [{slug, retired_at}, ...]`).

### Validation rules (locked)

| Rule | Detail |
|---|---|
| Length | 3–40 characters |
| Character set | `[a-z0-9-]` only |
| No leading/trailing hyphen | `-foo` and `foo-` rejected |
| No consecutive hyphens | `foo--bar` rejected |
| Reserved words | See list above |
| Case | Auto-lowercased on input |
| Uniqueness | Cross-checked against ALL `StoreSlugAlias` rows (current + historical) |

The uniqueness-vs-all-aliases rule is load-bearing: retired slugs stay reserved so no one can squat on a competitor's old slug and no merchant can create a confused redirect chain.

## Edge cases & abuse

### Edge cases

| Scenario | Behavior |
|---|---|
| Merchant deletes a product with ClickEvents | Soft-delete only: `Product.is_archived=true` and `ShareLink.is_active=false`. Block hard-delete in the view when ClickEvents exist. `/p/<short_id>` → 404 "no longer available". |
| Race: two visitors submit same WA number simultaneously | `get_or_create` inside atomic block + DB unique constraint backstop. Both succeed, one Lead, two ClickEvents. |
| Merchant changes slug mid-interstitial | `/identify/` resolves merchant via FK (not slug). `redirect_to` is built at submit time with the current slug. Works. |
| Visitor submits fake `+234 000 000 0000` | v1 has format validation only. Semantic verification (OTP) is v2. |
| Merchant picks a previously-retired slug | Blocked: validation cross-checks all aliases. |
| Cookie present but Lead row deleted (merchant cleanup, GDPR) | HMAC verifies but FK lookup fails. Treated as expired, form re-shown, new Lead on submit. |
| Visitor identifies for merchant A, then merchant A deactivates share link | `/identify/` returns 404. Cookie isn't cleared. Future links from merchant A still skip the form (cookie still matches merchant). |
| Visitor reloads/navigates back after submit | Cookie set → instant redirect. Back button hits the redirecting interstitial → also redirects. Can't get back to form. |
| Same number on two merchants | Two Lead rows. Cookie payload includes merchant_id, each merchant's cookie matches independently. |

### Abuse vectors

| Vector | Mitigation |
|---|---|
| Spam click events on `/identify/` | Rate-limit 10/min per IP and 5/min per (IP, short_id). `django-ratelimit` in-memory backend for v1; Redis-backed in v2. |
| Brute-force enumeration of `short_id` | `token_urlsafe(6)` = ~2.8×10¹⁴ space. Backstop: 60/min per IP on `/resolve/`. |
| Slug squatting | "Retired stays reserved" rule + reserved-word list. |
| Cookie tampering | HMAC verification with `LEAD_TOKEN_SECRET` (rotatable env var). |
| Cross-merchant cookie reuse | Token payload includes `merchant_id`, backend cross-checks against share link's merchant. |

## Migration & rollout

1. Run migration: creates the four new tables; backfills `StoreSlugAlias` for every existing `BusinessDetails` with `is_current=true`; creates `ShareLink` for every existing `Product` (kind=product) and every `BusinessDetails` (kind=store).
2. Deploy backend with new endpoints. Old frontend continues to work — no breaking changes.
3. Deploy frontend with new pages + share panels. All additive.
4. In-app banner on `/manage`: "Your store has share links now — see Manage → Store Link."
5. Monitor: lead growth rate, identify→view ratio, slug change frequency, `/resolve/` p99.

Kill switch: single `SHARE_LINKS_ENABLED` env var gates the `/api/share-links/*` endpoints. Existing `/store/<slug>/` works either way.

## Testing strategy

### Backend (Django + pytest)

`accounts/tests.py` is currently empty — the first real tests live here.

- **Unit**: lead-token sign/verify roundtrip, slug validator + reserved-word list, phone normalization.
- **Model**: `StoreSlugAlias` uniqueness, `ShareLink.short_id` collision retry, exactly-one-current-per-merchant invariant.
- **API**:
  - `/resolve/` happy path + 404 on inactive.
  - `/identify/` no-cookie → creates Lead + ClickEvent(submit); with valid cookie → updates last_seen + ClickEvent(view).
  - `/identify/` with cross-merchant cookie → ignored, treated as no-cookie.
  - `PATCH /slug/`: success, duplicate, reserved, format invalid, retired-alias collision.
  - `/store/<slug>/` current vs historical → 200 vs 301.
  - Leads listing: pagination, sort, search filter.
- **Migration tests**: backfill creates exactly one `ShareLink` per existing product + exactly one `StoreSlugAlias` per `BusinessDetails`.

### Frontend

No test infra exists. For v1: rely on `tsc` + `eslint` + `npm run build` (all already enforced after bug #6 fix). Add a manual smoke checklist as ship-blocker in the PR description:

1. Open `/p/<known short_id>` in incognito → see interstitial → submit WA → land on product.
2. Reload → land on product directly (cookie skip).
3. Open same URL in a second incognito → form again (no cookie).
4. `curl -H 'User-Agent: WhatsApp/2' http://localhost:3000/p/<id>` → response contains `og:image` + `og:title`.
5. Merchant dashboard `/leads` → new lead row appears with the WA number.
6. "Chat on WhatsApp" → `wa.me/+234...` opens.
7. `/manage` Store Link tab → "Edit slug" → change → old `/store/<old>/` 301s in browser.
8. Setup wizard step 2 → type business name → slug auto-fills → backspace + retype → availability check fires.
9. Try reserved word ("admin") → red error.
10. Type duplicate slug → suggestions appear.

## Env vars

Added to `.env.example` in both repos.

### Backend (`Buzzmart_backend/.env.example`)

```
LEAD_TOKEN_SECRET=<generate with: python -c 'import secrets; print(secrets.token_urlsafe(32))'>
SHARE_LINKS_ENABLED=true
```

### Frontend (`preorder/.env.example`)

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Used for OG `og:url` construction and the share message template.

## Future work (and the design choices today that keep these cheap)

| Feature | Trigger | Why v1 doesn't paint us into a corner |
|---|---|---|
| OTP verification of WA number | Fake-number rate > 5% of leads | `Lead` already has `wa_number` as the unique key; add a `verified_at` column without migration drama. |
| Multi-active aliases (parallel campaign URLs) | Merchants asking | `StoreSlugAlias` is already a many-to-one with `business_details`; change "exactly one is_current per merchant" to "N current per merchant" — one column rename. |
| WhatsApp Business API broadcast to leads | Feature parity / monetization | `Lead` already has the normalized WA number. New `Broadcast` model, new template-message review flow. Doesn't touch any existing endpoint. |
| Custom share-message template per merchant | Merchant branding requests | Hardcoded template is in one frontend constant; replace with a string field on `BusinessDetails`. |
| Per-channel attribution (Status vs Group) | Analytics need | Add a third dimension to `ClickEvent` (e.g. `referrer_hint`) OR add the v1-deferred Approach B "one link per share" model. |
| Programmatic posting to Status / groups | Never (WhatsApp API limitation) | Document as impossible. Don't promise. |

## Open questions for review

None at design lock. Implementation will surface its own; those go into the writing-plans output, not back here.
