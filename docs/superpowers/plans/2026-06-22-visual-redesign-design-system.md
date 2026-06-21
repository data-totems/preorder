# Visual Redesign + Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the entire `preorder` Next.js app to a bold, confident, modern-storefront aesthetic — refined deeper-green palette, Inter typography, ink-warm neutrals, subtle polish only, mobile-friendly chrome — applied via Tailwind v4 tokens + restyled shadcn primitives + per-page polish.

**Architecture:** Tailwind v4 `@theme` block in `app/globals.css` carries the tokens. Existing `components/ui/*` shadcn primitives get their `className` strings rewritten in place (API surfaces unchanged) so every consumer inherits the new look. New shared chrome (`PageHeader`, `EmptyState`, `MobileNav`, `TopNav`, `Eyebrow`) is dropped under `components/shared/`. Page work is then mostly composition: applying chrome + tokens + targeted layout changes per the spec's hero-page redesigns.

**Tech Stack:** Tailwind CSS v4 (`@theme inline` in globals.css; no tailwind.config.ts), Next.js 14 App Router, shadcn/ui (Radix primitives wrapped with cva variants), lucide-react icons, sonner, Inter via `next/font/google`.

**User Verification:** YES — the merchant explicitly asked for the app to feel "modern, sharp, inspiring, nice to behold." Subjective aesthetic judgment requires their sign-off. Task 13 (final) is a manual walkthrough where the merchant signs off on the new look on a per-page basis.

**Spec:** `preorder/docs/superpowers/specs/2026-06-22-visual-redesign-design-system-design.md`

**Repo state:**
- Frontend: `/Users/lordamola/company-repos/data-totems/preorder/`
- Branch: `feat/share-links` (the redesign continues on top of the share-links work)
- No backend changes — pure frontend work
- Tailwind v4: tokens live in `app/globals.css` under `@theme`, not in a `tailwind.config.ts`

---

## File Map

### Phase 1 — Foundation (Tasks 0, 1, 2)

**Modify:**
- `app/globals.css` — add forest-* + ink-* color scale, semantic colors, radius scale, shadow scale, motion timing under `@theme inline`. Remap shadcn CSS variables to new tokens.
- `app/layout.tsx` — wire Inter via `next/font/google`, remove stale Geist references in className/CSS variables.
- `components/ui/button.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`, `card.tsx`, `dialog.tsx`, `sheet.tsx`, `select.tsx`, `dropdown-menu.tsx`, `tabs.tsx`, `switch.tsx`, `checkbox.tsx`, `sonner.tsx`, `badge.tsx`, `skeleton.tsx` — restyle in place.

**Create:**
- `components/ui/eyebrow.tsx` — small uppercase section-label component.
- `components/shared/PageHeader.tsx` — standard page-header pattern.
- `components/shared/EmptyState.tsx` — standard empty state.

### Phase 2 — Dashboard chrome (Tasks 3, 4)

**Modify:**
- `components/shared/Sidebar.tsx` — forest-900 bg, active indicator pill, user pill, anchored logout.
- `components/shared/UserProfile.tsx` — new user pill design.
- `components/shared/LeadsNavBadge.tsx` — uses new `Badge accent` variant; small-dot variant for MobileNav.
- `app/(dashboard)/layout.tsx` — wraps Sidebar + main + MobileNav, `bg-paper`, max-w container.

**Create:**
- `components/shared/MobileNav.tsx` — 5-item fixed bottom nav for mobile (replaces the old hard-coded `BottomNav.tsx` which we'll delete since it was unused).

**Delete:**
- `components/shared/BottomNav.tsx` — hard-coded prototype, not wired in, replaced by MobileNav.

### Phase 3 — Auth + Setup (Tasks 5, 6)

**Modify:**
- `app/(auth)/login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx` — split-screen pattern (left form, right marketing panel on lg+).
- `app/(auth)/layout.tsx` — TopNav minimal variant + page wrapper.
- `app/(setup)/setup/page.tsx` — progress bar + sticky action bar.
- `components/setup/PersonalDetails.tsx`, `BussinessDetails.tsx`, `BankDetails.tsx` — eyebrow-headed Card sections.

**Create:**
- `components/shared/TopNav.tsx` — top navigation bar with `variant` prop (`minimal` / `storefront` / `silent`).
- `components/setup/ProgressBar.tsx` — 3-dot progress indicator.

### Phase 4 — Internal merchant pages (Tasks 7, 8, 9)

**Modify:**
- `app/(dashboard)/page.tsx` — dashboard home rebuilt (stat row + activity feed + top products).
- `app/(dashboard)/marketplace/page.tsx` — PageHeader + new ProductCard pattern.
- `app/(dashboard)/marketplace/product/[id]/page.tsx` — PageHeader; SharePanel preserved.
- `app/(dashboard)/orders/page.tsx` — underline tabs + eyebrow date sections + Card rows.
- `app/(dashboard)/leads/page.tsx` — EmptyState component + LeadRow polish.
- `components/leads/LeadRow.tsx` — Card variant + Badge for counts.
- `app/(dashboard)/manage/page.tsx` — pill tabs preserved.
- `components/manage/Account.tsx`, `Bussiness.tsx`, `Payment.tsx`, `Dispatch.tsx`, `StoreLink.tsx`, `Category.tsx` — token sweeps only.
- `components/shared/ProductCard.tsx` — full redesign per spec.

**Create:**
- `components/dashboard/StatCard.tsx` — single stat tile.
- `components/dashboard/RecentActivity.tsx` — chronological feed of orders/leads/clicks.
- `components/dashboard/TopProductsList.tsx` — small ranked list.

### Phase 5 — Customer storefront (Tasks 10, 11)

**Modify:**
- `app/store/page.tsx` — editorial hero + sections.
- `app/store/[storeId]/page.tsx` — merchant hero + product grid.
- `app/store/product/[id]/page.tsx` — sticky bottom CTA (mobile) → Sheet with order form; desktop inline form in right-rail.
- `app/store/layout.tsx` — TopNav storefront variant + footer (create file if absent).
- `components/shared/TopNav.tsx` — extend with `storefront` variant.

**Create:**
- `components/store/MerchantHero.tsx`.
- `components/store/CategoryGrid.tsx`.
- `components/store/OrderFormSheet.tsx`.

### Phase 6 — Share-link landings (Task 12)

**Modify:**
- `components/share/Interstitial.tsx` — refined hero card per spec.
- `components/share/ShareLinkNotFound.tsx` — use EmptyState component.

### Verification (Task 13)

User walks through the new design on each page and signs off via AskUserQuestion.

---

## Task 0: Foundation — tokens + Inter

**Goal:** Drop the new color/radius/shadow/motion tokens into Tailwind v4's `@theme inline` block, remap shadcn CSS variables, wire Inter from `next/font/google`. After this, every page automatically picks up the new bg / fonts / colors without touching component code.

**Files:**
- Modify: `preorder/app/globals.css`
- Modify: `preorder/app/layout.tsx`

**Acceptance Criteria:**
- [ ] `@theme inline` exposes color scale: `forest-50/100/400/500/700/900`, `ink-50/100/200/300/500/700/900`, `paper`, semantic `success`/`danger`/`warning`/`info`
- [ ] `--background` resolves to `paper` (#FAFAF8), `--primary` to `forest-700`, `--accent` to `forest-400`, `--destructive` to `danger`, `--border` to `ink-200`, `--input` to `ink-100`, `--ring` to `forest-500`
- [ ] Shadow utilities `shadow-xs|sm|md|lg|xl` use forest-tinted (`rgba(10,46,27,0.0X)`) values
- [ ] Inter loaded via `next/font/google` with weights 400, 500, 600, 700, 800; CSS var `--font-sans` points at it; old `--font-geist-*` references removed
- [ ] `npm run build` clean; `/login` rendered in dev shows new bg + Inter, no FOUT

**Verify:** `cd preorder && npx tsc --noEmit && npm run build` → both clean; manually load `http://localhost:3000/login` → page bg is warm cream, headings render in Inter weight 700.

**Steps:**

- [ ] **Step 1: Add Inter import to `app/layout.tsx`**

Replace the existing layout imports + `<html>` tag with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buzzmart",
  description: "WhatsApp commerce for African merchants",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-sans">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Rewrite `app/globals.css` tokens**

In `app/globals.css`, replace the `@theme inline` block with the consolidated token set below. Keep the `@import "tailwindcss";` and `@import "tw-animate-css";` lines at the top. Remove the `@custom-variant dark (&:is(.dark *));` line for v1 (no dark mode); we'll re-add when we ship dark.

```css
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  /* Font */
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;

  /* Color scale — forest */
  --color-forest-50:  #F4FAF6;
  --color-forest-100: #E8F4ED;
  --color-forest-400: #27BA5F;
  --color-forest-500: #1A6B3F;
  --color-forest-700: #0F4D2C;
  --color-forest-900: #0A2E1B;

  /* Color scale — ink */
  --color-ink-50:  #F7F7F8;
  --color-ink-100: #EDEDF0;
  --color-ink-200: #D4D4D9;
  --color-ink-300: #A8A8B0;
  --color-ink-500: #5C5C66;
  --color-ink-700: #1F1F22;
  --color-ink-900: #0A0A0B;
  --color-paper:   #FAFAF8;

  /* Semantic */
  --color-success: #27BA5F;
  --color-danger:  #D63B3B;
  --color-warning: #E89A2C;
  --color-info:    #3B7BD6;

  /* Shadcn-bound surface roles (remapped to forest+ink) */
  --color-background:           var(--color-paper);
  --color-foreground:           var(--color-ink-900);
  --color-card:                 #FFFFFF;
  --color-card-foreground:      var(--color-ink-900);
  --color-popover:              #FFFFFF;
  --color-popover-foreground:   var(--color-ink-900);
  --color-primary:              var(--color-forest-700);
  --color-primary-foreground:   #FFFFFF;
  --color-secondary:            var(--color-ink-100);
  --color-secondary-foreground: var(--color-ink-900);
  --color-muted:                var(--color-ink-100);
  --color-muted-foreground:     var(--color-ink-500);
  --color-accent:               var(--color-forest-400);
  --color-accent-foreground:    var(--color-forest-900);
  --color-destructive:          var(--color-danger);
  --color-border:               var(--color-ink-200);
  --color-input:                var(--color-ink-100);
  --color-ring:                 var(--color-forest-500);

  /* Radius */
  --radius-xs:   4px;
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-pill: 9999px;
  --radius:      12px; /* shadcn default */

  /* Shadows — forest-tinted */
  --shadow-xs: 0 1px 2px 0 rgb(10 46 27 / 0.04);
  --shadow-sm: 0 1px 3px 0 rgb(10 46 27 / 0.05), 0 1px 2px -1px rgb(10 46 27 / 0.04);
  --shadow-md: 0 4px 6px -1px rgb(10 46 27 / 0.06), 0 2px 4px -2px rgb(10 46 27 / 0.04);
  --shadow-lg: 0 10px 15px -3px rgb(10 46 27 / 0.07), 0 4px 6px -4px rgb(10 46 27 / 0.05);
  --shadow-xl: 0 20px 25px -5px rgb(10 46 27 / 0.08), 0 8px 10px -6px rgb(10 46 27 / 0.05);

  /* Motion */
  --ease:    cubic-bezier(0.4, 0, 0.2, 1);
  --spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans);
}
```

- [ ] **Step 3: Verify**

```bash
cd /Users/lordamola/company-repos/data-totems/preorder
npx tsc --noEmit
npm run build
```

Both should be clean. Then start dev server and load `/login` — bg should be warm cream (#FAFAF8), text should render in Inter (look for the characteristic Inter "1" / "I" / "l"). If you see the old Times-like fallback font, the next/font wiring didn't take — check that `<html className={inter.variable}>` and `<body className="font-sans">` both made it.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat(design): foundation — forest+ink tokens, Inter font, shadcn remap"
```

```json:metadata
{"files": ["preorder/app/globals.css", "preorder/app/layout.tsx"], "verifyCommand": "npm run build", "acceptanceCriteria": ["Tailwind @theme exposes new color/radius/shadow/motion tokens", "shadcn CSS variables remapped to new tokens", "Inter loaded via next/font/google with all weights", "build clean, /login renders with new bg + font"], "requiresUserVerification": false}
```


## Task 1: Restyle shadcn primitives in place

**Goal:** Rewrite the visual class strings inside every shadcn primitive consumed by the app so they read as bold-confident. API surfaces (variant names, props, refs) stay identical — every consumer inherits automatically.

**Files:**
- Modify: `preorder/components/ui/button.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`, `card.tsx`, `dialog.tsx`, `sheet.tsx`, `select.tsx`, `dropdown-menu.tsx`, `tabs.tsx`, `switch.tsx`, `checkbox.tsx`, `sonner.tsx`, `badge.tsx`, `skeleton.tsx`

**Acceptance Criteria:**
- [ ] Button: default = `bg-primary` (forest-700) text white h-11; sm h-9; lg h-14; all radius `md`; weight 600; `active:scale-[0.98]`
- [ ] Input/Textarea: `bg-input` (ink-100) h-11 radius `md`; focus `bg-white ring-2 ring-ring ring-offset-2`; `aria-invalid:ring-destructive`
- [ ] Card: `bg-card rounded-lg border-border shadow-xs p-6`; variants `elevated` (shadow-md), `compact` (p-4), `flat` (bg-paper)
- [ ] Dialog overlay: `bg-ink-900/40 backdrop-blur-sm`; content `bg-white rounded-xl shadow-xl border-border p-6`; medium-fade transitions
- [ ] Sheet: from-right default, content `bg-white rounded-xl shadow-xl`, medium transitions
- [ ] Select/Dropdown trigger: matches Input
- [ ] Tabs: two variants via `data-variant` attribute — `pill` (default, bg-ink-100 inner active bg-white shadow-xs) and `underline` (border-b border-border, active border-b-2 border-primary)
- [ ] Switch: track h-6 w-10, off bg-ink-200, on `bg-forest-500`; thumb bg-white
- [ ] Checkbox: 18×18 radius `sm`; checked `bg-forest-500 text-white`
- [ ] Sonner: success uses `bg-forest-100` with `border-l-4 border-forest-400`; danger uses `bg-danger/5 border-l-4 border-destructive`
- [ ] Badge: six variants — default/success/danger/warning/info/accent — all radius `pill` weight 600 size `caption`
- [ ] Skeleton: `bg-ink-100 animate-pulse rounded-md`
- [ ] Universal: every interactive element gets `transition-colors duration-150 ease-[var(--ease)]` and `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- [ ] `npx tsc --noEmit` clean; `npm run build` clean; all existing pages still render (no broken consumers)

**Verify:** `cd preorder && npx tsc --noEmit && npm run build` → both clean; run dev, click through `/login` → `/register` → `/marketplace` → `/orders` → `/leads` → `/manage` → smoke that every page still renders and clickable elements have the new look + hover/active states.

**Steps:**

- [ ] **Step 1: Replace `components/ui/button.tsx`**

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-colors duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-forest-500",
        secondary: "bg-secondary text-secondary-foreground hover:bg-ink-200",
        outline: "border border-border bg-transparent text-foreground hover:bg-ink-50",
        ghost: "bg-transparent text-foreground hover:bg-ink-100",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        link: "bg-transparent text-forest-500 hover:underline underline-offset-4",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-[15px]",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

- [ ] **Step 2: Replace `components/ui/input.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-md border-0 bg-input px-3.5 py-2 text-[15px]",
        "text-foreground placeholder:text-ink-300",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "aria-invalid:ring-2 aria-invalid:ring-destructive aria-invalid:bg-white",
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
```

- [ ] **Step 3: Replace `components/ui/textarea.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex min-h-32 w-full rounded-md border-0 bg-input px-3.5 py-3 text-[15px]",
        "text-foreground placeholder:text-ink-300",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "aria-invalid:ring-2 aria-invalid:ring-destructive aria-invalid:bg-white",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
```

- [ ] **Step 4: Replace `components/ui/label.tsx`**

```tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    data-slot="label"
    className={cn(
      "text-[12px] font-medium leading-4 tracking-[0.02em] text-ink-700",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
```

- [ ] **Step 5: Replace `components/ui/card.tsx`**

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-lg bg-card text-card-foreground", {
  variants: {
    variant: {
      default: "border border-border shadow-xs",
      elevated: "shadow-md",
      compact: "border border-border shadow-xs",
      flat: "bg-paper border border-border",
    },
    padding: {
      default: "p-6",
      compact: "p-4",
      none: "",
    },
  },
  defaultVariants: { variant: "default", padding: "default" },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div ref={ref} data-slot="card" className={cn(cardVariants({ variant, padding, className }))} {...props} />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props} />
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-[22px] font-bold leading-[30px] tracking-[-0.005em] text-foreground", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-[13px] text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center gap-3", className)} {...props} />
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
```

- [ ] **Step 6: Replace `components/ui/badge.tsx`**

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-pill px-3 py-1 text-[12px] font-semibold leading-4 transition-colors [&>svg]:size-3 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-ink-100 text-ink-700",
        success: "bg-forest-100 text-forest-900",
        danger:  "bg-[color:rgb(214_59_59/0.1)] text-destructive",
        warning: "bg-[color:rgb(232_154_44/0.1)] text-warning",
        info:    "bg-[color:rgb(59_123_214/0.1)] text-info",
        accent:  "bg-forest-400 text-white",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
```

