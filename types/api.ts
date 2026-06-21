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
