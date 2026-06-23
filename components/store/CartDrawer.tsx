"use client";

import * as React from "react";
import Image from "next/image";
import { ShoppingBag, Minus, Plus, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useCart } from "@/components/store/CartProvider";
import { cartItemCount, cartSubtotal } from "@/lib/cart";
import { OrderFormInline } from "@/components/store/OrderFormSheet";

/**
 * Slide-in cart panel from the right. Shows merchant context, all line items
 * (with qty stepper + remove), subtotal, and the checkout form. Wired up via
 * the CartProvider context so it can be opened from anywhere in the storefront.
 */
const CartDrawer: React.FC = () => {
  const { cart, open, setOpen, remove, setQty, clear } = useCart();
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);

  const count = cartItemCount(cart);
  const subtotal = cartSubtotal(cart);

  React.useEffect(() => {
    // Closing the drawer also collapses the checkout view, so re-opening shows
    // the cart contents (not stale checkout state).
    if (!open) setCheckoutOpen(false);
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            Your cart
          </SheetTitle>
          {cart && (
            <div className="text-[13px] text-muted-foreground">
              From <span className="font-semibold text-foreground">{cart.merchant_name}</span>
              {" · "}{count} item{count === 1 ? "" : "s"}
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!cart || cart.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="size-12 mx-auto text-muted-foreground/40" />
              <div className="mt-4 text-[15px] font-semibold text-foreground">
                Your cart is empty
              </div>
              <div className="mt-1 text-[13px] text-muted-foreground">
                Add a product to start an order.
              </div>
            </div>
          ) : checkoutOpen ? (
            <OrderFormInline
              cartItems={cart.items}
              onSuccess={() => {
                clear();
                setOpen(false);
              }}
            />
          ) : (
            <ul className="flex flex-col gap-4">
              {cart.items.map((item) => (
                <li key={item.product_id} className="flex gap-3">
                  <div className="relative size-16 rounded-md bg-ink-100 overflow-hidden shrink-0">
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-[14px] text-foreground line-clamp-2">
                        {item.name}
                      </div>
                      <button
                        type="button"
                        aria-label="Remove"
                        onClick={() => remove(item.product_id)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="mt-1 text-[13px] text-forest-700 font-semibold tabular-nums">
                      ₦{Number(item.price).toLocaleString()}
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-md border border-border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(item.product_id, item.quantity - 1)}
                        className="size-8 inline-flex items-center justify-center hover:bg-ink-100 rounded-l-md"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-[13px] tabular-nums font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQty(item.product_id, item.quantity + 1)}
                        className="size-8 inline-flex items-center justify-center hover:bg-ink-100 rounded-r-md"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart && cart.items.length > 0 && !checkoutOpen && (
          <div className="border-t border-border p-6 space-y-3">
            <div className="flex items-baseline justify-between">
              <Eyebrow>SUBTOTAL</Eyebrow>
              <div className="text-[20px] font-bold tabular-nums text-foreground">
                ₦{subtotal.toLocaleString()}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Delivery fee (if any) is confirmed with the merchant on WhatsApp.
            </p>
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => setCheckoutOpen(true)}
            >
              Checkout →
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