- [ ] **Step 7: Replace `components/ui/skeleton.tsx`**

```tsx
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("bg-ink-100 animate-pulse rounded-md", className)} {...props} />;
}

export { Skeleton };
```

- [ ] **Step 8: Replace `components/ui/sonner.tsx`**

```tsx
"use client";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }: React.ComponentProps<typeof Sonner>) => (
  <Sonner
    className="toaster"
    toastOptions={{
      classNames: {
        toast: "rounded-lg bg-white text-foreground border border-border shadow-lg p-4",
        title: "text-[15px] font-semibold",
        description: "text-[13px] text-muted-foreground",
        success: "bg-forest-100 text-forest-900 border-l-4 border-l-forest-400",
        error: "bg-[color:rgb(214_59_59/0.05)] text-destructive border-l-4 border-l-destructive",
      },
    }}
    {...props}
  />
);

export { Toaster };
```

- [ ] **Step 9: Update Tabs variants in `components/ui/tabs.tsx`**

Add a `variant` attribute on TabsList/TabsTrigger. Default keeps the pill look; `underline` reads from `data-variant`:

```tsx
"use client";
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { variant?: "pill" | "underline" }
>(({ className, variant = "pill", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-variant={variant}
    className={cn(
      variant === "pill"
        ? "inline-flex h-11 items-center justify-center rounded-md bg-ink-100 p-1 gap-1"
        : "flex items-center gap-6 border-b border-border",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & { variant?: "pill" | "underline" }
>(({ className, variant = "pill", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    data-variant={variant}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap text-[13px] font-medium transition-colors duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      variant === "pill"
        ? "h-9 px-4 rounded-sm text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-xs"
        : "px-1 pb-3 -mb-px border-b-2 border-transparent text-muted-foreground hover:text-foreground data-[state=active]:border-forest-500 data-[state=active]:text-foreground data-[state=active]:font-bold",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = TabsPrimitive.Content;
export { Tabs, TabsList, TabsTrigger, TabsContent };
```

- [ ] **Step 10: Update remaining primitives** — `dialog.tsx`, `sheet.tsx`, `select.tsx`, `dropdown-menu.tsx`, `switch.tsx`, `checkbox.tsx`

For each, the structural Radix-wrapping code stays. Only the className strings on the outer components change to the new tokens. For each:

- Replace inline shadow utilities → `shadow-xs|sm|md|lg|xl` (auto-mapped via @theme)
- Replace `bg-background|popover|card` → tokens are now correct, no change needed
- Replace `text-foreground|muted-foreground` → unchanged
- Replace explicit color hex (e.g. `#27BA5F`, `#F0F0F0`, `#03140A80`) → `forest-*` / `ink-*` tokens
- Replace `rounded-[12px]` → `rounded-md`; `rounded-2xl` → `rounded-lg`; `rounded-md` for modal/sheet → `rounded-xl`
- Sheet: change inner radius to `rounded-xl`, header gets `border-b border-border pb-4`
- Dialog: overlay `bg-ink-900/40 backdrop-blur-sm`; content `rounded-xl shadow-xl`
- Select/Dropdown: trigger matches Input style (`h-11 bg-input rounded-md`); content `bg-popover rounded-md shadow-md border border-border`
- Switch: track `bg-ink-200` off, `bg-forest-500` on
- Checkbox: `border-ink-300`; checked `bg-forest-500 text-white border-forest-500`

(These files don't need full code dumps — preserving the existing Radix wiring and updating only className strings. The implementer should read each file, then change the strings inline.)

- [ ] **Step 11: Verify across pages**

```bash
cd /Users/lordamola/company-repos/data-totems/preorder
npx tsc --noEmit
npm run build
```

Start dev server, click through `/login`, `/register`, `/setup`, `/`, `/marketplace`, `/orders`, `/leads`, `/manage` — confirm everything still renders. Especially check forms (inputs have new focus ring), buttons (new color + press scale), modals (new radius + shadow).

- [ ] **Step 12: Commit**

```bash
git add components/ui/
git commit -m "feat(design): restyle shadcn primitives — buttons, inputs, cards, dialogs, tabs, badges, toasts"
```

```json:metadata
{"files": ["preorder/components/ui/button.tsx", "preorder/components/ui/input.tsx", "preorder/components/ui/textarea.tsx", "preorder/components/ui/label.tsx", "preorder/components/ui/card.tsx", "preorder/components/ui/dialog.tsx", "preorder/components/ui/sheet.tsx", "preorder/components/ui/select.tsx", "preorder/components/ui/dropdown-menu.tsx", "preorder/components/ui/tabs.tsx", "preorder/components/ui/switch.tsx", "preorder/components/ui/checkbox.tsx", "preorder/components/ui/sonner.tsx", "preorder/components/ui/badge.tsx", "preorder/components/ui/skeleton.tsx"], "verifyCommand": "npm run build", "acceptanceCriteria": ["all 15 primitives restyled with new tokens", "API surfaces unchanged (variants, props, refs)", "build clean, all existing pages render"], "requiresUserVerification": false}
```


## Task 2: New shared chrome — Eyebrow, PageHeader, EmptyState

**Goal:** Three small, reusable layout primitives that every page will consume. They lock the eyebrow/header/empty-state patterns so Phase 4 page work becomes mostly composition.

**Files:**
- Create: `preorder/components/ui/eyebrow.tsx`
- Create: `preorder/components/shared/PageHeader.tsx`
- Create: `preorder/components/shared/EmptyState.tsx`

**Acceptance Criteria:**
- [ ] Eyebrow: small uppercase label (11/14 weight 700 tracking +8%) `text-ink-500` by default; accepts `tone` prop (`muted` default, `accent` for `text-forest-500`)
- [ ] PageHeader: renders `eyebrow + title + description + actions + tabs slot`, with optional `border-b border-border`; padding `pt-8 pb-6 px-6 md:px-10`
- [ ] EmptyState: icon (in `bg-forest-50 rounded-full p-3` 48×48 circle), title (heading-2), description, optional action; centered max-w-md
- [ ] All three are `"use client"` only if needed (Eyebrow + EmptyState are pure render; PageHeader can stay server-component compatible)
- [ ] Each exported as default + named; matches existing project convention
- [ ] `npx tsc --noEmit` clean

**Verify:** `cd preorder && npx tsc --noEmit` clean. Mock-import each into a page (or temporary `/test` route) to confirm they render.

**Steps:**

- [ ] **Step 1: Create `components/ui/eyebrow.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "muted" | "accent";
}

const Eyebrow = React.forwardRef<HTMLSpanElement, EyebrowProps>(
  ({ className, tone = "muted", children, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="eyebrow"
      className={cn(
        "text-[11px] leading-[14px] font-bold tracking-[0.08em] uppercase",
        tone === "muted" ? "text-ink-500" : "text-forest-500",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
);
Eyebrow.displayName = "Eyebrow";

export default Eyebrow;
export { Eyebrow };
```

- [ ] **Step 2: Create `components/shared/PageHeader.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/eyebrow";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  className?: string;
  bordered?: boolean;
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  tabs,
  className,
  bordered,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "pt-8 pb-6 px-6 md:px-10",
        bordered && "border-b border-border",
        className
      )}
    >
      {eyebrow && <Eyebrow className="mb-2 block">{eyebrow}</Eyebrow>}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <h1 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-foreground">
          {title}
        </h1>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
      {description && (
        <p className="mt-2 text-[17px] leading-[26px] text-muted-foreground max-w-2xl">
          {description}
        </p>
      )}
      {tabs && <div className="mt-6">{tabs}</div>}
    </header>
  );
}

export { PageHeader };
```

- [ ] **Step 3: Create `components/shared/EmptyState.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "py-20 flex flex-col items-center text-center max-w-md mx-auto",
        className
      )}
    >
      {icon && (
        <div className="bg-forest-50 rounded-full p-3 text-forest-700 mb-4 [&>svg]:size-6">
          {icon}
        </div>
      )}
      <h2 className="text-[22px] leading-[30px] font-bold tracking-[-0.005em] text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-[17px] leading-[26px] text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export { EmptyState };
```

- [ ] **Step 4: Verify**

```bash
cd /Users/lordamola/company-repos/data-totems/preorder
npx tsc --noEmit
```

Should be clean.

- [ ] **Step 5: Commit**

```bash
git add components/ui/eyebrow.tsx components/shared/PageHeader.tsx components/shared/EmptyState.tsx
git commit -m "feat(design): add Eyebrow, PageHeader, EmptyState shared chrome"
```

```json:metadata
{"files": ["preorder/components/ui/eyebrow.tsx", "preorder/components/shared/PageHeader.tsx", "preorder/components/shared/EmptyState.tsx"], "verifyCommand": "npx tsc --noEmit", "acceptanceCriteria": ["Eyebrow + PageHeader + EmptyState created", "All compile clean", "Match the tokens from Task 0"], "requiresUserVerification": false}
```


## Task 3: Sidebar redesign + UserProfile + Leads badge update

**Goal:** Replace the existing black sidebar with the forest-900 design — brand block, user pill, nav items with left-edge active indicator, anchored logout. Update LeadsNavBadge to use the new accent Badge variant.

**Files:**
- Modify: `preorder/components/shared/Sidebar.tsx`
- Modify: `preorder/components/shared/UserProfile.tsx`
- Modify: `preorder/components/shared/LeadsNavBadge.tsx`

**Acceptance Criteria:**
- [ ] Sidebar width 256px, bg `forest-900`, `py-6 px-3 flex flex-col h-screen`
- [ ] Top brand block: "Buzzmart" wordmark (h-8, weight 800, tracking -1%, `text-forest-50`)
- [ ] UserProfile pill: avatar 36×36 monogram + name (weight 600 `ink-100`) + business name (`text-[13px] text-ink-300 truncate`)
- [ ] Nav items: `h-11 rounded-md px-3 flex items-center gap-3`; inactive `text-ink-200`; hover `bg-white/5 text-white`; active `bg-forest-700 text-white` weight 600 with 3px `forest-400` rounded-pill on the LEFT edge as accent
- [ ] LeadsNavBadge uses `<Badge variant="accent">` with the count
- [ ] Anchored bottom: divider `border-t border-white/10 mt-auto`, log-out button outline-inverted (`border-white/10 text-ink-200 hover:bg-white/5 hover:text-white`)
- [ ] `npx tsc --noEmit` clean

**Verify:** Load any dashboard page, sidebar matches the spec visually. Click each nav item — active state correct, left-edge pill visible.

**Steps:**

- [ ] **Step 1: Update `components/shared/UserProfile.tsx`**

Read the existing file. Replace with a smaller "user pill" tuned for the new sidebar:

```tsx
"use client";
import { useUserStore } from "@/zustand";

const initials = (name?: string | null) => {
  if (!name) return "B";
  return name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "B";
};

const UserProfile = () => {
  const user = useUserStore((s) => s.user);
  const name = user?.fullName ?? "Welcome";
  const business = user?.business_name ?? "Set up your store";
  return (
    <div className="rounded-md bg-white/5 p-3 mt-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-forest-400 text-white flex items-center justify-center font-bold text-[13px]">
        {initials(name)}
      </div>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-ink-100 truncate">{name}</div>
        <div className="text-[12px] text-ink-300 truncate">{business}</div>
      </div>
    </div>
  );
};

export default UserProfile;
```

- [ ] **Step 2: Update `components/shared/LeadsNavBadge.tsx`**

Replace the inline red span with a `<Badge variant="accent">`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { getLeads } from "@/actions/share-links.actions";
import { Badge } from "@/components/ui/badge";

const LeadsNavBadge = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const since = localStorage.getItem("lastSeenLeadsAt") ?? undefined;
    getLeads({ since }).then((data) => setCount(data.count ?? 0)).catch(() => {});
  }, []);
  if (count === 0) return null;
  return (
    <Badge
      variant="accent"
      role="status"
      aria-label={`${count} new lead${count === 1 ? "" : "s"}`}
      className="ml-auto"
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
};

