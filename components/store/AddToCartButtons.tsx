"use client";

import * as React from "react";
import { ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCart } from "@/components/store/CartProvider";
import { OrderFormSheet } from "@/components/store/OrderFormSheet";
import type { Cart } from "@/lib/cart";

interface AddToCartButtonsProps {
  product: {
    id: number;
    product_id: string;
    name: string;
    price: string;
    primary_image?: string | null;
  };
  merchant: { slug: string; name: string };
  className?: string;
  layout?: "stacked" | "inline";
}

/**
 * "Add to cart" + "Buy now" pair shown on the customer product detail page.
 *  - Add to cart: stages the product, opens the drawer. Confirms if cart belongs
 *    to a different merchant.
 *  - Buy now: skips the cart, opens the single-product order form directly.
 */
const AddToCartButtons: React.FC<AddToCartButtonsProps> = ({
  product,
  merchant,
  className,
  layout = "stacked",
}) => {
  const { add, swap, setOpen } = useCart();
  const [conflict, setConflict] = React.useState<Cart | null>(null);

  const handleAdd = () => {
    const line = {
      product_id: product.id,
      product_uuid: product.product_id,
      name: product.name,
      price: product.price,
      image_url: product.primary_image ?? undefined,
    };
    const result = add(line, merchant);
    if (!result.ok) {
      setConflict(result.existing);
    } else {
      setOpen(true);
    }
  };

  const handleSwap = () => {
    if (!conflict) return;
    const line = {
      product_id: product.id,
      product_uuid: product.product_id,
      name: product.name,
      price: product.price,
      image_url: product.primary_image ?? undefined,
    };
    swap(line, merchant);
    setConflict(null);
    setOpen(true);
  };

  const isStacked = layout === "stacked";

  return (
    <>
      <div className={`${isStacked ? "flex flex-col gap-2" : "grid grid-cols-2 gap-2"} ${className ?? ""}`}>
        <Button type="button" variant="outline" onClick={handleAdd} size="lg">
          <ShoppingBag className="size-4" /> Add to cart
        </Button>
        <OrderFormSheet
          productId={product.id}
          productPreview={{
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.primary_image ?? undefined,
          }}
          trigger={
            <Button type="button" size="lg">
              <Zap className="size-4" /> Buy now
            </Button>
          }
        />
      </div>

      <AlertDialog open={conflict !== null} onOpenChange={(o) => !o && setConflict(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new cart?</AlertDialogTitle>
            <AlertDialogDescription>
              Your cart already has items from <strong>{conflict?.merchant_name}</strong>. Each order goes to one merchant, so adding this product will replace your current cart.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep current cart</AlertDialogCancel>
            <AlertDialogAction onClick={handleSwap}>
              Replace cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddToCartButtons;
