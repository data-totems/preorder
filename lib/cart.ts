/**
 * Per-merchant shopping cart kept in localStorage.
 *
 * We hold a single active cart at a time (keyed by merchant_slug). Adding a
 * product from a different merchant is a destructive op: the caller decides
 * whether to swap, and we return a signal so the UI can confirm with the user.
 *
 * Why per-merchant: Buzzmart's flow is WhatsApp-native — one bank transfer to
 * one merchant, one WhatsApp conversation. Mixed-merchant carts would break
 * checkout and the customer's mental model.
 */

const KEY = "bz_cart";

export interface CartLine {
  product_id: number;
  product_uuid: string;
  name: string;
  price: string;
  image_url?: string;
  quantity: number;
}

export interface Cart {
  merchant_slug: string;
  merchant_name: string;
  items: CartLine[];
  updatedAt: string;
}

function safeRead(): Cart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cart;
    if (!parsed?.merchant_slug || !Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function safeWrite(cart: Cart | null) {
  if (typeof window === "undefined") return;
  try {
    if (cart === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {
    /* private mode — silent */
  }
}

export function readCart(): Cart | null {
  return safeRead();
}

export function clearCart(): void {
  safeWrite(null);
}

export type AddResult =
  | { ok: true; cart: Cart }
  | { ok: false; reason: "different_merchant"; existing: Cart };

/**
 * Add a line to the active cart. If the active cart belongs to a different
 * merchant, returns `different_merchant` instead of silently overwriting —
 * the caller should confirm with the user before calling `swapCart`.
 */
export function addToCart(
  line: Omit<CartLine, "quantity"> & { quantity?: number },
  merchant: { slug: string; name: string },
): AddResult {
  const existing = safeRead();
  if (existing && existing.merchant_slug !== merchant.slug) {
    return { ok: false, reason: "different_merchant", existing };
  }

  const items = existing?.items ?? [];
  const qtyToAdd = Math.max(1, line.quantity ?? 1);
  const idx = items.findIndex((i) => i.product_id === line.product_id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], quantity: items[idx].quantity + qtyToAdd };
  } else {
    items.push({ ...line, quantity: qtyToAdd });
  }
  const cart: Cart = {
    merchant_slug: merchant.slug,
    merchant_name: merchant.name,
    items,
    updatedAt: new Date().toISOString(),
  };
  safeWrite(cart);
  return { ok: true, cart };
}

/**
 * Discard whatever's in the cart and start fresh with this line.
 * Used after the user confirms "switch stores".
 */
export function swapCart(
  line: Omit<CartLine, "quantity"> & { quantity?: number },
  merchant: { slug: string; name: string },
): Cart {
  const cart: Cart = {
    merchant_slug: merchant.slug,
    merchant_name: merchant.name,
    items: [{ ...line, quantity: Math.max(1, line.quantity ?? 1) }],
    updatedAt: new Date().toISOString(),
  };
  safeWrite(cart);
  return cart;
}

export function removeFromCart(productId: number): Cart | null {
  const existing = safeRead();
  if (!existing) return null;
  const items = existing.items.filter((i) => i.product_id !== productId);
  if (items.length === 0) {
    safeWrite(null);
    return null;
  }
  const cart: Cart = { ...existing, items, updatedAt: new Date().toISOString() };
  safeWrite(cart);
  return cart;
}

export function setQuantity(productId: number, quantity: number): Cart | null {
  const existing = safeRead();
  if (!existing) return null;
  if (quantity <= 0) return removeFromCart(productId);
  const items = existing.items.map((i) =>
    i.product_id === productId ? { ...i, quantity } : i,
  );
  const cart: Cart = { ...existing, items, updatedAt: new Date().toISOString() };
  safeWrite(cart);
  return cart;
}

export function cartItemCount(cart: Cart | null): number {
  if (!cart) return 0;
  return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotal(cart: Cart | null): number {
  if (!cart) return 0;
  return cart.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
}