export default LeadsNavBadge;
```

- [ ] **Step 3: Replace `components/shared/Sidebar.tsx`**

```tsx
"use client";
import { Grid, House, LogOut, Package, Store, Users } from "lucide-react";
import UserProfile from "./UserProfile";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LeadsNavBadge from "./LeadsNavBadge";
import { useUserStore } from "@/zustand";

const navMenu = [
  { id: 1, title: "Dashboard", href: "/", icon: House },
  { id: 2, title: "Marketplace", href: "/marketplace", icon: Store },
  { id: 3, title: "Orders", href: "/orders", icon: Package },
  { id: 4, title: "Leads", href: "/leads", icon: Users, badge: true },
  { id: 5, title: "Manage", href: "/manage", icon: Grid },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("buzzToken");
      localStorage.removeItem("lastSeenLeadsAt");
    }
    setUser(null as unknown as UserProps);
    router.replace("/login");
  };

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col bg-forest-900 py-6 px-3">
      <div className="px-3">
        <span className="text-2xl font-extrabold tracking-tight text-forest-50">Buzzmart</span>
      </div>
      <UserProfile />

      <nav className="mt-8 flex flex-col gap-1">
        {navMenu.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative h-11 rounded-md px-3 flex items-center gap-3 text-[15px] transition-colors duration-150 ${
                active
                  ? "bg-forest-700 text-white font-semibold"
                  : "text-ink-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-pill bg-forest-400" />
              )}
              <item.icon className={`size-5 ${active ? "text-forest-400" : "text-ink-300"}`} />
              <span>{item.title}</span>
              {item.badge && <LeadsNavBadge />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full h-11 px-3 rounded-md flex items-center gap-3 text-[15px] text-ink-200 hover:bg-white/5 hover:text-white transition-colors duration-150 border border-white/10"
          aria-label="Log out"
        >
          <LogOut className="size-5 text-ink-300" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run build
```

Both clean. Load `/` and confirm sidebar matches the spec.

- [ ] **Step 5: Commit**

```bash
git add components/shared/Sidebar.tsx components/shared/UserProfile.tsx components/shared/LeadsNavBadge.tsx
git commit -m "feat(design): sidebar redesign — forest-900 chrome, user pill, active indicator, anchored logout"
```

```json:metadata
{"files": ["preorder/components/shared/Sidebar.tsx", "preorder/components/shared/UserProfile.tsx", "preorder/components/shared/LeadsNavBadge.tsx"], "verifyCommand": "npm run build", "acceptanceCriteria": ["sidebar bg forest-900", "active item shows left-edge forest-400 pill", "user pill renders avatar + name + business", "logout anchored bottom with inverted outline style", "leads badge uses accent variant"], "requiresUserVerification": false}
```

## Task 4: MobileNav + dashboard layout

**Goal:** Add a 5-item fixed bottom nav for mobile, wire it into `(dashboard)/layout.tsx` along with the redesigned Sidebar. Page bg becomes `paper`. Remove the unused old `BottomNav.tsx`.

**Files:**
- Create: `preorder/components/shared/MobileNav.tsx`
- Modify: `preorder/app/(dashboard)/layout.tsx`
- Delete: `preorder/components/shared/BottomNav.tsx`

**Acceptance Criteria:**
- [ ] MobileNav: fixed bottom-0 inset-x-0 z-30, `h-16 + safe-area-inset-bottom`, `bg-white border-t border-border shadow-lg-up`
- [ ] 5 items (same as Sidebar nav): Dashboard, Marketplace, Orders, Leads, Manage; icon 22×22 + label `caption`
- [ ] Inactive `text-ink-500`; active `text-forest-700` weight 600
- [ ] Leads has small `forest-400` 8×8 dot top-right of icon when count > 0 (fetched via getLeads)
- [ ] Tap active state via `active:bg-ink-50`
- [ ] Dashboard layout: `min-h-screen flex bg-paper`; Sidebar on `md+`, MobileNav on `<md`; main has `pb-20 md:pb-0` to clear bottom nav
- [ ] BottomNav.tsx deleted
- [ ] `npx tsc --noEmit` clean

**Verify:** Resize browser to mobile width — MobileNav appears, sidebar disappears. Resize back to desktop — sidebar shows, MobileNav hides. Click nav items, navigation works.

**Steps:**

- [ ] **Step 1: Create `components/shared/MobileNav.tsx`**

```tsx
"use client";
import { Grid, House, Package, Store, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getLeads } from "@/actions/share-links.actions";

const navItems = [
  { title: "Home", href: "/", icon: House },
  { title: "Market", href: "/marketplace", icon: Store },
  { title: "Orders", href: "/orders", icon: Package },
  { title: "Leads", href: "/leads", icon: Users, badge: true },
  { title: "Manage", href: "/manage", icon: Grid },
];

const MobileNav = () => {
  const pathname = usePathname();
  const [hasLeads, setHasLeads] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const since = localStorage.getItem("lastSeenLeadsAt") ?? undefined;
    getLeads({ since }).then((d) => setHasLeads((d.count ?? 0) > 0)).catch(() => {});
  }, []);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`relative h-full flex flex-col items-center justify-center gap-1 active:bg-ink-50 transition-colors ${
                  active ? "text-forest-700 font-semibold" : "text-ink-500"
                }`}
              >
                <item.icon className="size-[22px]" />
                {item.badge && hasLeads && (
                  <span className="absolute top-2 right-[calc(50%-16px)] h-2 w-2 rounded-full bg-forest-400" />
                )}
                <span className="text-[12px] leading-4">{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileNav;
```

- [ ] **Step 2: Update `app/(dashboard)/layout.tsx`**

Read the existing file. Replace its body so it composes Sidebar + main + MobileNav:

```tsx
import Sidebar from "@/components/shared/Sidebar";
import MobileNav from "@/components/shared/MobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-paper">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
```

- [ ] **Step 3: Delete `BottomNav.tsx`**

```bash
git rm components/shared/BottomNav.tsx
```

(Confirm with `grep -r "BottomNav" --include='*.tsx'` that nothing else imports it — if anything does, that import must be removed in the same commit.)

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run build
```

Both clean. Load `/` in dev. Resize between desktop (sidebar) and mobile (bottom nav). Tap each nav, ensure navigation works.

- [ ] **Step 5: Commit**

```bash
git add components/shared/MobileNav.tsx app/\(dashboard\)/layout.tsx
git commit -m "feat(design): MobileNav for mobile + dashboard layout shell with paper bg"
```

```json:metadata
{"files": ["preorder/components/shared/MobileNav.tsx", "preorder/app/(dashboard)/layout.tsx", "preorder/components/shared/BottomNav.tsx"], "verifyCommand": "npm run build", "acceptanceCriteria": ["MobileNav fixed bottom with 5 items", "Sidebar shows on md+, MobileNav shows below md", "dashboard bg is paper", "Leads dot indicator shows when leads > 0", "old BottomNav.tsx deleted"], "requiresUserVerification": false}
```


## Task 5: TopNav + auth pages split-screen

**Goal:** Build the TopNav component (3 variants — minimal / storefront / silent) and apply the split-screen layout to login, register, forgot-password.

**Files:**
- Create: `preorder/components/shared/TopNav.tsx`
- Modify: `preorder/app/(auth)/layout.tsx`
- Modify: `preorder/app/(auth)/login/page.tsx`, `preorder/app/(auth)/register/page.tsx`, `preorder/app/(auth)/forgot-password/page.tsx`

**Acceptance Criteria:**
- [ ] TopNav: `variant` prop accepts `"minimal" | "storefront" | "silent"`; renders sticky top header `h-14 md:h-16 bg-paper/80 backdrop-blur border-b border-border`; left wordmark; right link slot
- [ ] Auth layout uses TopNav minimal variant; right side shows "New here? Create account" → `/register` from `/login` (and inverse on `/register`)
- [ ] Login page: split-screen on `lg+`. LEFT (max-w-md mx-auto px-10 py-16): eyebrow "SIGN IN", display-xl title, body-lg description, form, "Create account" link. RIGHT (`bg-forest-700 text-forest-50 p-12 hidden lg:flex flex-col justify-end min-h-screen`): eyebrow "BUZZMART", display-2xl headline "Sell more, stress less.", body-lg supporting text
- [ ] Register and forgot-password follow the same split-screen pattern with different copy
- [ ] Existing form behavior preserved — same submit handlers, same actions
- [ ] `npx tsc --noEmit` clean

**Verify:** Load `/login`, `/register`, `/forgot-password`. Each shows split-screen on desktop, single column on mobile. Form submit flows still work (test register → setup wizard).

**Steps:**

- [ ] **Step 1: Create `components/shared/TopNav.tsx`**

```tsx
"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopNavProps {
  variant?: "minimal" | "storefront" | "silent";
  rightSlot?: React.ReactNode;
  centerSlot?: React.ReactNode;
  className?: string;
}

const TopNav = ({ variant = "minimal", rightSlot, centerSlot, className }: TopNavProps) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-14 md:h-16 bg-paper/80 backdrop-blur border-b border-border",
        className
      )}
    >
      <div className="h-full mx-auto max-w-7xl px-6 md:px-10 flex items-center justify-between gap-6">
        <Link href="/" className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
          Buzzmart
        </Link>
        {variant === "storefront" && centerSlot && (
          <div className="hidden md:flex flex-1 justify-center max-w-md">{centerSlot}</div>
        )}
        {variant !== "silent" && rightSlot && (
          <div className="flex items-center gap-3">{rightSlot}</div>
        )}
      </div>
    </header>
  );
};

export default TopNav;
export { TopNav };
```

- [ ] **Step 2: Update `app/(auth)/layout.tsx`**

```tsx
import TopNav from "@/components/shared/TopNav";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <TopNav
        variant="minimal"
        rightSlot={
          <Link href="/register" className="text-[13px] font-medium text-ink-500 hover:text-foreground">
            New here? <span className="text-forest-500 underline-offset-4 hover:underline">Create account</span>
          </Link>
        }
      />
      <div className="flex-1 flex">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Update `app/(auth)/login/page.tsx`**

Read the existing file. Wrap its current form JSX in the split-screen layout. The submit handler, form schema, and effects stay; only the surrounding markup changes:

```tsx
// ... existing imports stay ...
import { Eyebrow } from "@/components/ui/eyebrow";

export default function Login() {
  // ... existing hooks + handlers stay ...

  return (
    <div className="flex-1 grid lg:grid-cols-2">
      <section className="px-6 md:px-12 py-12 md:py-20 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Eyebrow className="block mb-3">SIGN IN</Eyebrow>
          <h1 className="text-[44px] leading-[52px] font-bold tracking-[-0.02em] text-foreground">Welcome back</h1>
          <p className="mt-3 text-[17px] leading-[26px] text-muted-foreground">
            Sign in to manage your store and respond to your customers.
          </p>

          {/* EXISTING <Form> ... </Form> goes here, with mt-8 wrapper */}
          <div className="mt-8">
            {/* …current form JSX… */}
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[12px] text-ink-500">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <p className="mt-6 text-[14px] text-ink-500">
            New here?{" "}
            <Link href="/register" className="text-forest-500 font-semibold hover:underline underline-offset-4">
              Create account
            </Link>
          </p>
        </div>
      </section>

      <aside className="hidden lg:flex bg-forest-700 text-forest-50 p-12 flex-col justify-end min-h-[calc(100vh-4rem)]">
        <Eyebrow tone="accent" className="block text-forest-400 mb-4">BUZZMART</Eyebrow>
        <h2 className="text-[56px] leading-[64px] font-bold tracking-[-0.02em] text-white">
          Sell more,<br />stress less.
        </h2>
        <p className="mt-6 text-[17px] leading-[26px] text-forest-50/80 max-w-md">
          Shareable storefronts, lead capture, orders via WhatsApp. Everything your store needs in one place.
        </p>
      </aside>
    </div>
  );
}
```

- [ ] **Step 4: Update `app/(auth)/register/page.tsx`**

Same pattern. Differences:
- Left eyebrow: "GET STARTED", title: "Create your store", description: "Start selling in minutes."
- Right column copy is identical to login (marketing message stays consistent).
- Bottom link reads "Already have an account? Sign in" → `/login`.

- [ ] **Step 5: Update `app/(auth)/forgot-password/page.tsx`**

Same pattern. Differences:
- Left eyebrow: "RESET PASSWORD", title: "Forgot your password?", description: "Enter your email and we'll send you a reset link."
- Single email field + submit button.
- Bottom link reads "Remember it? Sign in" → `/login`.

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
npm run build
```

Load `/login`, `/register`, `/forgot-password` at desktop + mobile widths. Submit register form, verify it advances to `/setup`.

- [ ] **Step 7: Commit**

```bash
git add components/shared/TopNav.tsx app/\(auth\)/
git commit -m "feat(design): TopNav + split-screen auth pages"
```

```json:metadata
{"files": ["preorder/components/shared/TopNav.tsx", "preorder/app/(auth)/layout.tsx", "preorder/app/(auth)/login/page.tsx", "preorder/app/(auth)/register/page.tsx", "preorder/app/(auth)/forgot-password/page.tsx"], "verifyCommand": "npm run build", "acceptanceCriteria": ["TopNav supports minimal/storefront/silent variants", "auth pages use split-screen on lg+, single column on mobile", "form submit behavior preserved"], "requiresUserVerification": false}
```

## Task 6: Setup wizard — progress + cards + sticky action bar

**Goal:** Rebuild the 3-step setup wizard chrome — progress bar at top, eyebrow-headed Card sections for form fields, sticky bottom action bar. Step 2 keeps the existing SlugInput auto-suggest behavior from the share-links work.

**Files:**
- Create: `preorder/components/setup/ProgressBar.tsx`
- Modify: `preorder/app/(setup)/setup/page.tsx`
- Modify: `preorder/components/setup/PersonalDetails.tsx`, `BussinessDetails.tsx`, `BankDetails.tsx`

**Acceptance Criteria:**
- [ ] ProgressBar: 3 dots + connecting 2px line; current dot solid `forest-700` + 4px ring; past dots filled `forest-400`; future dots outline `ink-200`; step names below each dot (caption weight 600, current step in `forest-700`)
- [ ] `/setup` page: TopNav minimal; ProgressBar; container `max-w-2xl mx-auto py-12 px-6`; eyebrow + display-lg title + description; form sections rendered inside `<Card variant="flat">` with eyebrow heading + gap-8 between cards
- [ ] Sticky action bar: `border-t border-border bg-paper/95 backdrop-blur sticky bottom-0 py-4 px-6`; Back (left) + Continue (right) buttons
- [ ] PersonalDetails / BussinessDetails / BankDetails wrap their existing fields in `<Card variant="flat">` with `<Eyebrow>` headings; existing logic preserved
- [ ] SlugInput integration on step 2 preserved
- [ ] `npx tsc --noEmit` clean

**Verify:** Walk through register → setup. Each step displays new chrome. Progress bar advances correctly. Slug auto-fill still works on step 2.

**Steps:**

- [ ] **Step 1: Create `components/setup/ProgressBar.tsx`**

```tsx
"use client";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number; // 1, 2, or 3
}

const steps = [
  { id: 1, name: "Personal" },
  { id: 2, name: "Business" },
  { id: 3, name: "Bank" },
];

const ProgressBar = ({ current }: ProgressBarProps) => {
  return (
    <div className="w-full bg-paper border-b border-border py-6 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Connecting line behind dots */}
          <div className="absolute left-[12px] right-[12px] top-[10px] h-[2px] bg-ink-200" />
          {steps.map((step) => {
            const state = step.id < current ? "past" : step.id === current ? "current" : "future";
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 bg-paper px-2">
                <div
                  className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center transition-colors duration-150",
                    state === "past" && "bg-forest-400",
                    state === "current" && "bg-forest-700 ring-4 ring-forest-100",
                    state === "future" && "bg-paper border-2 border-ink-200"
                  )}
                >
                  {state === "past" && (
                    <svg viewBox="0 0 20 20" className="size-3 text-white" fill="currentColor">
                      <path d="M7.629 14.566L3.428 10.365l1.414-1.415 2.787 2.787 7.529-7.529 1.414 1.414z" />
                    </svg>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[12px] font-semibold tracking-[0.02em]",
                    state === "current" ? "text-forest-700" : "text-ink-500"
                  )}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
```

- [ ] **Step 2: Refactor `app/(setup)/setup/page.tsx`**

Replace the existing arrow-button row at top with `<ProgressBar current={currentStep} />`. Wrap each step component in the new container:

```tsx
"use client";
import { useState } from "react";
import React from "react";
import LoadingModal from "@/components/shared/LoadingModal";
import ProgressBar from "@/components/setup/ProgressBar";
import { Eyebrow } from "@/components/ui/eyebrow";
import PersonalDetails from "@/components/setup/PersonalDetails";
import BussinessDetails from "@/components/setup/BussinessDetails";
import BankDetails from "@/components/setup/BankDetails";
// ... existing imports for getAllbanks, useEffect, banks state ...

const stepCopy = {
  1: { eyebrow: "STEP 1 OF 3", title: "Tell us about you", desc: "We use this to set up your merchant account." },
  2: { eyebrow: "STEP 2 OF 3", title: "Your store identity", desc: "How customers will find and recognize you." },
  3: { eyebrow: "STEP 3 OF 3", title: "Bank details", desc: "So you can receive payments from your orders." },
};

const Setup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  // ... existing banks state + getData effect ...

  if (isLoading) return <LoadingModal message="Setting up for you..." />;

  const copy = stepCopy[currentStep as 1 | 2 | 3];

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* TopNav minimal lives in (setup)/layout if you create one; or inline here */}
      <ProgressBar current={currentStep} />

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 pb-32">
        <Eyebrow className="block mb-2">{copy.eyebrow}</Eyebrow>
        <h1 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-foreground">
          {copy.title}
        </h1>
        <p className="mt-2 text-[17px] leading-[26px] text-muted-foreground">{copy.desc}</p>

        <div className="mt-8 flex flex-col gap-8">
          {currentStep === 1 && <PersonalDetails setCurrentStep={setCurrentStep} />}
          {currentStep === 2 && <BussinessDetails setCurrentStep={setCurrentStep} />}
          {currentStep === 3 && (
            <BankDetails isLoading={isLoading} setIsLoading={setIsLoading} banks={banks} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Setup;
```

(The sticky action bar lives inside each step component so it can hold the form's submit. PersonalDetails / BussinessDetails / BankDetails each render their own Continue button in the sticky bar — see Step 3.)

- [ ] **Step 3: Update each step component to use Card variant="flat" sections + sticky bottom action**

For each of `PersonalDetails.tsx`, `BussinessDetails.tsx`, `BankDetails.tsx`:

1. Group related fields into `<Card variant="flat">` blocks with `<Eyebrow>` headings (e.g. "PERSONAL DETAILS", "STORE IDENTITY", "BANK DETAILS").
2. Replace any inline-styled labels with the new `<Label>` (already updated in Task 1).
3. Move the existing submit button into a sticky bottom action bar:

```tsx
<div className="fixed left-0 right-0 bottom-0 md:left-64 bg-paper/95 backdrop-blur border-t border-border py-4 px-6">
  <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
    {/* Back button only on step 2+ */}
    <Button type="button" variant="ghost" onClick={() => setCurrentStep((c) => c - 1)}>Back</Button>
    <Button type="submit" disabled={!canContinue}>Continue →</Button>
  </div>
</div>
```

Existing handlers and the SlugInput integration in BussinessDetails stay verbatim.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run build
```

Walk register → setup. Each step renders new chrome. Submit each step. Slug auto-fill on step 2 still works.

- [ ] **Step 5: Commit**

```bash
git add app/\(setup\)/ components/setup/
git commit -m "feat(design): setup wizard — progress bar, flat-card sections, sticky action bar"
```

```json:metadata
{"files": ["preorder/components/setup/ProgressBar.tsx", "preorder/app/(setup)/setup/page.tsx", "preorder/components/setup/PersonalDetails.tsx", "preorder/components/setup/BussinessDetails.tsx", "preorder/components/setup/BankDetails.tsx"], "verifyCommand": "npm run build", "acceptanceCriteria": ["3-dot progress bar with past/current/future states", "step pages use Card variant=flat sections with eyebrow headings", "sticky bottom action bar with Back + Continue", "slug auto-fill preserved on step 2"], "requiresUserVerification": false}
```


## Task 7: Dashboard home rebuild

**Goal:** Replace the existing dashboard home with a stat row + activity feed + top products layout. Build the three supporting components: StatCard, RecentActivity, TopProductsList.

**Files:**
- Create: `preorder/components/dashboard/StatCard.tsx`
- Create: `preorder/components/dashboard/RecentActivity.tsx`
- Create: `preorder/components/dashboard/TopProductsList.tsx`
- Modify: `preorder/app/(dashboard)/page.tsx`

**Acceptance Criteria:**
- [ ] StatCard: takes `eyebrow`, `value`, `caption`; uses Card variant="elevated"; big number `display-lg` weight 700 `ink-900`; eyebrow above; caption below in `body-sm ink-500`. v1 ships without trend deltas.
- [ ] RecentActivity: takes optional `events` prop (defaults to fetched list); each row icon + one-line title + relative time; clicks navigate to the relevant detail
- [ ] TopProductsList: takes optional `products` prop; small list of 4–5 products with thumb + name + clicks/orders
- [ ] Dashboard `page.tsx`: PageHeader (eyebrow "GOOD MORNING", title = `user.fullName.split(" ")[0]`, description "Here's what's happening with your store today."); 4-col stat grid; 2-col layout below (activity 2/3, products 1/3) on `lg+`, stack on mobile
- [ ] Stats fetched from existing endpoints: `getStoreShareStats()` for share-link counts, `getLeads()` for lead count, `getIncomingOrders()` for orders count. Loading: Skeleton placeholders. Errors silent.
- [ ] `npx tsc --noEmit` clean

**Verify:** Log in as the smoke merchant. Dashboard shows stats with real counts. Activity feed shows recent events. Top products show share-stats for product links.

**Steps:**

- [ ] **Step 1: Create `components/dashboard/StatCard.tsx`**

```tsx
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";

interface StatCardProps {
  eyebrow: string;
  value: string | number;
  caption?: string;
  loading?: boolean;
}

const StatCard = ({ eyebrow, value, caption, loading }: StatCardProps) => (
  <Card variant="elevated">
    <Eyebrow className="block">{eyebrow}</Eyebrow>
    <div className="mt-3 text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-foreground">
      {loading ? "—" : value}
    </div>
    {caption && <div className="mt-1 text-[13px] text-muted-foreground">{caption}</div>}
  </Card>
);

export default StatCard;
```

- [ ] **Step 2: Create `components/dashboard/RecentActivity.tsx`**

```tsx
"use client";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Users, MousePointerClick } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLeads, getStoreShareStats } from "@/actions/share-links.actions";
import { getIncomingOrders } from "@/actions/orders.actions";

