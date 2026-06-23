// Short, ergonomic aliases over the generated OpenAPI types in
// `types/api-generated.ts`. This file is hand-maintained; if a backend schema
// changes shape, regenerate via `npm run gen:types` and adjust here.

import type { components, paths } from "./api-generated";

type Schemas = components["schemas"];

// --- Models ------------------------------------------------------------------

export type Product = Schemas["Product"];
export type ProductImage = Schemas["ProductImage"];
export type ProductCreateUpdate = Schemas["ProductCreateUpdate"];
export type Order = Schemas["Order"];
export type OrderCreate = Schemas["OrderCreate"];
export type OrderStatus = Schemas["OrderStatusEnum"];
export type DeliveryMethod = Schemas["DeliveryMethodEnum"];
export type Profile = Schemas["Profile"];
export type ProfileUpdate = Schemas["ProfileUpdate"];
export type BusinessDetails = Schemas["BusinessDetails"];
export type BankDetail = Schemas["BankDetail"];
export type WhatsAppDetail = Schemas["WhatsAppDetail"];
export type Dispatcher = Schemas["Dispatcher"];
export type Notification = Schemas["Notification"];
export type VehicleType = Schemas["VehicleTypeEnum"];
export type TransportArea = Schemas["PeferredTransportAreaEnum"];

// --- Response wrappers -------------------------------------------------------

// These wrappers SHOULD come from the OpenAPI schema, but the backend's views
// return ad-hoc dicts without @extend_schema(responses=...) decorators, so
// drf-spectacular emits `content?: never` for them. Hand-defined to match
// reality observed in views; remove once the backend annotates responses.

export interface UserDetails {
  id: number;
  email: string;
  username: string | null;
  full_name: string | null;
  setup_complete: boolean;
}

export interface LoginResponse {
  message: string;
  tokens: { access: string };
  user_details: UserDetails;
}

export interface RegisterResponse {
  message: string;
  Token: string;
  email: string;
}

export interface OrdersGroupResponse {
  count: number;
  orders: Order[];
}

// This one IS in the schema (we patched the missing Notification ref).
export type NotificationsResponse =
  paths["/api/notifications/notifications/"]["get"]["responses"][200]["content"]["application/json"];

// Public store endpoint (un-prefixed `/store/<slug>/`).
export type PublicStoreResponse =
  paths["/store/{store_slug}/"]["get"]["responses"][200]["content"]["application/json"];

// --- Share links + leads + slug ---------------------------------------------

// The Lead list item DOES come through the schema (it's a ModelSerializer used
// via DRF's ListAPIView, so drf-spectacular emits it correctly).
export type LeadListItem = Schemas["LeadList"];

// Everything below is hand-defined: the underlying views return ad-hoc dicts
// (or use plain Serializer subclasses without `@extend_schema(responses=...)`),
// so drf-spectacular emits `content?: never` for them. Shapes mirror reality
// observed in the backend serializers and view returns
// (`accounts/serializers.py` ShareLinkResolveSerializer + ShareStatsSerializer,
// `accounts/views.py` share_link_identify / update_business_slug /
// check_business_slug / my_lead_activity / get_my_store_link).

// Backend defines ClickEvent.EVENT_TYPES = [("submit", "Submit"), ("view", "View")].
// If new event types are added (e.g. "click_buy", "order"), update here and
// downstream UIs in lib/leads/*.tsx will need exhaustive switches refreshed.
export type ClickEventType = "view" | "submit";

export interface ShareLinkResolveMerchant {
  business_name: string | null;
  store_slug: string | null;
  display_picture: string | null;
}

export interface ShareLinkResolveProduct {
  id: number;
  name: string;
  price: string; // DRF DecimalField is serialized as string
  primary_image: string | null;
  description: string;
  in_stock: boolean;
}

export interface ShareLinkResolve {
  kind: "product" | "store";
  merchant: ShareLinkResolveMerchant;
  product: ShareLinkResolveProduct | null;
}

export interface ShareLinkIdentifyResponse {
  lead_token: string;
  redirect_to: string;
}

export interface LeadEventShareLink {
  kind: "product" | "store";
  product: { id: number; name: string } | null;
}

export interface LeadEvent {
  id: number;
  event_type: ClickEventType;
  occurred_at: string;
  share_link: LeadEventShareLink;
}

export interface LeadActivity {
  lead: LeadListItem;
  events: LeadEvent[];
}

export interface ShareStatsRecentClick {
  id: number;
  event_type: ClickEventType;
  occurred_at: string;
  lead: { wa_number: string; name: string } | null;
}

export interface ShareStats {
  short_id: string;
  full_url: string;
  total_clicks: number;
  unique_leads: number;
  total_orders: number;
  recent_clicks: ShareStatsRecentClick[];
}

export type SlugCheckReason = "format" | "reserved" | "taken";

export interface SlugCheckResponse {
  available: boolean;
  reason?: SlugCheckReason;
  suggestions?: string[];
}

export interface BusinessSlugAlias {
  slug: string;
  retired_at: string | null;
}

export interface BusinessSlugUpdate {
  slug: string;
  store_url: string;
  // (retired aliases only)
  aliases: BusinessSlugAlias[];
}

// Returned by GET /api/accounts/store/link/ — superset of the slug-update
// payload (adds business_name + a friendly message). Used by Task 19's
// Store Link manage tab.
export interface MyStoreLinkResponse {
  store_slug: string;
  store_url: string;
  business_name: string;
  message: string;
  // (retired aliases only)
  aliases: BusinessSlugAlias[];
}

// Paginated wrapper for the leads list. The generated schema names this
// `PaginatedLeadListList`; we alias it for clarity at call sites.
export type PaginatedLeads = Schemas["PaginatedLeadListList"];

// --- Errors ------------------------------------------------------------------

// What our action functions throw after the safe-extract pattern: either the
// backend's response body (field-error map or `{ detail | message | error }`)
// or a synthesized `{ message }` for network failures.
export interface ApiError {
  detail?: string;
  message?: string;
  error?: string;
  [field: string]: string | string[] | undefined;
}

// --- Flutterwave (external API, not in the OpenAPI schema) ------------------

export interface FlutterwaveBank {
  id: number;
  code: string;
  name: string;
}
