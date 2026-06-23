"use client";

import * as React from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/store/CartProvider";
import { cartItemCount } from "@/lib/cart";

/**
 * TopNav button that opens the cart drawer. Renders a badge with the item count.
 */
const CartButton: React.FC = () => {
  const { cart, setOpen } = useCart();
  const count = cartItemCount(cart);

  return (
    <button
      type="button"
      aria-label="Open cart"
      onClick={() => setOpen(true)}
      className="relative inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-ink-100 transition-colors"
    >
      <ShoppingBag className="size-5 text-foreground" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-pill bg-forest-700 text-white text-[10px] font-bold tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
};

export default CartButton;