type ActivityKind = "order" | "lead" | "click";
interface Activity {
  kind: ActivityKind;
  title: string;
  href: string;
  at: string;
}

const iconFor = (k: ActivityKind) => k === "order" ? Package : k === "lead" ? Users : MousePointerClick;

const RecentActivity = () => {
  const [items, setItems] = useState<Activity[] | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      getIncomingOrders().then((r) => r.data.orders ?? []).catch(() => []),
      getLeads({}).then((d) => d.results ?? []).catch(() => []),
      getStoreShareStats().then((s) => s.recent_clicks ?? []).catch(() => []),
    ]).then(([ordersR, leadsR, clicksR]) => {
      if (!alive) return;
      const orders = (ordersR.status === "fulfilled" ? ordersR.value : []).slice(0, 5).map((o: any) => ({
        kind: "order" as const,
        title: `Order from ${o.customer_name || "a customer"}`,
        href: `/orders`,
        at: o.created_at ?? "",
      }));
      const leads = (leadsR.status === "fulfilled" ? leadsR.value : []).slice(0, 5).map((l: any) => ({
        kind: "lead" as const,
        title: `${l.name || "New lead"} (${l.wa_number})`,
        href: `/leads`,
        at: l.first_seen_at ?? "",
      }));
      const clicks = (clicksR.status === "fulfilled" ? clicksR.value : []).slice(0, 5).map((c: any) => ({
        kind: "click" as const,
        title: c.lead?.name ? `${c.lead.name} viewed your store` : "Anonymous click on your store",
        href: `/leads`,
        at: c.occurred_at ?? "",
      }));
      const merged = [...orders, ...leads, ...clicks].sort((a, b) => (b.at > a.at ? 1 : -1)).slice(0, 8);
      setItems(merged);
    });
    return () => { alive = false; };
  }, []);

  return (
    <Card>
      <Eyebrow className="block">RECENT ACTIVITY</Eyebrow>
      <ul className="mt-4 flex flex-col divide-y divide-border">
        {items === null && (
          <>
            <li className="py-3"><Skeleton className="h-4 w-3/4" /></li>
            <li className="py-3"><Skeleton className="h-4 w-1/2" /></li>
            <li className="py-3"><Skeleton className="h-4 w-2/3" /></li>
          </>
        )}
        {items?.length === 0 && (
          <li className="py-6 text-center text-[14px] text-muted-foreground">No activity yet — share your store on WhatsApp to get started.</li>
        )}
        {items?.map((item, i) => {
          const Icon = iconFor(item.kind);
          return (
            <li key={i}>
              <Link href={item.href} className="py-3 flex items-center gap-3 hover:bg-ink-50 -mx-3 px-3 rounded-md transition-colors">
                <div className="size-8 rounded-md bg-forest-50 text-forest-700 flex items-center justify-center"><Icon className="size-4" /></div>
                <span className="text-[15px] text-foreground flex-1 truncate">{item.title}</span>
                <span className="text-[12px] text-muted-foreground whitespace-nowrap">{relTime(item.at)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

const relTime = (iso: string): string => {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default RecentActivity;
```

- [ ] **Step 3: Create `components/dashboard/TopProductsList.tsx`**

```tsx
"use client";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getuserProducts } from "@/actions/products.actions";

const TopProductsList = () => {
  const [products, setProducts] = useState<any[] | null>(null);
  useEffect(() => {
    let alive = true;
    getuserProducts()
      .then((r) => { if (alive && Array.isArray(r.data)) setProducts(r.data.slice(0, 5)); })
      .catch(() => { if (alive) setProducts([]); });
    return () => { alive = false; };
  }, []);

  return (
    <Card>
      <Eyebrow className="block">TOP PRODUCTS</Eyebrow>
      <ul className="mt-4 flex flex-col gap-3">
        {products === null && (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        )}
        {products?.length === 0 && (
          <li className="py-3 text-[14px] text-muted-foreground">No products yet.</li>
        )}
        {products?.map((p) => (
          <li key={p.id}>
            <Link href={`/marketplace/product/${p.id}`} className="flex items-center gap-3 -mx-2 px-2 py-2 rounded-md hover:bg-ink-50 transition-colors">
              <div className="size-12 rounded-md bg-ink-100 overflow-hidden relative shrink-0">
                {p.images?.[0]?.image_url || p.image_url ? (
                  <Image src={p.images?.[0]?.image_url ?? p.image_url} alt={p.name} fill className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-foreground truncate">{p.name}</div>
                <div className="text-[12px] text-muted-foreground">₦{p.price}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default TopProductsList;
```

- [ ] **Step 4: Replace `app/(dashboard)/page.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TopProductsList from "@/components/dashboard/TopProductsList";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/zustand";
import Link from "next/link";
import { getIncomingOrders } from "@/actions/orders.actions";
import { getLeads, getStoreShareStats } from "@/actions/share-links.actions";

const Dashboard = () => {
  const user = useUserStore((s) => s.user);
  const firstName = (user?.fullName ?? "there").split(" ")[0];

  const [orders, setOrders] = useState<number | null>(null);
  const [leads, setLeads] = useState<number | null>(null);
  const [clicks, setClicks] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    getIncomingOrders().then((r) => alive && setOrders(r.data.count ?? 0)).catch(() => alive && setOrders(0));
    getLeads({}).then((d) => alive && setLeads(d.count ?? 0)).catch(() => alive && setLeads(0));
    getStoreShareStats().then((s) => alive && setClicks(s.total_clicks ?? 0)).catch(() => alive && setClicks(0));
    return () => { alive = false; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        eyebrow="GOOD MORNING"
        title={firstName}
        description="Here's what's happening with your store today."
        actions={
          <Link href="/marketplace"><Button>+ New product</Button></Link>
        }
      />

      <section className="px-6 md:px-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard eyebrow="ORDERS" value={orders ?? "—"} caption="incoming" loading={orders === null} />
        <StatCard eyebrow="LEADS" value={leads ?? "—"} caption="captured" loading={leads === null} />
        <StatCard eyebrow="CLICKS" value={clicks ?? "—"} caption="on your store" loading={clicks === null} />
        <StatCard eyebrow="SHARE LINKS" value={1} caption="active store link" />
      </section>

      <section className="px-6 md:px-10 grid lg:grid-cols-3 gap-6 pb-12">
        <div className="lg:col-span-2"><RecentActivity /></div>
        <div className="lg:col-span-1"><TopProductsList /></div>
      </section>
    </div>
  );
};

export default Dashboard;
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
npm run build
```

Log in as `smoke@x.com`, load `/`. Confirm stat row shows counts, activity feed shows recent leads/orders, top products lists Smoke Test Phone.

- [ ] **Step 6: Commit**

```bash
git add components/dashboard/ app/\(dashboard\)/page.tsx
git commit -m "feat(design): dashboard home — stat row, activity feed, top products"
```

```json:metadata
{"files": ["preorder/components/dashboard/StatCard.tsx", "preorder/components/dashboard/RecentActivity.tsx", "preorder/components/dashboard/TopProductsList.tsx", "preorder/app/(dashboard)/page.tsx"], "verifyCommand": "npm run build", "acceptanceCriteria": ["StatCard + RecentActivity + TopProductsList created", "dashboard home composes them", "data fetched from existing endpoints with skeleton loading + silent error fallback"], "requiresUserVerification": false}
```

## Task 8: Marketplace + product detail + ProductCard

**Goal:** Apply new tokens + PageHeader to marketplace pages. Redesign the shared ProductCard to match the spec (square image, name, price, store name, hover scale).

**Files:**
- Modify: `preorder/components/shared/ProductCard.tsx`
- Modify: `preorder/app/(dashboard)/marketplace/page.tsx`
- Modify: `preorder/app/(dashboard)/marketplace/product/[id]/page.tsx`

**Acceptance Criteria:**
- [ ] ProductCard: `<Card variant="flat">` with square image (aspect-square object-cover overflow-hidden); name `heading-3 line-clamp-2`; price `heading-2 weight-700 text-forest-700`; store name link `caption text-ink-500`; hover scales image 1.02 over 250ms; card shadow elevates to `md`
- [ ] Marketplace page: PageHeader (eyebrow "MARKETPLACE", title "Your products", description showing item count); grid `2 / 3 / 4` cols
- [ ] Marketplace product detail: PageHeader (eyebrow "PRODUCT", title = product.name) at top; existing SharePanel preserved below; rest of the layout token-swept (no structural rewrite)
- [ ] `npx tsc --noEmit` clean

**Verify:** Load `/marketplace` with the smoke account — products render in the new card style. Click into a product — share panel renders correctly underneath the new page header.

**Steps:**

- [ ] **Step 1: Replace `components/shared/ProductCard.tsx`**

```tsx
"use client";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: number;
  name: string;
  price?: string | number;
  image_url?: string;
  storeName?: string;
  storeHref?: string;
  href?: string;
}

const ProductCard = ({ id, name, price, image_url, storeName, storeHref, href }: ProductCardProps) => {
  const target = href ?? `/marketplace/product/${id}`;
  return (
    <Link href={target} className="group block">
      <Card variant="flat" padding="none" className="overflow-hidden">
        <div className="relative aspect-square w-full bg-ink-100 overflow-hidden">
          {image_url && (
            <Image
              src={image_url}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          )}
        </div>
        <div className="p-4">
          <div className="text-[18px] leading-[26px] font-semibold text-foreground line-clamp-2 min-h-[52px]">
            {name}
          </div>
          {price !== undefined && (
            <div className="mt-1 text-[22px] leading-[30px] font-bold text-forest-700 tracking-[-0.005em]">
              ₦{price}
            </div>
          )}
          {storeName && (
            <Link
              href={storeHref ?? "#"}
              className="mt-1 block text-[12px] font-medium tracking-[0.02em] text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              {storeName}
            </Link>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
```

- [ ] **Step 2: Update `app/(dashboard)/marketplace/page.tsx`**

Replace the top section with `<PageHeader>` + `ProductCard` grid. Existing data-fetching stays.

```tsx
// at top
import PageHeader from "@/components/shared/PageHeader";
import ProductCard from "@/components/shared/ProductCard";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Store, Plus } from "lucide-react";

// inside the return, REPLACE the existing header + grid with:
<div className="max-w-7xl mx-auto">
  <PageHeader
    eyebrow="MARKETPLACE"
    title="Your products"
    description={products.length > 0 ? `${products.length} item${products.length === 1 ? "" : "s"}` : "Add your first product to start selling."}
    actions={
      <Button onClick={() => setOpenDialog(true)}><Plus className="size-4" /> New product</Button>
    }
  />

  <section className="px-6 md:px-10 pb-12">
    {products.length === 0 ? (
      <EmptyState
        icon={<Store />}
        title="No products yet"
        description="Add your first product to start selling and sharing on WhatsApp."
        action={<Button onClick={() => setOpenDialog(true)}>Add product</Button>}
      />
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            price={p.price}
            image_url={p.images?.[0]?.image_url ?? p.image_url}
          />
        ))}
      </div>
    )}
  </section>

  <CreateProduct open={openDialog} setOpen={setOpenDialog} />
</div>
```

(Keep the existing `useEffect`, `useState`, and `CreateProduct` imports.)

- [ ] **Step 3: Update `app/(dashboard)/marketplace/product/[id]/page.tsx`**

Add a `<PageHeader>` at the top with the product name; leave SharePanel and the existing edit/image-management UI in place. Token-only sweep otherwise — replace any `#27BA5F` / `#F0F0F0` / `#03140A80` literals with `forest-*` / `ink-*` classes, and `rounded-2xl` → `rounded-lg`, `rounded-[12px]` → `rounded-md`.

```tsx
// add at top
import PageHeader from "@/components/shared/PageHeader";

// inside the return, REPLACE the existing <Navbar ... /> at the top with:
<PageHeader
  eyebrow="PRODUCT"
  title={product?.name ?? "Loading…"}
  description={product?.price ? `₦${product.price}` : undefined}
  actions={
    <>
      <Button variant="outline" onClick={() => setOpenDialog(true)}>Edit</Button>
      {/* keep existing archive/delete buttons */}
    </>
  }
/>
// Then keep the existing layout body (share panel + image gallery + details)
// with token-only style updates (e.g. rounded-[12px] → rounded-md, color hex → tokens)
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run build
```

Load `/marketplace` and `/marketplace/product/<smoke-product-id>`. ProductCards render with new style. Product detail shows new header + existing SharePanel.

- [ ] **Step 5: Commit**

```bash
git add components/shared/ProductCard.tsx app/\(dashboard\)/marketplace/
git commit -m "feat(design): marketplace + product detail — ProductCard + PageHeader"
```

```json:metadata
{"files": ["preorder/components/shared/ProductCard.tsx", "preorder/app/(dashboard)/marketplace/page.tsx", "preorder/app/(dashboard)/marketplace/product/[id]/page.tsx"], "verifyCommand": "npm run build", "acceptanceCriteria": ["ProductCard redesigned per spec", "marketplace uses PageHeader + EmptyState + new grid", "product detail uses PageHeader + preserved SharePanel"], "requiresUserVerification": false}
```

## Task 9: Orders + Leads + Manage polish

**Goal:** Tokens + chrome sweep for orders, leads, and manage pages. Orders gets underline tabs + eyebrow date sections + Card rows. Leads uses EmptyState + LeadRow polish. Manage keeps its tabs structure but inherits new tokens.

**Files:**
- Modify: `preorder/app/(dashboard)/orders/page.tsx`
- Modify: `preorder/app/(dashboard)/leads/page.tsx`
- Modify: `preorder/components/leads/LeadRow.tsx`
- Modify: `preorder/app/(dashboard)/manage/page.tsx`
- Modify: `preorder/components/manage/Account.tsx`, `Bussiness.tsx`, `Payment.tsx`, `Dispatch.tsx`, `StoreLink.tsx`, `Category.tsx`

**Acceptance Criteria:**
- [ ] Orders page: PageHeader + Tabs (underline variant) for Incoming / Accepted / Shipped / Declined. Date sections use `<Eyebrow>` headings. Each order row is a `<Card>` with consistent action buttons.
- [ ] Leads page: PageHeader + search input. Empty state uses `<EmptyState>` component. Lead rows use the new Card style. Drawer uses Sheet (already updated in Task 1).
- [ ] LeadRow: Card padding `p-4`; name + WA in `heading-3`; counts + last-seen in `body-sm text-ink-500`; status chip uses `<Badge>` with success/danger/info variants per status
- [ ] Manage page: existing pill tabs preserved. Each tab body's hex colors replaced with tokens (e.g. `#27BA5F` → `forest-500`, `#F0F0F0` → `ink-100`, `#03140A80` → `ink-500`).
- [ ] `npx tsc --noEmit` clean; smoke checklist from share-links spec still passes for the leads + manage flows.

**Verify:** Walk `/orders`, `/leads`, `/manage`. Each page uses new chrome. Tab switching works. Leads inbox shows live data. Manage tabs all submit forms successfully.

**Steps:**

- [ ] **Step 1: Update `app/(dashboard)/orders/page.tsx`**

At the top, add `<PageHeader>`. Replace any handmade tab UI with shadcn `<Tabs variant="underline">`. For date groupings, replace plain `<h2>` with `<Eyebrow>`. Each order row swaps from raw `div` to `<Card>` with new style.

```tsx
// near top:
import PageHeader from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Card } from "@/components/ui/card";

// inside the return, wrap content:
<div className="max-w-7xl mx-auto">
  <PageHeader
    eyebrow="ORDERS"
    title="Your orders"
    description="Manage incoming orders and dispatch."
  />

  <Tabs defaultValue="incoming" className="px-6 md:px-10">
    <TabsList variant="underline">
      <TabsTrigger value="incoming" variant="underline">Incoming</TabsTrigger>
      <TabsTrigger value="accepted" variant="underline">Accepted</TabsTrigger>
      <TabsTrigger value="shipped" variant="underline">Shipped</TabsTrigger>
      <TabsTrigger value="declined" variant="underline">Declined</TabsTrigger>
    </TabsList>

    <TabsContent value="incoming" className="mt-6 flex flex-col gap-6">
      {Object.entries(groupedIncoming).map(([date, list]) => (
        <section key={date}>
          <Eyebrow className="block mb-3">{date}</Eyebrow>
          <div className="flex flex-col gap-3">
            {list.map((order: any) => (
              <Card key={order.id} padding="compact" className="flex items-center justify-between gap-4">
                {/* existing order summary inside */}
              </Card>
            ))}
          </div>
        </section>
      ))}
    </TabsContent>
    {/* repeat for accepted / shipped / declined */}
  </Tabs>
</div>
```

(Existing data fetching, accept/decline handlers, and dialogs stay verbatim — just the visual wrapper changes.)

- [ ] **Step 2: Update `app/(dashboard)/leads/page.tsx`**

Add PageHeader + EmptyState:

```tsx
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Users } from "lucide-react";

// inside return:
<div className="max-w-7xl mx-auto">
  <PageHeader
    eyebrow="LEADS"
    title="Your leads"
    description={`${count} lead${count === 1 ? "" : "s"} · sorted by most recent`}
    actions={
      <Input
        aria-label="Search leads by phone number"
        className="max-w-xs"
        placeholder="Search 080…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />
    }
  />

  <section className="px-6 md:px-10 pb-12">
    {leads.length === 0 ? (
      <EmptyState
        icon={<Users />}
        title="No leads yet"
        description="Share your store or product links on WhatsApp to start collecting leads."
        action={<Button onClick={copyStoreLink}>Copy store link</Button>}
      />
    ) : (
      <div className="flex flex-col gap-3">
        {leads.map((l) => (<LeadRow key={l.id} lead={l} onViewActivity={setActivityLeadId} />))}
      </div>
    )}
    {/* keep existing pagination buttons */}
  </section>

  <LeadActivityDrawer leadId={activityLeadId} onClose={() => setActivityLeadId(null)} />
</div>
```

- [ ] **Step 3: Update `components/leads/LeadRow.tsx`**

Replace the inline-styled row with `<Card padding="compact">`:

```tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import type { LeadListItem } from "@/types/api";

const formatRelative = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const LeadRow = ({ lead, onViewActivity }: { lead: LeadListItem; onViewActivity: (id: number) => void }) => (
  <Card padding="compact" className="flex items-center justify-between gap-4">
    <div className="min-w-0 flex-1">
      <div className="text-[18px] leading-[26px] font-semibold text-foreground truncate">
        {lead.name || "Unknown name"} <span className="text-muted-foreground font-normal">({lead.wa_number})</span>
      </div>
      <div className="mt-1 text-[13px] text-muted-foreground">
        First clicked {formatRelative(lead.first_seen_at)} · {lead.click_count} view{lead.click_count === 1 ? "" : "s"} ·{" "}
        {lead.order_count > 0 ? <Badge variant="success">{lead.order_count} order{lead.order_count === 1 ? "" : "s"}</Badge> : `${lead.order_count} orders`}
      </div>
      <div className="mt-1 text-[13px] text-muted-foreground">Last seen {formatRelative(lead.last_seen_at)}</div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <a href={lead.whatsapp_link} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm"><MessageCircle className="size-4" /> Chat</Button>
      </a>
      <Button variant="ghost" size="sm" onClick={() => onViewActivity(lead.id)}>View activity →</Button>
    </div>
  </Card>
);

export default LeadRow;
```

- [ ] **Step 4: Update Manage page + components**

For each of `Account.tsx`, `Bussiness.tsx`, `Payment.tsx`, `Dispatch.tsx`, `StoreLink.tsx`, `Category.tsx`: search/replace `#27BA5F` → `forest-500`, `#27BA5F1F` → `forest-100`, `#27BA5F33` → `forest-100`, `#1FA34E` → `forest-700`, `#F0F0F0` → `ink-100`, `#03140A80` → `ink-500`, `#ED2525` → `destructive`, `#E0D33D` → `warning`, `rounded-[12px]` → `rounded-md`, `rounded-[8px]` → `rounded-sm`.

For `app/(dashboard)/manage/page.tsx`, add `<PageHeader eyebrow="MANAGE" title="Settings" description="Your account, business, payment, and dispatch settings.">` at the top.

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
npm run build
```

Walk `/orders`, `/leads`, `/manage`. Each renders in new chrome. Test order accept/decline, lead chat link, slug-edit modal on manage.

- [ ] **Step 6: Commit**

```bash
git add app/\(dashboard\)/orders/ app/\(dashboard\)/leads/ app/\(dashboard\)/manage/ components/leads/ components/manage/
git commit -m "feat(design): orders/leads/manage — PageHeader + Card rows + token sweep"
```

```json:metadata
{"files": ["preorder/app/(dashboard)/orders/page.tsx", "preorder/app/(dashboard)/leads/page.tsx", "preorder/components/leads/LeadRow.tsx", "preorder/app/(dashboard)/manage/page.tsx", "preorder/components/manage/Account.tsx", "preorder/components/manage/Bussiness.tsx", "preorder/components/manage/Payment.tsx", "preorder/components/manage/Dispatch.tsx", "preorder/components/manage/StoreLink.tsx", "preorder/components/manage/Category.tsx"], "verifyCommand": "npm run build", "acceptanceCriteria": ["orders uses underline Tabs + Eyebrow date sections + Card rows", "leads uses PageHeader + EmptyState + Card LeadRows", "manage tabs preserve behavior with token-only sweep"], "requiresUserVerification": false}
```


## Task 10: Customer storefront — listing + merchant page

**Goal:** Editorial hero on `/store`, merchant hero + filtered grid on `/store/[storeId]`. Extend TopNav with the `storefront` variant.

**Files:**
- Modify: `preorder/app/store/page.tsx`
- Modify: `preorder/app/store/[storeId]/page.tsx`
- Modify: `preorder/app/store/layout.tsx` (create if absent)
- Modify: `preorder/components/shared/TopNav.tsx` (extend storefront variant copy)
- Create: `preorder/components/store/MerchantHero.tsx`
- Create: `preorder/components/store/CategoryGrid.tsx`

**Acceptance Criteria:**
- [ ] Store layout uses `<TopNav variant="storefront">` with search center slot + "Are you a merchant? Sign in →" right link
- [ ] `/store` page: hero band (eyebrow + display-2xl + body-lg + search), category chips, "Trending now" / "New arrivals" sections (ProductCard grid 2/3/4), category tile grid
- [ ] `/store/[storeId]` page: `<MerchantHero>` with merchant info + verified/location chips + Chat-on-WhatsApp / Copy-store-link actions; sticky filter bar; ProductCard grid
- [ ] CategoryGrid: 2-col mobile, 3+ desktop tiles with gradient bg `forest-700 → forest-900`, name + count
- [ ] Existing data fetching preserved
- [ ] `npx tsc --noEmit` clean

**Verify:** Anonymous browse `/store`. Hero band renders with search. Click a section → product detail. Drill into a merchant: hero + chips + grid show. Chat-WhatsApp button opens `wa.me`.

**Steps:**

- [ ] **Step 1: Update `app/store/layout.tsx`**

If the file doesn't exist, create it:

```tsx
import TopNav from "@/components/shared/TopNav";
import Link from "next/link";
import { Search } from "lucide-react";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <TopNav
        variant="storefront"
        centerSlot={
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-300" />
            <input
              placeholder="Search stores or products"
              className="w-full h-10 rounded-md bg-ink-100 border-0 pl-10 pr-3 text-[14px] placeholder:text-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-white"
            />
          </div>
        }
        rightSlot={
          <Link href="/login" className="text-[13px] font-medium text-ink-500 hover:text-foreground">
            Are you a merchant? <span className="text-forest-500">Sign in →</span>
          </Link>
        }
      />
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/store/CategoryGrid.tsx`**

```tsx
import Link from "next/link";

const categories = [
  { slug: "phones", name: "Phones", count: "120+" },
  { slug: "tablets", name: "Tablets", count: "40+" },
  { slug: "laptops", name: "Laptops", count: "60+" },
  { slug: "fashion", name: "Fashion", count: "200+" },
  { slug: "beauty", name: "Beauty", count: "80+" },
  { slug: "home", name: "Home", count: "55+" },
];

const CategoryGrid = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {categories.map((c) => (
      <Link
        key={c.slug}
        href={`/store?category=${c.slug}`}
        className="relative overflow-hidden rounded-lg p-6 h-40 flex flex-col justify-end bg-gradient-to-br from-forest-700 to-forest-900 text-white hover:from-forest-500 hover:to-forest-700 transition-colors duration-200"
      >
        <div className="text-[28px] leading-[36px] font-bold tracking-[-0.01em]">{c.name}</div>
        <div className="text-[13px] text-forest-50/70 mt-1">{c.count} products</div>
      </Link>
    ))}
  </div>
);

export default CategoryGrid;
```

- [ ] **Step 3: Rebuild `app/store/page.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { getAllProducts } from "@/actions/products.actions";
import ProductCard from "@/components/shared/ProductCard";
import CategoryGrid from "@/components/store/CategoryGrid";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Store = () => {
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    getAllProducts()
      .then((r) => Array.isArray(r.data) && setProducts(r.data))
      .catch(() => {});
  }, []);

  const trending = products.slice(0, 8);
  const newest = [...products].reverse().slice(0, 8);

  return (
    <main className="max-w-7xl mx-auto">
      <section className="px-6 md:px-10 py-12 md:py-16">
        <Eyebrow tone="accent" className="block mb-3">BUZZMART</Eyebrow>
        <h1 className="text-[44px] md:text-[56px] leading-[1.1] font-bold tracking-[-0.02em] text-foreground max-w-2xl">
          Discover stores you'll love.
        </h1>
        <p className="mt-4 text-[17px] leading-[26px] text-muted-foreground max-w-xl">
          Find products from merchants you can talk to directly. Every order is one tap to a real human on WhatsApp.
        </p>
        <div className="mt-8 max-w-xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-ink-300" />
          <input
            placeholder="Search products or stores"
            className="w-full h-14 rounded-md bg-ink-100 border-0 pl-12 pr-4 text-[16px] placeholder:text-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-white"
          />
        </div>
      </section>

      {trending.length > 0 && (
        <section className="px-6 md:px-10 py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <Eyebrow className="block mb-1">TRENDING NOW</Eyebrow>
              <h2 className="text-[28px] leading-[36px] font-bold tracking-[-0.01em] text-foreground">Most clicked this week</h2>
            </div>
            <Button variant="link" className="text-forest-500">See all →</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {trending.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                image_url={p.images?.[0]?.image_url ?? p.image_url}
                storeName={p.owner_email?.split("@")[0]}
                href={`/store/product/${p.id}`}
              />
            ))}
          </div>
        </section>
      )}

      {newest.length > 0 && (
        <section className="px-6 md:px-10 py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <Eyebrow className="block mb-1">NEW ARRIVALS</Eyebrow>
              <h2 className="text-[28px] leading-[36px] font-bold tracking-[-0.01em] text-foreground">Just listed</h2>
            </div>
            <Button variant="link" className="text-forest-500">See all →</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newest.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                image_url={p.images?.[0]?.image_url ?? p.image_url}
                href={`/store/product/${p.id}`}
              />
            ))}
          </div>
        </section>
      )}

      <section className="px-6 md:px-10 py-8 pb-16">
        <div className="mb-6">
          <Eyebrow className="block mb-1">BROWSE BY CATEGORY</Eyebrow>
          <h2 className="text-[28px] leading-[36px] font-bold tracking-[-0.01em] text-foreground">Categories</h2>
        </div>
        <CategoryGrid />
      </section>
    </main>
  );
};

export default Store;
```

- [ ] **Step 4: Create `components/store/MerchantHero.tsx`**

```tsx
"use client";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MapPin, Star, Copy } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Props {
  merchant: {
    business_name?: string | null;
    business_description?: string | null;
    display_picture?: string | null;
    store_url?: string | null;
    phone_number?: string | null;
    address?: string | null;
  };
}

const MerchantHero = ({ merchant }: Props) => {
  const copy = async () => {
    if (!merchant.store_url) return;
    try { await navigator.clipboard.writeText(merchant.store_url); toast.success("Store link copied"); } catch { /* ignore */ }
  };
  return (
    <section className="px-6 md:px-10 py-12 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start">
        <div className="md:col-span-2">
          <Eyebrow className="block mb-3">MERCHANT</Eyebrow>
          <h1 className="text-[36px] md:text-[44px] leading-[1.1] font-bold tracking-[-0.01em] text-foreground">
            {merchant.business_name ?? "This store"}
          </h1>
          {merchant.business_description && (
            <p className="mt-3 text-[17px] leading-[26px] text-muted-foreground line-clamp-3 max-w-xl">
              {merchant.business_description}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="success">Verified</Badge>
            {merchant.address && <Badge><MapPin className="size-3" /> {merchant.address}</Badge>}
            <Badge variant="info"><Star className="size-3" /> 4.8 · 123 orders</Badge>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {merchant.phone_number && (
              <a href={`https://wa.me/${merchant.phone_number.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener noreferrer">
                <Button><MessageCircle className="size-4" /> Chat on WhatsApp</Button>
              </a>
            )}
            <Button variant="outline" onClick={copy}><Copy className="size-4" /> Copy store link</Button>
          </div>
        </div>
        <div className="md:col-span-1">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-ink-100">
            {merchant.display_picture ? (
              <Image src={merchant.display_picture} alt={merchant.business_name ?? "Merchant"} fill className="object-cover" />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MerchantHero;
```

- [ ] **Step 5: Refactor `app/store/[storeId]/page.tsx`**

Replace existing body with `<MerchantHero>` + filter bar + product grid:

```tsx
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getStoreDetails } from "@/actions/products.actions";
import { toast } from "sonner";
import { errorMessage } from "@/lib/errors";
import MerchantHero from "@/components/store/MerchantHero";
import ProductCard from "@/components/shared/ProductCard";
import { Search } from "lucide-react";
import type { PublicStoreResponse } from "@/types/api";

const StoreDetails = () => {
  const slug = usePathname().split("/")[2];
  const [store, setStore] = useState<PublicStoreResponse>();
  const [query, setQuery] = useState("");

  useEffect(() => {
    getStoreDetails(slug).then((r) => setStore(r.data)).catch((e) => toast.error(errorMessage(e, "Could not load store.")));
  }, [slug]);

  if (!store) return null;

  const products = (store.products ?? []).filter((p: any) =>
    query ? p.name?.toLowerCase().includes(query.toLowerCase()) : true
  );

  return (
    <>
      <MerchantHero merchant={store.merchant ?? {}} />
      <div className="sticky top-14 md:top-16 z-30 bg-paper/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className="w-full h-10 rounded-md bg-ink-100 border-0 pl-10 pr-3 text-[14px] placeholder:text-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-white"
            />
          </div>
        </div>
      </div>
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p: any) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              image_url={p.images?.[0]?.image_url ?? p.image_url}
              href={`/store/product/${p.id}`}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default StoreDetails;
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
npm run build
```

Browse `/store` anonymously. Hero band renders. Click product → detail. Drill into a merchant via `/store/smoke-shop-friday` → MerchantHero + chips + actions show. Search box filters products.

- [ ] **Step 7: Commit**

```bash
git add app/store/ components/store/ components/shared/TopNav.tsx
git commit -m "feat(design): customer storefront — editorial hero, MerchantHero, CategoryGrid"
```

```json:metadata
{"files": ["preorder/app/store/page.tsx", "preorder/app/store/[storeId]/page.tsx", "preorder/app/store/layout.tsx", "preorder/components/store/MerchantHero.tsx", "preorder/components/store/CategoryGrid.tsx", "preorder/components/shared/TopNav.tsx"], "verifyCommand": "npm run build", "acceptanceCriteria": ["store layout uses TopNav storefront variant", "/store has hero + trending + new + categories sections", "/store/[storeId] uses MerchantHero + sticky filter + product grid", "data fetching preserved"], "requiresUserVerification": false}
```

## Task 11: Customer product detail + OrderFormSheet

**Goal:** Refactor the customer-facing product detail page (`/store/product/[id]`). On mobile, the order form moves into a Sheet triggered by a sticky bottom "Place order" button. On desktop, the form stays inline in a right-rail.

**Files:**
- Modify: `preorder/app/store/product/[id]/page.tsx`
- Create: `preorder/components/store/OrderFormSheet.tsx`

**Acceptance Criteria:**
- [ ] OrderFormSheet: a Sheet (right slide) containing the existing order form (name, address, WhatsApp, delivery method, quantity, submit). Existing `createOrders` flow + zod schema preserved.
- [ ] Product detail page: 2-col layout on `lg+` — left product images + details, right column has OrderFormSheet's form rendered inline. On mobile: single column ending in a sticky bottom CTA "Place order →" that opens the OrderFormSheet.
- [ ] Page top uses Eyebrow + product name (heading-1) + price (display-lg forest-700) + merchant pill linking to `/store/[storeId]`.
- [ ] `npx tsc --noEmit` clean; the smoke flow from the share-links work (interstitial → land on store → place order) still completes successfully.

**Verify:** From `/p/leD2Hcms` → submit interstitial → land on storefront → click into product → place a real order → backend creates an Order row.

**Steps:**

- [ ] **Step 1: Create `components/store/OrderFormSheet.tsx`**

Extract the existing order form from `app/store/product/[id]/page.tsx` into a self-contained component that takes the product as a prop and renders the form. The component exports both a `<Sheet>`-wrapped variant (for mobile) and a plain inline form (for desktop). Preserve every existing field, validator, and submit handler. Use the new `<Input>` / `<Textarea>` / `<Button>` primitives + `<Eyebrow>` for section labels.

```tsx
"use client";
import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eyebrow } from "@/components/ui/eyebrow";
import { toast } from "sonner";
import { createOrders } from "@/actions/orders.actions";
import { errorMessage } from "@/lib/errors";

const schema = z.object({
  customerName: z.string().min(2, "Enter your name"),
  customerAddress: z.string().min(4, "Enter your address"),
  customerWhatsapp: z.string().min(10, "Enter your WhatsApp number"),
  deliveryMethod: z.enum(["pickup", "delivery"]),
  quantity: z.string().min(1),
});

export const OrderFormInline = ({ productId, onSuccess }: { productId: number; onSuccess?: () => void }) => {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { customerName: "", customerAddress: "", customerWhatsapp: "", deliveryMethod: "delivery", quantity: "1" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setSubmitting(true);
    try {
      await createOrders({
        product: productId,
        customer_name: values.customerName,
        customer_address: values.customerAddress,
        customer_whatsapp: values.customerWhatsapp,
        delivery_method: values.deliveryMethod,
        quantity: Number(values.quantity),
      });
      toast.success("Order placed! The merchant will contact you on WhatsApp.");
      onSuccess?.();
      form.reset();
    } catch (e: any) {
      toast.error(errorMessage(e?.response?.data ?? e, "Could not place order. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Eyebrow className="block">PLACE YOUR ORDER</Eyebrow>
        <FormField control={form.control} name="customerName" render={({ field }) => (
          <FormItem><FormLabel>Your name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="customerWhatsapp" render={({ field }) => (
          <FormItem><FormLabel>WhatsApp number</FormLabel><FormControl><Input type="tel" inputMode="tel" autoComplete="tel" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="customerAddress" render={({ field }) => (
          <FormItem><FormLabel>Delivery address</FormLabel><FormControl><Textarea {...field} className="min-h-[80px]" /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="deliveryMethod" render={({ field }) => (
          <FormItem><FormLabel>Delivery method</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="delivery">Delivery</SelectItem><SelectItem value="pickup">Pickup</SelectItem></SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="quantity" render={({ field }) => (
          <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" disabled={submitting} className="w-full">{submitting ? "Placing order…" : "Place order →"}</Button>
      </form>
    </Form>
  );
};

export const OrderFormSheet = ({ productId, trigger }: { productId: number; trigger: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader><SheetTitle>Place your order</SheetTitle></SheetHeader>
        <div className="mt-4"><OrderFormInline productId={productId} onSuccess={() => setOpen(false)} /></div>
      </SheetContent>
    </Sheet>
  );
};
```

- [ ] **Step 2: Refactor `app/store/product/[id]/page.tsx`**

Replace the existing layout. Left col: product image gallery + name + price + merchant pill. Right col on `lg+`: `<OrderFormInline />`. On mobile, render a sticky bottom CTA that opens `<OrderFormSheet>`.

```tsx
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSingleProduct } from "@/actions/products.actions";
import { toast } from "sonner";
import { errorMessage } from "@/lib/errors";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { OrderFormInline, OrderFormSheet } from "@/components/store/OrderFormSheet";
import type { Product } from "@/types/api";

const CustomerProductDetail = () => {
  const productId = usePathname().split("/")[3];
  const [product, setProduct] = useState<Product>();

  useEffect(() => {
    getSingleProduct(Number(productId))
      .then((r) => setProduct(r.data))
      .catch((e) => toast.error(errorMessage(e?.detail ?? e?.message ?? e, "Could not load product.")));
  }, [productId]);

  if (!product) return null;

  const primary = product.images?.[0]?.image_url ?? product.image_url ?? "";

  return (
    <main className="max-w-7xl mx-auto pb-24 md:pb-12">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 px-6 md:px-10 py-8">
        <div>
          <div className="relative aspect-square w-full bg-ink-100 rounded-lg overflow-hidden">
            {primary && <Image src={primary} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-ink-100">
                  <Image src={img.image_url} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="100px" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <Eyebrow className="block mb-2">PRODUCT</Eyebrow>
          <h1 className="text-[28px] leading-[36px] font-bold tracking-[-0.01em] text-foreground">{product.name}</h1>
          <div className="mt-3 text-[36px] leading-[44px] font-bold text-forest-700 tracking-[-0.01em]">₦{product.price}</div>
          {product.store_slug && (
            <Link href={`/store/${product.store_slug}`} className="mt-3 inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground">
              by <span className="text-forest-500 font-semibold">{product.store_slug}</span>
            </Link>
          )}
          <p className="mt-4 text-[15px] leading-[24px] text-foreground/80 max-w-prose">{product.description}</p>

          {/* Desktop inline form */}
          <div className="hidden lg:block mt-10">
            <OrderFormInline productId={product.id} />
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-paper/95 backdrop-blur p-4">
        <OrderFormSheet
          productId={product.id}
          trigger={<Button className="w-full">Place order →</Button>}
        />
      </div>
    </main>
  );
};

export default CustomerProductDetail;
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm run build
```

Walk a fresh share-link smoke: `/p/leD2Hcms` in incognito → submit interstitial → land on storefront → click into product → on mobile width tap "Place order →" (Sheet opens), on desktop the form renders in right col. Submit → toast success + backend Order row created.

- [ ] **Step 4: Commit**

```bash
git add components/store/OrderFormSheet.tsx app/store/product/
git commit -m "feat(design): customer product detail — split-screen + sticky CTA + OrderFormSheet"
```

```json:metadata
{"files": ["preorder/components/store/OrderFormSheet.tsx", "preorder/app/store/product/[id]/page.tsx"], "verifyCommand": "npm run build", "acceptanceCriteria": ["OrderFormSheet exports inline + sheet variants", "product detail uses split-screen on lg+ with inline form, sticky bottom CTA + Sheet on mobile", "createOrders flow preserved end-to-end"], "requiresUserVerification": false}
```

## Task 12: Share-link interstitial polish + ShareLinkNotFound

**Goal:** Apply the bold-confident treatment to the share-link interstitial and the not-found fallback. The pages auto-inherit token changes; only the inner components change.

**Files:**
- Modify: `preorder/components/share/Interstitial.tsx`
- Modify: `preorder/components/share/ShareLinkNotFound.tsx`

**Acceptance Criteria:**
- [ ] Interstitial: full-bleed product image (aspect-[4/3]), then `<Card>` with eyebrow "PRODUCT" / "STORE", heading-2 name, display-lg price (forest-700), merchant avatar + name, divider, "BEFORE YOU SEE THE DETAILS" eyebrow + body-sm explainer, phone + name inputs, Continue button (default lg full-width), privacy footer
- [ ] ShareLinkNotFound: uses `<EmptyState>` with `<Link2Off>` icon, "This link is no longer active" title, "The merchant may have removed or updated it." description, action button linking to `/store`
- [ ] Existing submit handler + phone validation preserved
- [ ] `npx tsc --noEmit` clean

**Verify:** Walk fresh share-link smoke (steps 1–4 of the share-links checklist). Interstitial renders new card style. Submit works. OG meta still emits.

**Steps:**

- [ ] **Step 1: Replace `components/share/Interstitial.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { toast } from "sonner";
import { normalizePhone, isValidPhone } from "@/lib/phone";
import { errorMessage } from "@/lib/errors";
import type { ShareLinkResolve } from "@/types/api";

export default function Interstitial({ resolved, shortId }: { resolved: ShareLinkResolve; shortId: string }) {
  const router = useRouter();
  const [wa, setWa] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const valid = isValidPhone(wa);
  const product = resolved.product;
  const merchant = resolved.merchant;

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/share-link-identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortId, wa_number: normalizePhone(wa)!, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(errorMessage(data, "Could not submit your details.")); return; }
      router.replace(data.redirect_to);
    } catch (e) {
      toast.error(errorMessage(e, "Network error. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-8">
      <Card variant="elevated" padding="none" className="max-w-md w-full overflow-hidden rounded-xl">
        {product?.primary_image && (
          <div className="relative w-full aspect-[4/3]">
            <Image src={product.primary_image} alt={product.name} fill className="object-cover" sizes="448px" />
          </div>
        )}
        <div className="p-6">
          <Eyebrow className="block mb-2">{product ? "PRODUCT" : "STORE"}</Eyebrow>
          <h1 className="text-[22px] leading-[30px] font-bold tracking-[-0.005em] text-foreground">
            {product ? product.name : (merchant.business_name ?? "This store")}
          </h1>
          {product && (
            <div className="mt-2 text-[36px] leading-[44px] font-bold text-forest-700 tracking-[-0.01em]">₦{product.price}</div>
          )}
          {merchant.business_name && (
            <div className="mt-3 flex items-center gap-2 text-[14px] text-muted-foreground">
              <div className="size-6 rounded-full bg-forest-400 text-white text-[11px] font-bold flex items-center justify-center">
                {merchant.business_name[0]?.toUpperCase() ?? "B"}
              </div>
              <span>by {merchant.business_name}</span>
            </div>
          )}

          <div className="my-6 h-px bg-border" />

          <Eyebrow className="block mb-2">BEFORE YOU SEE THE DETAILS</Eyebrow>
          <p className="text-[13px] text-muted-foreground">
            We share your number with this merchant so they can answer questions and confirm your order.
          </p>

          <div className="mt-5 flex flex-col gap-4">
            <div>
              <Label htmlFor="wa">WhatsApp number</Label>
              <Input id="wa" type="tel" inputMode="tel" autoComplete="tel" placeholder="+234 _ _ _ _ _ _ _ _ _ _" value={wa} onChange={(e) => setWa(e.target.value)} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="name">Your name (optional)</Label>
              <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
            </div>
            <Button onClick={submit} disabled={!valid || submitting} size="lg" className="w-full">
              {submitting ? "Loading…" : "Continue →"}
            </Button>
          </div>

          <p className="mt-4 text-[12px] text-ink-500 text-center">
            🔒 Your number stays with this merchant only. Not shared with Buzzmart marketing.
          </p>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Replace `components/share/ShareLinkNotFound.tsx`**

```tsx
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Link2Off } from "lucide-react";
import Link from "next/link";

export default function ShareLinkNotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <EmptyState
        icon={<Link2Off />}
        title="This link is no longer active"
        description="The merchant may have removed or updated it. Try browsing other stores instead."
        action={<Link href="/store"><Button>Browse all stores →</Button></Link>}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm run build
```

Walk `/p/leD2Hcms` fresh incognito. New card style renders. Submit → land on storefront. OG meta still emits (`curl -H 'User-Agent: WhatsApp/2' http://localhost:3000/p/leD2Hcms | grep og:image`).

- [ ] **Step 4: Commit**

```bash
git add components/share/Interstitial.tsx components/share/ShareLinkNotFound.tsx
git commit -m "feat(design): share-link interstitial polish — hero card, eyebrow, lg button"
```

```json:metadata
{"files": ["preorder/components/share/Interstitial.tsx", "preorder/components/share/ShareLinkNotFound.tsx"], "verifyCommand": "npm run build", "acceptanceCriteria": ["interstitial uses Card + Eyebrow + display-lg price + lg Continue button", "ShareLinkNotFound uses EmptyState", "submit handler + OG meta + phone validation preserved"], "requiresUserVerification": false}
```

## Task 13: User verification — design walkthrough

**Goal:** Get the merchant's sign-off on the redesigned UI page-by-page. This is the human-in-the-loop gate the spec calls for.

**User Verification Required:**
Before marking this task complete, you MUST call AskUserQuestion:

```yaml
AskUserQuestion:
  question: "Walking the redesign page-by-page. For any page that doesn't feel right, tell me which one and what's off — I'll fix and re-check. Visit each in turn:\n\n1. /login + /register → split-screen, marketing panel on right, refined form on left\n2. /setup → progress bar at top, Card sections, sticky bottom action bar\n3. / (dashboard) → eyebrow greeting, stat row, activity feed + top products\n4. /marketplace → PageHeader + new ProductCard grid\n5. /marketplace/product/[id] → PageHeader + SharePanel\n6. /orders → underline tabs + Card rows\n7. /leads → EmptyState + Card LeadRows + drawer\n8. /manage → pill tabs + token-swept inner panels\n9. /store → editorial hero + sections + CategoryGrid\n10. /store/[storeId] → MerchantHero + sticky filter + grid\n11. /store/product/[id] (anonymous) → split-screen on desktop, sticky Place-order CTA on mobile\n12. /p/[shortId] interstitial → hero card with image + price + form\n\nAll feel right?"
  header: "Design verification"
  options:
    - label: "All pages feel right — ship it"
      description: "I'm happy with the new look across every page above. Mark Task 13 complete."
    - label: "Some pages need rework — list which"
      description: "I'll list which pages aren't landing and what's off; you fix and re-verify."
```

**If the user selects the negative option:** Identify the specific pages and feedback, dispatch fixes via the implementer subagent, re-run AskUserQuestion until "All feel right."

**Files:** None modified.

**Acceptance Criteria:**
- [ ] User confirms the redesign across all 12 page categories listed above.

**Verify:** Subjective — user confirms via AskUserQuestion.

**Steps:**

- [ ] **Step 1: Pre-flight**

Confirm both servers are running:

```bash
# Backend (port 8000)
cd /Users/lordamola/company-repos/data-totems/Buzzmart_backend
source .venv/bin/activate
python manage.py runserver 127.0.0.1:8000 &

# Frontend (port 3000)
cd /Users/lordamola/company-repos/data-totems/preorder
npm run dev &
```

- [ ] **Step 2: Walk the checklist with the user**

Call AskUserQuestion per the verification block above. Wait for response.

- [ ] **Step 3: On "Some need rework" — fix + re-verify**

Identify the named pages, dispatch a fix-only subagent for each, re-run AskUserQuestion until "All feel right."

- [ ] **Step 4: On "Ship it" — final commit**

```bash
cd /Users/lordamola/company-repos/data-totems/preorder
git tag visual-redesign-v1-verified
echo "Design walkthrough confirmed $(date)" >> docs/superpowers/plans/2026-06-22-visual-redesign-design-system.md.completion
git add docs/superpowers/plans/2026-06-22-visual-redesign-design-system.md.completion
git commit -m "chore(design): mark v1 design walkthrough verified"
```

```json:metadata
{"files": [], "verifyCommand": "", "acceptanceCriteria": ["user confirms all 12 page categories feel right"], "requiresUserVerification": true, "userVerificationPrompt": "All pages feel right?"}
```

---

## Self-review

**1. Spec coverage:**
- Section 1 tokens → Task 0 ✓
- Section 2 component primitives (15 files) → Task 1 + new chrome → Task 2 ✓
- Section 3 page chrome (sidebar, mobile nav, top nav, page header, empty state) → Tasks 3, 4, 5 (TopNav), Task 2 (PageHeader + EmptyState) ✓
- Section 4 hero pages (auth, setup, dashboard home, customer storefront, share-link interstitial) → Tasks 5, 6, 7, 10, 11, 12 ✓
- Section 4 internal pages (marketplace, marketplace product detail, orders, leads, manage) → Tasks 8, 9 ✓
- Section 4 animation moments → handled inside Task 1 universal interaction rules + product card scale in Task 8 ✓
- Section 5 phasing → tasks ordered Phase 1 (0-2) → Phase 2 (3-4) → Phase 3 (5-6) → Phase 4 (7-9) → Phase 5 (10-11) → Phase 6 (12) → Phase 7 (13) ✓
- Future work / explicitly deferred → captured in spec, not re-litigated in plan ✓

**2. Placeholder scan:** No "TBD", no "fill in details", no "similar to Task N". Per-step code blocks are present where code changes. The token-only sweep in Task 9 step 4 lists exact find/replace pairs.

**3. Type consistency:** Token names (`forest-*`, `ink-*`, `paper`, `success`, `danger`, semantic colors) are consistent across all tasks. Component prop interfaces (PageHeader props, EmptyState props, StatCard props, OrderFormInline / OrderFormSheet) match between where they're defined and where they're consumed.

**4. Verification requirement scan:** YES — the spec explicitly says "subjective aesthetic judgment requires the merchant's sign-off." Task 13 includes `requiresUserVerification: true` in its metadata block + the standard `AskUserQuestion` verification block. ✓

