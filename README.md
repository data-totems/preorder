# preorder

BuzzMart's merchant dashboard and public storefront — a Next.js 14 app paired with the Django REST API at [data-totems/Buzzmart_backend](https://github.com/data-totems/Buzzmart_backend) (`final` branch).

Merchants register, complete a 3-step setup (personal → business → bank), list products, and accept / decline / ship customer orders. Customers browse public storefronts at `/store` and place orders without authentication.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment variables

Create a `.env.local` with at least:

```env
# Buzzmart backend (Django REST API)
NEXT_PUBLIC_BASE_URI=http://127.0.0.1:8000/api

# Appwrite (used for product / dispatcher image uploads)
NEXT_PUBLIC_APPWRITE_BASE_URI=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_BUCKET_ID=

# Optional integrations
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
```

The app boots without the optional vars, but image upload and bank-account verification will fail until they're set.

## Stack

- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS v4, shadcn/ui (Radix primitives)
- React Hook Form + Zod
- Zustand for client state
- axios for backend calls
- Appwrite SDK for file storage

## Routes

| Group | Path | Purpose |
|---|---|---|
| `(auth)` | `/login`, `/register`, `/forgot-password` | Merchant auth |
| `(setup)` | `/setup` | 3-step onboarding wizard |
| `(dashboard)` | `/`, `/marketplace`, `/orders`, `/manage` | Authenticated merchant tools |
| public | `/store`, `/store/[storeId]`, `/store/product/[id]` | Customer-facing storefront |
| api | `/api/resolve` | Server-side Flutterwave bank account verification |

## Deploy

Deploys on Vercel. The production frontend talks to the Render-hosted backend (`buzzmart-backend-5l1f.onrender.com`).
