# Visual Redesign + Design System

**Date:** 2026-06-22
**Scope:** Full visual reskin of the `preorder` Next.js app — merchant dashboard, auth/setup, customer storefront, share-link landings.
**Branches:** preorder repo only — no backend changes.

## Why

The existing UI uses muted greens (`#27BA5F`), a flat black sidebar, and ad-hoc styling across pages. The merchant has flagged it as "going against good design practice" and asked for a redesign that's *modern, sharp, inspiring, and befitting a storefront*. The interface should look like a place merchants are proud to send customers to.

This work is also an opportunity to lift the bracketed hex values littered throughout the codebase into proper design tokens, so future changes stay disciplined.

## Goals

- **Bold & confident** visual personality (Glossier / Aimé Leon Dore as reference). Type and color carry the brand, products are the heroes.
- **Coherent design system** — tokens, typography scale, spacing/radius/shadow scales — that every page consumes through Tailwind config + shadcn primitives.
- **Refined deeper green** palette that retains continuity with the existing `#27BA5F` (as an accent) while reading more premium.
- **Heavy geometric sans** (Inter) typography that does most of the personality work.
- **Subtle motion only** — transitions, hovers, loading states. No scroll-triggered animation, no decorative motion.
- **Light mode only** for v1; CSS variable structure supports a future dark mode without rewriting components.
- **Mobile-first chrome** — the current code has no mobile-friendly navigation. Add a bottom nav for merchants on phones.

## Out of scope

- Backend changes (no new endpoints, no schema work)
- Dark mode (CSS variable structure leaves room; no implementation)
- New features (this is a re-skin, not a re-spec)
- Internationalization / RTL
- Accessibility beyond the existing shadcn primitives' guarantees + the universal focus-ring + label-association rules added during the share-links work
- A native mobile app — web-only

## Design language decisions (locked)

| Decision | Choice |
|---|---|
| Personality | Bold & confident e-commerce (Glossier / Aimé Leon Dore reference) |
| Color | Refined deeper green: forest-700 primary, forest-400 accent, warm cream neutrals, near-black ink |
| Typography | One family — Inter, heavy geometric sans, weights doing the personality work |
| Motion | Subtle polish only (functional transitions, hovers, loading states) |
| Light/dark | Light only for v1; CSS variable structure ready for dark later |
| Phasing | Foundation first, then page-by-page sweep, in six phases |

---

## Section 1 — Tokens

### Color palette

**Primary — refined deeper green:**

```
forest-900   #0A2E1B   Deepest. Sidebar bg, text on light, eyebrow accent
forest-700   #0F4D2C   Primary CTA bg, deep brand surfaces
forest-500   #1A6B3F   Default brand "primary" usable for buttons
forest-400   #27BA5F   Accent / highlight. Keeps brand continuity
forest-100   #E8F4ED   Success badge bg, "available" state tint
forest-50    #F4FAF6   Subtle section wash
```

**Neutrals — warm ink, not cold gray:**

```
ink-900   #0A0A0B   Headings, primary text
ink-700   #1F1F22   Body text
ink-500   #5C5C66   Muted text, secondary copy
ink-300   #A8A8B0   Placeholder, disabled
ink-200   #D4D4D9   Borders, dividers
ink-100   #EDEDF0   Input bg, hairline backgrounds
ink-50    #F7F7F8   Hover surfaces
paper     #FAFAF8   Page bg — warm cream, not stark white
```

**Semantic:**

```
success   #27BA5F   (forest-400)
danger    #D63B3B   warmer than Tailwind red-500
warning   #E89A2C   amber, not yellow
info      #3B7BD6   system blue, used sparingly
```

### Shadcn CSS variable mapping (in `app/globals.css`)

```
--background:           paper          --foreground:          ink-900
--card:                 #FFFFFF        --card-foreground:     ink-900
--popover:              #FFFFFF        --popover-foreground:  ink-900
--primary:              forest-700     --primary-foreground:  #FFFFFF
--secondary:            ink-100        --secondary-foreground: ink-900
--muted:                ink-100        --muted-foreground:    ink-500
--accent:               forest-400     --accent-foreground:   forest-900
--destructive:          danger         --destructive-foreground: #FFFFFF
--border:               ink-200
--input:                ink-100
--ring:                 forest-500
--radius:               12px           (md, used as shadcn's --radius)
```

