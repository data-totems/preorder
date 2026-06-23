"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, Bike } from "lucide-react";
import { readBuyerProfile, saveBuyerProfile } from "@/lib/buyerProfile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createOrders } from "@/actions/orders.actions";
import { errorMessage } from "@/lib/errors";

const schema = z.object({
  customerName: z.string().min(2, "Enter your name"),
  customerAddress: z.string().min(4, "Enter your address"),
  customerWhatsapp: z.string().min(10, "Enter your WhatsApp number"),
  deliveryMethod: z.enum(["pickup", "delivery"]),
  // Validate that the input parses to an integer ≥ 1 instead of relying on
  // string-length min(1) (which would accept "0"). Only the legacy
  // single-product path sends this field; cart mode ignores it.
  quantity: z.string().refine((v) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= 1;
  }, "Quantity must be a whole number, 1 or more"),
  paymentMethod: z.enum(["bank_transfer", "pay_on_delivery"]),
});

type FormValues = z.infer<typeof schema>;

interface OrderFormCartItem {
  product_id: number;
  name: string;
  price: string;
  quantity: number;
}

export const OrderFormInline = ({
  productId,
  cartItems,
  onSuccess,
}: {
  /** Single-product flow (legacy/Buy now). Provide either productId or cartItems. */
  productId?: number;
  /** Multi-product cart flow. Takes precedence over productId when present. */
  cartItems?: OrderFormCartItem[];
  onSuccess?: () => void;
}) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [prefilledFromProfile, setPrefilledFromProfile] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: "",
      customerAddress: "",
      customerWhatsapp: "",
      deliveryMethod: "delivery",
      quantity: "1",
      paymentMethod: "bank_transfer",
    },
  });

  // Hydrate from the buyer profile so returning customers don't retype values
  // they've already given on this device (interstitial captures name + WA;
  // a prior completed order captures address too).
  useEffect(() => {
    const profile = readBuyerProfile();
    if (!profile) return;
    let didPrefill = false;
    if (profile.name && !form.getValues("customerName")) {
      form.setValue("customerName", profile.name);
      didPrefill = true;
    }
    if (profile.wa_number && !form.getValues("customerWhatsapp")) {
      form.setValue("customerWhatsapp", profile.wa_number);
      didPrefill = true;
    }
    if (profile.address && !form.getValues("customerAddress")) {
      form.setValue("customerAddress", profile.address);
      didPrefill = true;
    }
    if (didPrefill) setPrefilledFromProfile(true);
  }, [form]);

  const paymentMethod = form.watch("paymentMethod");

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      // Multi-item cart path takes precedence; falls back to legacy single-product
      // when only productId was supplied.
      let payload: Parameters<typeof createOrders>[0];
      if (cartItems && cartItems.length > 0) {
        payload = {
          items: cartItems.map((it) => ({ product: it.product_id, quantity: it.quantity })),
          customer_name: values.customerName,
          customer_address: values.customerAddress,
          customer_whatsapp: values.customerWhatsapp,
          delivery_method: values.deliveryMethod,
          payment_method: values.paymentMethod,
        };
      } else if (typeof productId === "number") {
        payload = {
          product: productId,
          customer_name: values.customerName,
          customer_address: values.customerAddress,
          customer_whatsapp: values.customerWhatsapp,
          delivery_method: values.deliveryMethod,
          quantity: Number(values.quantity),
          payment_method: values.paymentMethod,
        };
      } else {
        throw new Error("OrderFormInline needs either productId or cartItems.");
      }
      const response = await createOrders(payload);
      const orderId = response.data?.id;
      // Save what they just typed so subsequent orders are prefilled too.
      saveBuyerProfile({
        name: values.customerName,
        wa_number: values.customerWhatsapp,
        address: values.customerAddress,
      });

      // Navigate FIRST, then clear cart + reset form. If router.push throws or
      // stalls (slow network, middleware), the cart stays intact so the
      // customer can recover.
      if (orderId) {
        if (values.paymentMethod === "bank_transfer") {
          router.push(`/store/order/${orderId}`);
        } else {
          toast.success("Order placed! The merchant will contact you on WhatsApp.");
          router.push(`/store/order/${orderId}`);
        }
      } else if (values.paymentMethod !== "bank_transfer") {
        toast.success("Order placed! The merchant will contact you on WhatsApp.");
      }
      onSuccess?.();
      form.reset();
    } catch (e: unknown) {
      toast.error(errorMessage(e, "Could not place order. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <Eyebrow className="block">PLACE YOUR ORDER</Eyebrow>
        {prefilledFromProfile && (
          <div className="text-[12px] text-muted-foreground -mt-2">
            Welcome back — we&apos;ve filled in your details from a previous order. Edit anything that&apos;s changed.
          </div>
        )}
        {cartItems && cartItems.length > 0 && (
          <div className="rounded-md border border-border bg-ink-50 p-3 -mt-2">
            <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground mb-2">
              Cart ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
            </div>
            <ul className="text-[13px] text-foreground space-y-1">
              {cartItems.map((it) => (
                <li key={it.product_id} className="flex justify-between gap-2">
                  <span className="line-clamp-1">{it.quantity} × {it.name}</span>
                  <span className="tabular-nums shrink-0">₦{(Number(it.price) * it.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customerWhatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customerAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery address</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-[80px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deliveryMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery method</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Quantity field is hidden when ordering from a cart (each cart item
            has its own quantity). Still shown for the legacy single-product flow. */}
        {!cartItems && (
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How would you like to pay?</FormLabel>
              <div className="grid grid-cols-1 gap-2">
                {(
                  [
                    {
                      value: "bank_transfer",
                      title: "Bank transfer",
                      desc: "Pay now via your banking app. We'll show you the merchant's account details next.",
                      icon: Banknote,
                    },
                    {
                      value: "pay_on_delivery",
                      title: "Pay on delivery",
                      desc: "Pay with cash or transfer when the rider arrives.",
                      icon: Bike,
                    },
                  ] as const
                ).map((opt) => {
                  const Icon = opt.icon;
                  const active = field.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={cn(
                        "text-left rounded-md border p-3 flex items-start gap-3 transition-colors",
                        active
                          ? "border-forest-500 bg-forest-50"
                          : "border-border bg-paper hover:bg-ink-50",
                      )}
                    >
                      <div
                        className={cn(
                          "size-9 rounded-md flex items-center justify-center shrink-0",
                          active
                            ? "bg-forest-100 text-forest-700"
                            : "bg-ink-100 text-ink-500",
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "text-[14px] font-semibold",
                            active ? "text-forest-700" : "text-foreground",
                          )}
                        >
                          {opt.title}
                        </div>
                        <div className="text-[12px] text-muted-foreground mt-0.5">
                          {opt.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting
            ? "Placing order…"
            : paymentMethod === "bank_transfer"
              ? "Continue to payment →"
              : "Place order →"}
        </Button>
      </form>
    </Form>
  );
};

export const OrderFormSheet = ({
  productId,
  trigger,
}: {
  productId: number;
  trigger: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Place your order</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <OrderFormInline
            productId={productId}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
