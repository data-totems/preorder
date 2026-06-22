# Buzzmart — Test Guide for CEO

A 15-minute walk-through covering the three sides of the product.

---

## Quick facts

| What | Where |
| --- | --- |
| Customer + merchant frontend | https://preorder-three.vercel.app |
| Backend API | https://buzzmart-backend-yp2r.onrender.com |
| Backend admin | https://buzzmart-backend-yp2r.onrender.com/back-office-7K9/ |
| API explorer (Swagger) | https://buzzmart-backend-yp2r.onrender.com/api/docs/ |

> **Cold-start note:** the backend sleeps after ~15 min of no traffic. The
> first request after a sleep takes ~30 seconds while it wakes up. Warm
> it by visiting `https://buzzmart-backend-yp2r.onrender.com/api/schema/`
> in a tab before starting the demo.

---

## Credentials

| Role | Email | Password | Where to use |
| --- | --- | --- | --- |
| **Merchant** (Founder Buzz Store) | `founder@buzzmart.test` | `BuzzLive2026!` | https://preorder-three.vercel.app/login |
| **Admin** (Django staff) | `admin@buzzmart.test` | `AdminProd2026!` | https://buzzmart-backend-yp2r.onrender.com/back-office-7K9/ |
| **Customer** | — | — | Browse anonymously, identify yourself by phone when prompted |

---

## Test 1 — Merchant side (~5 min)

The merchant is the small-business owner using Buzzmart to sell on WhatsApp.

1. Open https://preorder-three.vercel.app/login
2. Sign in with `founder@buzzmart.test` / `BuzzLive2026!`
3. You land on the **Dashboard** — see the metric cards (Orders / Leads / Clicks), recent activity feed, top products on the right.
4. Click **Marketplace** in the sidebar — five pre-seeded products with images.
5. Click into any product (e.g. *Wireless Earbuds Pro*):
   - At the top, a **Share** panel — the merchant's WhatsApp-ready short link.
   - **Copy** the link (it looks like `https://preorder-three.vercel.app/p/<id>`) — you'll use it in Test 2.
6. Click **Orders** in the sidebar — empty for now, fills as customers order.
7. Click **Leads** — empty for now, fills when customers identify themselves.
8. Click **Settings** (bottom of sidebar) → **Dispatch** — empty list; merchant can add delivery riders here (or directly when shipping an order).
9. Click the user avatar (top-left) → **Log out** to confirm sign-out works.

Sign back in for the next step.

---

## Test 2 — Customer side (~5 min)

The customer is anyone who taps a WhatsApp share link.

1. Open a **new incognito / private window** (so you're anonymous — no leftover login).
2. Paste the share link you copied in Test 1 — e.g. `https://preorder-three.vercel.app/p/<id>`.
3. You'll see a **product card with an identity capture form**:
   - Phone number — enter any number for testing, e.g. `+2348099887766`
   - Optional name — `Tester One`
   - Hit **Continue →**
4. You land on the **product page** as a customer. The order form is on the right (desktop) or behind a sticky "Place order" button (mobile).
5. Fill the order:
   - Name: `Tester One`
   - WhatsApp: `+2348099887766`
   - Address: `1 Demo Street, Lagos`
   - Delivery: `Delivery`
   - Quantity: `1`
   - **Place order →** → green toast confirms.
6. (Optional) Click the merchant pill ("by Founder Buzz Store") at the top → you land on the **store page** showing all 5 products. Customers can browse the rest of the merchant's catalog.

---

## Test 3 — Merchant fulfills the order (~3 min)

Switch back to your merchant window (the one logged in as `founder@buzzmart.test`).

1. Click **Orders** in the sidebar.
2. The order from "Tester One" is in the **Incoming** tab with **Accept** + **Decline** buttons.
3. Click **Accept** → the order jumps to the **Accepted** tab in real-time (no page reload).
4. Open the **Accepted** tab → click **Ship** on the row.
5. No riders exist yet — the Ship dialog flips to a **quick add rider** form. Fill:
   - Name: `Demo Rider`
   - Phone: `+2348012345678`
   - Vehicle: Motorcycle (or Car)
   - Plate: `AKD123XY`
   - **Save rider** → it's selected automatically → **Confirm ship**.
6. The order moves to the **Shipped** tab. Click **More** on the row to see the assigned rider.
7. Click **Leads** in the sidebar — "Tester One" is now listed with:
   - **NEW** badge (since they identified themselves in the last 24 h)
   - Click count, order count chip
   - **Chat** button — opens a WhatsApp conversation with the customer (`wa.me/...`)

---

## Test 4 — Admin side (~3 min)

The admin (Django admin) is your back-office view of every merchant, every customer, every order in the system.

1. Open https://buzzmart-backend-yp2r.onrender.com/back-office-7K9/
2. Sign in with `admin@buzzmart.test` / `AdminProd2026!`
3. You land on the **admin dashboard** — KPI cards (Merchants / Active products / Leads / Clicks-7d), order status breakdown, recent orders + recent leads panels.
4. Sidebar groups (left nav):
   - **Operations** — Orders, Leads, Products, Share links, Click events
   - **Merchants** — Users, Business details, Profiles, Bank details, WhatsApp
   - **Logistics** — Dispatchers, Notifications, Store slug history
5. Click each list to inspect rows. Filter by status / date / type from the right-side filter panel. Search by email / name / phone / slug from the search box.
6. Click into **Leads** to see the customer you created in Test 2.
7. Click into **Orders** to see the order you placed — note the assigned rider in the detail page.
8. Sign out via the top-right.

> **Security note:** the admin URL is `/back-office-7K9/` (not `/admin/`).
> Plain `/admin/` returns 404, which keeps scanners away from the login form.

---

## What to take away

- **End-to-end loop works in real-time** — customer order → merchant accept → ship with rider → all without page reloads.
- **Every customer who clicks a share link is captured as a Lead** — even if they don't place an order. The merchant can WhatsApp them directly via the Chat button.
- **WhatsApp-native commerce** — customers never install an app. Merchants share product or store links on WhatsApp, customers tap, order.
- **Admin oversight is complete** — every entity is visible and filterable in the Django admin.

---

## One-time setup (for the person preparing the demo, not the CEO)

The admin account is now created automatically on every backend deploy via
the `bootstrap_admin` management command in the build pipeline — no manual
step needed. Default credentials:

```
ADMIN_EMAIL = admin@buzzmart.test
ADMIN_PASSWORD = AdminProd2026!
```

To rotate, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars on Render. The
next deploy resets the admin to those credentials.

### Security env vars set on Render

| Key | Value | Purpose |
| --- | --- | --- |
| `ADMIN_URL_PATH` | `back-office-7K9/` | Hides the admin login from `/admin/` scanners |
| `CORS_ALLOWED_ORIGINS` | `https://preorder-three.vercel.app` | API only accepts requests from the production frontend |
| `FRONTEND_URL` | `https://preorder-three.vercel.app` | Used in share-link redirects and OG previews |

Plus rate limits (no env needed — baked into the code):

- `POST /api/accounts/auth/login/` — **10 attempts / minute / IP**
- `POST /api/accounts/auth/register/` — **5 attempts / minute / IP**
- Share-link `/resolve/` and `/identify/` — pre-existing rate limits (10/min)