### Typography — Inter

Single family. Weights carry the personality. Loaded via `next/font/google` in `app/layout.tsx`.

| Token | Size / Line | Weight | Tracking | Use |
|---|---|---|---|---|
| `display-2xl` | 56 / 64 | 700 | -2% | Hero pages only |
| `display-xl` | 44 / 52 | 700 | -2% | Hero page titles |
| `display-lg` | 36 / 44 | 700 | -1% | Page headers (dashboard, marketplace) |
| `heading-1` | 28 / 36 | 700 | -1% | Section heroes inside pages |
| `heading-2` | 22 / 30 | 700 | -0.5% | Modal titles, card titles |
| `heading-3` | 18 / 26 | 600 | normal | Sub-section, product card name |
| `body-lg` | 17 / 26 | 400 | normal | Generous body, hero descriptions |
| `body` | 15 / 24 | 400 | normal | Default body |
| `body-sm` | 13 / 20 | 400 | normal | Secondary copy, helper text |
| `caption` | 12 / 16 | 500 | +2% | Form labels, metadata |
| `eyebrow` | 11 / 14 | 700 | +8% UPPERCASE | Section labels (`SHARE LINK`, `RECENT CLICKS`) |

Weights loaded: 400, 500, 600, 700, 800.

### Spacing, radius, shadow, motion

```
RADIUS
xs    4px           Pills, small chips
sm    8px           Subtle compact (sidebar items, small buttons)
md    12px          Default — inputs, buttons, internal cards
lg    16px          Cards
xl    24px          Modals, sheets outer
pill  9999px        Badges, status indicators, action pills

SHADOWS (forest-tinted)
xs    0 1px 2px 0 rgba(10,46,27,0.04)
sm    0 1px 3px 0 rgba(10,46,27,0.05), 0 1px 2px -1px rgba(10,46,27,0.04)
md    0 4px 6px -1px rgba(10,46,27,0.06), 0 2px 4px -2px rgba(10,46,27,0.04)
lg    0 10px 15px -3px rgba(10,46,27,0.07), 0 4px 6px -4px rgba(10,46,27,0.05)
xl    0 20px 25px -5px rgba(10,46,27,0.08), 0 8px 10px -6px rgba(10,46,27,0.05)

MOTION
fast      150ms     button press, hover transitions, color changes
medium    250ms     drawer slide, modal fade, tab switch, toast in/out
slow      400ms     page transition, large layout shifts
ease      cubic-bezier(0.4, 0, 0.2, 1)            primary easing
spring    cubic-bezier(0.34, 1.56, 0.64, 1)        subtle overshoot for success
```

