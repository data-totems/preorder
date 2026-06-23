"use client";

import * as React from "react";
import {
  type Cart,
  type CartLine,
  type AddResult,
  addToCart as libAddToCart,
  swapCart as libSwapCart,
  readCart,
  removeFromCart as libRemoveFromCart,
  setQuantity as libSetQuantity,
  clearCart as libClearCart,
} from "@/lib/cart";

interface CartContextValue {
  cart: Cart | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (
    line: Omit<CartLine, "quantity"> & { quantity?: number },
    merchant: { slug: string; name: string },
  ) => AddResult;
  swap: (
    line: Omit<CartLine, "quantity"> & { quantity?: number },
    merchant: { slug: string; name: string },
  ) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [open, setOpen] = React.useState(false);

  // Hydrate from localStorage after mount so SSR/CSR markup matches. Also
  // listen for cross-tab writes — without this, two tabs would each hold their
  // own in-memory cart and silently disagree on totals at checkout.
  React.useEffect(() => {
    setCart(readCart());
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === "bz_cart" || e.key === null) setCart(readCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add: CartContextValue["add"] = (line, merchant) => {
    const result = libAddToCart(line, merchant);
    if (result.ok) setCart(result.cart);
    return result;
  };

  const swap: CartContextValue["swap"] = (line, merchant) => {
    setCart(libSwapCart(line, merchant));
  };

  const remove: CartContextValue["remove"] = (productId) => {
    setCart(libRemoveFromCart(productId));
  };

  const setQty: CartContextValue["setQty"] = (productId, qty) => {
    setCart(libSetQuantity(productId, qty));
  };

  const clear = () => {
    libClearCart();
    setCart(null);
  };

  return (
    <CartContext.Provider
      value={{ cart, open, setOpen, add, swap, remove, setQty, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