Page background: `paper` (#FAFAF8). Sidebar: `forest-900` (#0A2E1B). Shadows use forest-tint for warmth, not pure black.

---

## Section 2 — Component primitives

All files under `components/ui/`. Behavior preserved; visual language replaced.

### Button (`button.tsx`)

| Variant | Bg | Text | Border |
|---|---|---|---|
| `default` (primary CTA) | `forest-700` | white | none |
| `secondary` | `ink-100` | `ink-900` | none |
| `outline` | transparent | `ink-900` | 1px `ink-200` |
| `ghost` | transparent | `ink-900` | none |
| `destructive` | `danger` | white | none |
| `link` | none | `forest-500`, underline on hover | none |

- Sizes: `sm` 36px, `md` 44px (new default — bigger, more confident than shadcn out-of-box), `lg` 56px
- Radius: `md` (12px). Font: Inter weight 600
- Hover: `default` shifts to `forest-500`, others tint surface
- Press: `active:scale-[0.98]` on every variant
- Disabled: `opacity-50 cursor-not-allowed`
- Loading: spinner replaces label, button stays disabled, no width jump

### Input + Textarea

- Default: `bg-ink-100`, no border, radius `md`, height `h-11`
- Focus: `bg-white`, ring `forest-500` 2px with 2px offset, no shadow
- Placeholder: `ink-300`
- Disabled: `bg-ink-100 opacity-60 cursor-not-allowed`
- Error: ring `danger` 2px when `aria-invalid="true"`
- Textarea: `min-h-32`, otherwise identical
- Keeps the `forwardRef` from earlier bug-fix work

### Label

- Uses `caption` token (12/16 weight 500, tracking +2%)
- Color `ink-700`, no uppercase
- Plus a new `<Eyebrow>` component for section headings — 11/14 weight 700 tracking +8% UPPERCASE `ink-500`

### Card (`card.tsx`)

```
<Card>                       bg-white, border-ink-200, shadow-xs, rounded-lg (16px), p-6
<Card variant="elevated">    shadow-md, no border
<Card variant="compact">     p-4
<Card variant="flat">        shadow-flat, bg-paper, border-ink-200
```

### Dialog (`dialog.tsx`)

- Overlay: `bg-ink-900/40 backdrop-blur-sm`
- Content: `bg-white rounded-xl (24px) shadow-xl border-ink-200`, max-w by content, p-6
- Title: `heading-2`
- Description: `body-sm text-ink-500`
- Footer: `gap-3 justify-end`
- Close button: top-right 16x16 hit area, hover bg `ink-100` radius `sm`
- Transition: `medium` (250ms) fade + scale 0.96 → 1

### Sheet (`sheet.tsx`)

- Slide from right by default, radius `xl` on the inner edge
- `shadow-xl`, header `pb-4 border-b border-ink-200`
- Title: `heading-2`, content padding `p-6`
- Transition: `medium`

### Select + Dropdown Menu

- Trigger: matches Input — h-11, `bg-ink-100`, radius `md`, focus ring `forest-500`
- Content: Card-styled, max-h `[--radix-select-content-available-height]`, scroll
- Item hover: `bg-ink-100`
- Item selected: `bg-forest-100 text-forest-900` with check icon
- Chevron: `text-ink-500`

### Tabs — two variants

**Pill variant** (manage page tabs):
- TabsList: `bg-ink-100 rounded-md p-1`
- TabsTrigger: `rounded-sm`; data-state-active: `bg-white shadow-xs text-ink-900` weight 600

**Underline variant** (page-level sections):
- TabsList: `border-b border-ink-200`
- TabsTrigger: pb-3; data-state-active: `border-b-2 border-forest-500 text-ink-900` weight 700
- Inactive: `text-ink-500`, hover `text-ink-900`

### Badge (new — `components/ui/badge.tsx`)

| Variant | Bg | Text |
|---|---|---|
| `default` | `ink-100` | `ink-700` |
| `success` | `forest-100` | `forest-900` |
| `danger` | `danger/10` | `danger` |
| `warning` | `warning/10` | `warning` |
| `info` | `info/10` | `info` |
| `accent` | `forest-400` | white |

All: radius `pill`, px-3 py-1, font weight 600 size `caption`.

### Toast (sonner — `components/ui/sonner.tsx`)

- Base: white, border `ink-200`, shadow `lg`, radius `lg`, p-4
- Success: `bg-forest-100`, 4px left border `forest-400`, check icon `forest-700`
- Danger: `bg-danger/5`, 4px left border `danger`, x icon `danger`
- Animate in: `medium` slide + fade
- Auto-dismiss: 4s success, 6s danger

### Form

Structural wrappers stay. Re-skin internals:
- `FormLabel`: caption style (12/16 weight 500), color `ink-700`
- `FormMessage`: `body-sm` weight 500 `text-danger`
- `FormDescription`: `body-sm` `text-ink-500`
- Spacing: gap-2 inside item; gap-6 between items

### Switch + Checkbox

**Switch:**
- Track: h-6 w-10 rounded-full
- Off: `bg-ink-200`, On: `bg-forest-500`
- Thumb: bg-white shadow-sm, `fast` transition

**Checkbox:**
- 18×18, radius `sm`, border `ink-300`
- Checked: `bg-forest-500 text-white border-forest-500`
- Indeterminate: dash icon

### Skeleton (new — `components/ui/skeleton.tsx`)

`bg-ink-100 animate-pulse rounded-md`. Used everywhere data loads.

### Universal interaction rules

- Every interactive element: `transition-colors duration-150 ease`
- Every button-like surface: `active:scale-[0.98]` (button, clickable badge, sidebar item)
- Focus visible: 2px ring `forest-500` with 2px offset on every interactive component (a11y baseline)
- Disabled: 60% opacity, `cursor-not-allowed`

---

## Section 3 — Page chrome

### Desktop sidebar (`components/shared/Sidebar.tsx`)

```
Width:    256px (was 230px)
Bg:       forest-900 (warm green-tinted dark)
Padding:  py-6 px-3
Layout:   flex flex-col, full height
```

**Top block — brand + user**
- Wordmark "Buzzmart" h-8, weight 800, letterspacing -1%, color `forest-50`
- Below: user pill `rounded-md p-3 bg-white/5`
  - Avatar 36×36 rounded-pill `bg-forest-400` (monogram fallback)
  - Name weight 600 `ink-100` + business name `body-sm text-ink-300` truncated
  - Small "View public store →" link in `forest-400 caption`

**Nav list — each item**
- `h-11 rounded-md px-3 flex items-center gap-3`
- Icon 20×20 + label `body` weight 500
- Inactive: `text-ink-200` icon `text-ink-400`
- Hover: `bg-white/5 text-white` (`fast` transition)
- Active: `bg-forest-700 text-white` icon `text-forest-400` weight 600
- **Active indicator**: 3px tall `forest-400` rounded pill anchored to the left edge

**Leads badge:** `<Badge variant="accent">` — `bg-forest-400 text-white` pill weight 600, `ml-auto`.

**Bottom — anchored**
- Divider `border-t border-white/10 mt-auto`
- Log out button — outline variant inverted: `border-white/10 text-ink-200 hover:bg-white/5 hover:text-white`

### Mobile bottom nav (NEW — `components/shared/MobileNav.tsx`)

```
Position:   fixed bottom-0 inset-x-0 z-30
Height:     h-16 + env(safe-area-inset-bottom)
Bg:         white, border-t border-ink-200, shadow-lg upward
Layout:     grid grid-cols-5
```

Per item:
- `flex flex-col items-center justify-center gap-1 py-2`
- Icon 22×22, label `caption` weight 500
- Inactive: `text-ink-500`
- Active: `text-forest-700` icon + label weight 600
- Leads badge: small `forest-400` 8×8 dot anchored top-right of the icon when count > 0
- Tap: `active:bg-ink-50`

Sidebar wraps `hidden md:flex`; MobileNav wraps `md:hidden`. Main content gets `pb-20 md:pb-0` to clear the bottom nav.

### Top nav (`components/shared/TopNav.tsx`)

Used by auth, setup, and customer storefront. Sidebar isn't appropriate for those contexts.

```
Height:   64px desktop, 56px mobile
Bg:       paper with border-b border-ink-200
Sticky:   sticky top-0 z-40 backdrop-blur-md bg-paper/80
```

Three layouts (`variant` prop):

**Auth (`variant="minimal"`):**
- Left: Buzzmart wordmark → `/`
- Right: contextual switch link ("New here? Create account" → `/register` from `/login`)

**Storefront (`variant="storefront"`):**
- Left: Buzzmart wordmark
- Center (listing page only): search input small variant
- Right: "Are you a merchant? Sign in →" link

**Share-link interstitial (`variant="silent"`):**
- Left: Buzzmart wordmark only
- Right: nothing (maximize focus on the form)

### Page header (NEW shared — `components/shared/PageHeader.tsx`)

Standardizes the per-page heading block.

```tsx
<PageHeader
  eyebrow="MARKETPLACE"
  title="Your products"
  description="42 items · 6 archived"
  actions={<Button>Add product</Button>}
  tabs={<Tabs ... />}  // optional underline-variant slot
/>
```

Renders:
- `pt-8 pb-6 px-6 md:px-10`, optional `border-b border-ink-200`
- Eyebrow line (uppercase, `ink-500`, tracking +8%, weight 700)
- Title + actions row (`display-lg` + button) — flex justify-between, items-end
- Description (`body-lg ink-500`, optional)
- Tabs slot directly below

### Empty state (NEW shared — `components/shared/EmptyState.tsx`)

```tsx
<EmptyState
  icon={<Users />}
  title="No leads yet"
  description="Share your store or product links on WhatsApp to start collecting leads."
  action={<Button onClick={copy}>Copy store link</Button>}
/>
```

- `py-20 flex flex-col items-center text-center max-w-md mx-auto`
- Icon 48×48 in `bg-forest-50 rounded-full p-3 text-forest-700`
- Title `heading-2 ink-900`
- Description `body-lg ink-500`
- Action button

Used by: leads inbox (empty), orders incoming (no orders), marketplace (no products), share-stats recent-clicks (no clicks).

### Dashboard layout shell (`app/(dashboard)/layout.tsx`)

```
min-h-screen flex bg-paper
├── <Sidebar />         (hidden md:flex)
└── <main className="flex-1 min-w-0 pb-20 md:pb-0">
    └── content (max-w-7xl mx-auto, px-6 md:px-10 py-8)
└── <MobileNav />       (md:hidden)
```

---

## Section 4 — Per-page redesigns

Two buckets:
- **Hero pages** — real layout work
- **Internal pages** — tokens + chrome inherit; targeted polish

### Hero pages

#### Auth (`/login`, `/register`, `/forgot-password`)

Split-screen on `lg+`, single column below.

```
┌──────────────────────────────┬───────────────────────────────┐
│  LEFT (form, 480px max)      │  RIGHT (bg-forest-700)        │
│  px-10 py-16                 │  hidden lg:flex               │
│                              │                               │
│  Eyebrow: SIGN IN            │  Eyebrow: BUZZMART (forest-50)│
│  display-xl: Welcome back    │  display-2xl white:           │
│  body-lg ink-500: Sign in to │  "Sell more, stress less."    │
│  manage your store and       │                               │
│  respond to your customers.  │  body-lg forest-50:           │
│                              │  "Shareable storefronts, lead │
│  [Form: email, password,     │   capture, orders via         │
│   forgot link, button-lg]    │   WhatsApp."                  │
│                              │                               │
│  ─────  or  ─────            │  [Optional editorial image    │
│  New here? [Create account]  │   or subtle gradient mesh]    │
└──────────────────────────────┴───────────────────────────────┘
```

- Right panel: solid `forest-700` or subtle `forest-700 → forest-900` diagonal gradient
- Mobile: just the left panel, with a small marketing teaser above the form (`Buzzmart` wordmark + one-liner)

Same pattern for `/register` (different copy) and `/forgot-password` (single email field).

#### Setup wizard (`/setup`)

```
TopNav (minimal — wordmark, no nav)
──────────────────────────────────────
[Progress bar — 3 dots + connecting line, current step name shown
 inline]   ●━━━●━━━○   Personal · Business · Bank
──────────────────────────────────────
[Container max-w-2xl mx-auto py-12 px-6]

  Eyebrow: STEP 1 OF 3
  display-lg: Tell us about you
  body-lg ink-500: We use this to set up your merchant account.

  Cards (each variant="flat"):
    ┌──────────────────────────────────────┐
    │ Eyebrow: PERSONAL DETAILS            │
    │ [full name, username, phone, address]│
    └──────────────────────────────────────┘

    ┌──────────────────────────────────────┐
    │ Eyebrow: PROFILE PICTURE             │
    │ [upload zone]                        │
    └──────────────────────────────────────┘

[Sticky bottom action bar]
border-t border-ink-200 bg-paper/95 backdrop-blur
  [Back]                                     [Continue →]
```

Step 2 (Business): single "STORE IDENTITY" card containing business name + slug input + business email + description.

Step 3 (Bank): single "BANK DETAILS" card containing bank select + account number + verified-account preview.

Progress bar: 3 dots connected by 2px line. Current dot solid `forest-700` with ring, past dots filled `forest-400`, future dots outline `ink-200`. Step names `caption` weight 600 inline at each dot.

#### Merchant dashboard home (`/`)

```
PageHeader: 
  eyebrow:     GOOD MORNING
  title:       "Aunty Bola" (first name from user.fullName)
  description: "Here's what's happening with your store today."
  actions:     [+ New product]

Stat row — 4 stat cards (md:grid-cols-2, lg:grid-cols-4, gap-4)
  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
  │ EYEBROW    │ │ ORDERS     │ │ LEADS      │ │ SHARE      │
  │ display-lg │ │ display-lg │ │ display-lg │ │ display-lg │
  │ 47         │ │ 12         │ │ 47         │ │ 6          │
  │ pending    │ │ pending    │ │ this week  │ │ active     │
  │ ↑ 12% wk   │ │ Tap to view│ │ ↑ 8 new    │ │            │
  └────────────┘ └────────────┘ └────────────┘ └────────────┘

Two-column (lg:grid-cols-3, gap-6):
  RECENT ACTIVITY (col-span-2)         TOP PRODUCTS (col-span-1)
  ┌──────────────────────────────┐    ┌────────────────────────┐
  │ Eyebrow: RECENT ACTIVITY     │    │ Eyebrow: TOP PRODUCTS  │
  │                              │    │                        │
  │ [icon] Adekunle ordered…     │    │ [thumb] XIAOMI Redmi   │
  │ [icon] New lead +234…        │    │ 47 clicks · 4 orders   │
  │ [icon] Shipped to Lagos      │    │                        │
  │ ...                          │    │ [thumb] Samsung A15    │
  │                              │    │ ...                    │
  │ [See all activity →]         │    │ [See all products →]   │
  └──────────────────────────────┘    └────────────────────────┘
```

- Stat cards: `Card variant="elevated"`. Big number `display-lg` weight 700 `ink-900`. Sub-line `body-sm ink-500`. Optional delta uses `caption` weight 600 — `forest-500` (up) or `danger` (down).
- Activity feed: single chronological list combining orders + leads + clicks. Each item: icon (status-colored), one-line title, relative time `caption ink-500`. Click → relevant detail.
- Top products: small ranked list of products sorted by share-stats click count. Each row: small thumb + name + click/order counts.
- Mobile: stat row stays grid (2 columns), activity stacks above products.

Note: the trend deltas ("↑ 12% from last week") need backend support that doesn't exist yet. v1 ships without them — show just counts. Tracked as Future Work.

#### Customer storefront listing (`/store`)

```
TopNav (storefront variant — search center, "Sign in" right)
──────────────────────────────────────

Hero band [bg-paper py-16 px-6, max-w-7xl mx-auto]
  Eyebrow: BUZZMART
  display-2xl: "Discover stores you'll love."
  body-lg ink-500 max-w-xl: "Find products from merchants you can
  talk to directly. Every order is one tap to a real human on
  WhatsApp."

  [Search input — lg size, full-width up to max-w-xl]
  
  Quick chips below (horizontal scroll on mobile):
    [All] [Phones] [Tablets] [Laptops] [Fashion] [Beauty] ...

Section: TRENDING NOW
  Eyebrow + display-lg "Trending now" — actions:"See all →"
  Grid: 2 cols mobile, 3 md, 4 lg, gap-6
  ProductCard per item

Section: NEW ARRIVALS
  (same pattern)

Section: BROWSE BY CATEGORY
  Tile grid — 2 cols mobile, 3+ desktop, gap-4
  Each tile: gradient bg `forest-700 → forest-900`, category name
  `display-lg white`, count `body-sm forest-50/70`, h-40+
```

**Product card** (`components/shared/ProductCard.tsx`):
- `Card variant="flat"` (subtle bg, no shadow)
- Square image, full-bleed (radius on outer card only)
- Below image: name `heading-3` weight 600 line-clamp-2, price `heading-2` weight 700 `forest-700`, store name link `caption` weight 500 `ink-500`
- Hover: image scales 1.02 over 250ms, card shadow elevates to `md`

#### Customer merchant storefront (`/store/[storeId]`)

```
TopNav (storefront variant)
──────────────────────────────────────

Merchant hero [py-12 px-6 max-w-7xl mx-auto]
  Two-col on md+:
    LEFT (2/3):
      Eyebrow: MERCHANT
      display-xl: Aunty Bola's Tech Shop
      body-lg ink-500: business_description (line-clamp-3)
      
      Metadata chips row:
        <Badge>✓ Verified</Badge>
        <Badge>📍 Ibadan</Badge>
        <Badge>⭐ 4.8 (123 orders)</Badge>
      
      Actions row:
        [Chat on WhatsApp — default lg]
        [Copy store link — outline lg]
    
    RIGHT (1/3):
      Merchant card with display_picture (aspect-square cover)
      Below: store URL inline-code, total products, member since

Filter bar [sticky top-16 after scroll, bg-paper/95 backdrop-blur]
  border-b border-ink-200, py-4 px-6
  Search input + category chips + sort dropdown

Product grid (same ProductCard pattern as /store listing)
```

#### Share-link interstitial (`/p/[shortId]` and `/s/[shortId]`)

The interstitial we built in the share-links work gets a more confident treatment.

```
min-h-screen bg-paper flex items-center justify-center px-4 py-8

TopNav (silent variant — wordmark only, top-left, fixed)

Container max-w-md w-full:

  Hero card [Card shadow-lg overflow-hidden rounded-xl]
    [Product image — full bleed, aspect-[4/3], object-cover]
    
    [Content p-6]
      Eyebrow: PRODUCT
      heading-2: product.name
      
      Price row:
        display-lg weight 700 forest-700: ₦25,000
      
      Merchant line:
        Avatar 24×24 + "by Aunty Bola's Tech Shop" body-sm ink-500
      
      Divider border-ink-200
      
      Eyebrow: BEFORE YOU SEE THE DETAILS
      body-sm ink-500: "We share your number with this merchant
      so they can answer questions and confirm your order."
      
      [Phone input — Input lg variant, NG flag prefix]
      [Name input — Input lg variant, optional label]
      
      [Continue → Button default lg, full-width]
      
      Privacy footer:
      caption ink-500: 🔒 Your number stays with this merchant only.
      Not shared with Buzzmart marketing.
```

Store variant (`/s/`): shows store name + display_picture (large square) + business_description instead of product image and price. Same form below.

ShareLinkNotFound page: uses new EmptyState component with a sensible "no longer active" message and link to `/store`.

### Internal pages (tokens + polish only)

- **`/marketplace`**: PageHeader + new ProductCard. Stats row at top showing product count + archived count (small).
- **`/marketplace/product/[id]`**: PageHeader + cleaner image grid + new SharePanel inherits tokens. Update Product dialog uses new Dialog primitive automatically.
- **`/orders`**: Top tabs (underline variant) for incoming/accepted/shipped. Date groupings become section headers with `eyebrow`. Order rows become Cards with consistent action buttons.
- **`/leads`**: EmptyState component when empty. Lead rows become Cards with Badge variants for status. Drawer uses new Sheet primitive.
- **`/manage`**: Pill tabs (current behavior preserved). Each tab body inherits Card / Input / Button changes.

### Animation moments

- Product card hover scale (1 → 1.02 over 250ms `ease`)
- Button press scale-down (1 → 0.98 instant via `active:`)
- Tab switch fade between contents (medium)
- Toast slide + fade (medium)
- Modal/sheet scale + fade (medium)
- Skeleton pulse (slow, infinite)
- **Dashboard home only:** stat number counts up on first load (medium ease-out)

### UX call-out: order form

The customer order page (`/store/product/[id]`) currently has a heavy inline order form. With the new design it'll feel cramped on mobile. Solution:
- **Mobile:** sticky bottom CTA "Place order →" opens a Sheet with the form
- **Desktop:** form lives inline in a right-rail (col-span-1)

Better UX, same backend.

---

## Section 5 — Implementation phasing

Six commits, in dependency order.

### Phase 1 — Foundation (~3h)

**The most important phase.** Get this right, the rest trivializes.

Files:
- `tailwind.config.ts` — color tokens (`forest-*`, `ink-*`, semantic), radius scale, shadow scale, animation timing, container config. Lift every bracketed hex into semantic names.
- `app/globals.css` — shadcn CSS variable remap to new tokens
- `app/layout.tsx` — wire Inter via `next/font/google` (replaces removed Geist imports)
- All `components/ui/*.tsx` shadcn primitives restyled in place: button, input, textarea, label, card, dialog, sheet, select, dropdown-menu, tabs, switch, checkbox, sonner
- New: `components/ui/badge.tsx`, `components/ui/skeleton.tsx`, `components/ui/eyebrow.tsx`
- New shared chrome: `components/shared/PageHeader.tsx`, `components/shared/EmptyState.tsx`

Verify: `npm run build` clean + load `/login` in browser — already noticeably refreshed.

Risk: shadcn primitives are widely consumed. Keep API surfaces identical (variant names, props), just change visual class strings inside.

### Phase 2 — Dashboard chrome (~2h)

- `components/shared/Sidebar.tsx` — full redesign per Section 3
- New: `components/shared/MobileNav.tsx` — 5-item bottom nav
- `app/(dashboard)/layout.tsx` — wraps sidebar + main + mobile nav, `bg-paper`, max-w container
- `components/shared/LeadsNavBadge.tsx` — uses new `Badge accent` variant; small-dot variant for MobileNav
- `components/shared/UserProfile.tsx` — new user pill design for sidebar top

Verify: load `/`, `/marketplace`, `/orders`, `/leads`, `/manage` — sidebar + mobile bottom nav both render, nav works, active state correct.

### Phase 3 — Auth + Setup (~3h)

- `app/(auth)/login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx` — split-screen pattern
- `app/(auth)/layout.tsx` — TopNav minimal variant
- `app/(setup)/setup/page.tsx` — progress chrome top + sticky action bar bottom
- `components/setup/PersonalDetails.tsx`, `BussinessDetails.tsx`, `BankDetails.tsx` — wrap fields into eyebrow-headed Card sections
- New: `components/setup/ProgressBar.tsx` — 3-dot progress
- `components/shared/TopNav.tsx` — minimal variant

Verify: register flow walked end-to-end. Progress bar updates. Slug input still works.

### Phase 4 — Internal merchant pages (~3h)

- `app/(dashboard)/page.tsx` — new dashboard home (stat row + activity feed + top products)
- New: `components/dashboard/StatCard.tsx`, `RecentActivity.tsx`, `TopProductsList.tsx`
- `app/(dashboard)/marketplace/page.tsx` — PageHeader + new ProductCard
- `components/shared/ProductCard.tsx` — full redesign
- `app/(dashboard)/marketplace/product/[id]/page.tsx` — PageHeader; SharePanel preserved
- `app/(dashboard)/orders/page.tsx` — underline tabs, date eyebrow sections, Card rows
- `app/(dashboard)/leads/page.tsx` — EmptyState + LeadRow polish
- `components/leads/LeadRow.tsx` — Card variant, Badge for counts
- `app/(dashboard)/manage/page.tsx` — pill tabs preserved, Categories restyled
- `components/manage/*.tsx` — light token-only sweeps

Verify: every dashboard page renders. Forms in /manage still submit. Orders accept/decline still works.

### Phase 5 — Customer storefront (~3h)

- `app/store/page.tsx` — editorial hero + Trending / New / Categories sections
- `app/store/[storeId]/page.tsx` — merchant hero with metadata chips + filtered product grid
- `app/store/product/[id]/page.tsx` — sticky bottom CTA on mobile → Sheet with order form; desktop inline form in right-rail
- `app/store/layout.tsx` — TopNav storefront variant + footer
- `components/shared/TopNav.tsx` — extend with storefront variant
- New: `components/store/MerchantHero.tsx`, `components/store/CategoryGrid.tsx`, `components/store/OrderFormSheet.tsx`

Verify: as anonymous customer, browse `/store`, drill into a merchant, place an order. Order completes against existing backend.

### Phase 6 — Share-link landings (~2h)

- `components/share/Interstitial.tsx` — refined product/store hero card per Section 4
- `components/share/ShareLinkNotFound.tsx` — proper EmptyState usage
- `lib/share/shareLinkPage.ts` — no logic change
- Pages `app/p/[shortId]/page.tsx`, `app/s/[shortId]/page.tsx` — auto-inherit token changes

Verify: walk the share-links smoke checklist (from the share-links spec). Interstitial looks dramatically more confident. OG meta tags still emit. Submit flow still works.

### Cross-cutting

- Per-phase commit (same message style as the share-links work)
- Per-phase smoke: `npm run build` clean + `tsc --noEmit` clean + manual click-through of touched pages
- No backend changes in any phase — pure frontend
- No new dependencies — Tailwind handles everything; Inter via `next/font/google` is already supported

### Risk callouts

1. **shadcn primitives are widely consumed.** Mitigation: review Phase 1 output (load 3+ pages, click every interactive element) before starting Phase 2.
2. **Inter font weight ~150 KB across weights.** Acceptable for an e-comm app. If it pushes past comfort, drop to 400/600/700 only.
3. **Dashboard home assumes data we don't fetch yet** (orders count, leads delta, top products). v1 ships counts only, no deltas. Backend follow-up.
4. **Customer `/store` needs real data.** Seed script with 4-6 products as part of Phase 5.

---

## Future work

Tracked here so we don't lose them after this lands.

| Feature | Why deferred |
|---|---|
| Dark mode | CSS variable structure ready; not v1 priority |
| Trend deltas on dashboard ("↑ 12% from last week") | Needs backend support for cohort comparisons |
| Internationalization (i18n) | Out of scope for a re-skin |
| Native mobile app | Web-only for now |
| Scroll-triggered animations on storefront | Locked to "subtle motion only" in this design |
| Custom font hosting / self-host Inter | `next/font/google` is fine for v1 |

## Open questions for review

None at design lock. Implementation will surface its own; those go into the writing-plans output, not back into this spec.
