"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Banknote,
  Bike,
  Truck,
  MapPin,
  Lock,
  Minus,
  Plus,
  Loader2,
  Sparkles,
} from "lucide-react";
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
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createOrders } from "@/actions/orders.actions";
import { errorMessage } from "@/lib/errors";

const schema = z.object({
  customerName: z.string().min(2, "Enter your name"),
  customerAddress: z.string().min(4, "Enter your full address"),
  customerWhatsapp: z.string().min(10, "Enter a valid WhatsApp number"),
  deliveryMethod: z.enum(["pickup", "delivery"]),
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

interface ProductPreview {
  id: number;
  name: string;
  price: string | number;
  image_url?: string | null;
}

const formatNgn = (n: number) => `₦${n.toLocaleString()}`;

// ─────────────────────────────────────────────────────────────────
// Visual radio card — used for both delivery method + payment method
// to keep the form scannable and tap-friendly on mobile.
// ─────────────────────────────────────────────────────────────────
const ChoiceCard = ({
  active,
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "text-left rounded-md border p-3 flex items-start gap-3 transition-colors w-full",
      active ? "border-forest-500 bg-forest-50" : "border-border bg-paper hover:bg-ink-50",
    )}
  >
    <div
      className={cn(
        "size-9 rounded-md flex items-center justify-center shrink-0",
        active ? "bg-forest-100 text-forest-700" : "bg-ink-100 text-ink-500",
      )}
    >
      <Icon className="size-4" />
    </div>
    <div className="min-w-0 flex-1">
      <div className={cn("text-[14px] font-semibold", active ? "text-forest-700" : "text-foreground")}>{title}</div>
      <div className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2">{desc}</div>
    </div>
  </button>
);

// ─────────────────────────────────────────────────────────────────
// Quantity stepper
// ─────────────────────────────────────────────────────────────────
const QuantityStepper = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) => (
  <div className="inline-flex items-center rounded-md border border-border bg-paper">
    <button
      type="button"
      aria-label="Decrease quantity"
      onClick={() => onChange(Math.max(1, value - 1))}
      className="size-11 inline-flex items-center justify-center hover:bg-ink-100 rounded-l-md disabled:opacity-40"
      disabled={value <= 1}
    >
      <Minus className="size-4" />
    </button>
    <span className="w-12 text-center text-[15px] tabular-nums font-bold">{value}</span>
    <button
      type="button"
      aria-label="Increase quantity"
      onClick={() => onChange(value + 1)}
      className="size-11 inline-flex items-center justify-center hover:bg-ink-100 rounded-r-md"
    >
      <Plus className="size-4" />
    </button>
  </div>
);

export const OrderFormInline = ({
  productId,
  productPreview,
  cartItems,
  onSuccess,
}: {
  /** Single-product flow (legacy/Buy now). Provide either productId or cartItems. */
  productId?: number;
  /** Product info for the summary card (single-product flow). */
  productPreview?: ProductPreview;
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
  const deliveryMethod = form.watch("deliveryMethod");
  const quantity = form.watch("quantity");

  // Running total — drives the sticky CTA so the customer always sees what they owe.
  const total = React.useMemo(() => {
    if (cartItems && cartItems.length > 0) {
      return cartItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    }
    if (productPreview) {
      const q = Number(quantity) || 1;
      return Number(productPreview.price) * q;
    }
    return 0;
  }, [cartItems, productPreview, quantity]);

  const itemCount = cartItems
    ? cartItems.reduce((s, i) => s + i.quantity, 0)
    : Number(quantity) || 1;

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
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
      saveBuyerProfile({
        name: values.customerName,
        wa_number: values.customerWhatsapp,
        address: values.customerAddress,
      });

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        {/* ── Order summary card ───────────────────────────────────── */}
        {(productPreview || (cartItems && cartItems.length > 0)) && (
          <div className="rounded-lg border border-border bg-ink-50/60 p-3 mb-5">
            {productPreview ? (
              <div className="flex gap-3 items-center">
                <div className="relative size-14 rounded-md bg-ink-100 overflow-hidden shrink-0">
                  {productPreview.image_url && (
                    <Image
                      src={productPreview.image_url}
                      alt={productPreview.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-foreground line-clamp-1">
                    {productPreview.name}
                  </div>
                  <div className="text-[13px] text-forest-700 font-semibold tabular-nums">
                    {formatNgn(Number(productPreview.price))} each
                  </div>
                </div>
                <QuantityStepper
                  value={Number(quantity) || 1}
                  onChange={(n) => form.setValue("quantity", String(n))}
                />
              </div>
            ) : (
              <ul className="text-[13px] text-foreground space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground mb-2">
                  {itemCount} item{itemCount === 1 ? "" : "s"} in your order
                </div>
                {cartItems!.map((it) => (
                  <li key={it.product_id} className="flex justify-between gap-2">
                    <span className="line-clamp-1">{it.quantity} × {it.name}</span>
                    <span className="tabular-nums shrink-0">{formatNgn(Number(it.price) * it.quantity)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {prefilledFromProfile && (
          <div className="mb-5 rounded-md border border-forest-300 bg-forest-50 px-3 py-2 flex items-start gap-2 text-[12px]">
            <Sparkles className="size-4 text-forest-700 shrink-0 mt-0.5" />
            <span className="text-forest-700">
              <strong>Welcome back.</strong> Your details are filled in — edit anything that&apos;s changed.
            </span>
          </div>
        )}

        {/* ── Section 1: Your details ──────────────────────────────── */}
        <Eyebrow className="block mb-3">YOUR DETAILS</Eyebrow>
        <div className="flex flex-col gap-4 mb-6">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Adunni Bello" autoComplete="name" {...field} />
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
                    placeholder="+234 _ _ _ _ _ _ _ _ _ _"
                    {...field}
                  />
                </FormControl>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Lock className="size-3" />
                  <span>The merchant uses this to confirm your order. Not shared elsewhere.</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Section 2: Delivery ──────────────────────────────────── */}
        <Eyebrow className="block mb-3">DELIVERY</Eyebrow>
        <div className="flex flex-col gap-4 mb-6">
          <FormField
            control={form.control}
            name="deliveryMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">How would you like to receive it?</FormLabel>
                <div className="grid grid-cols-1 gap-2">
                  <ChoiceCard
                    active={field.value === "delivery"}
                    icon={Truck}
                    title="Delivery"
                    desc="The merchant arranges a rider to bring it to you."
                    onClick={() => field.onChange("delivery")}
                  />
                  <ChoiceCard
                    active={field.value === "pickup"}
                    icon={MapPin}
                    title="Pickup"
                    desc="You'll arrange to collect it from the merchant."
                    onClick={() => field.onChange("pickup")}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {deliveryMethod === "pickup" ? "Pickup area (suburb / landmark)" : "Delivery address"}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      deliveryMethod === "pickup"
                        ? "e.g. Lekki Phase 1 — I'll DM for exact pickup point"
                        : "Street, area, landmark, city"
                    }
                    className="min-h-[78px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Section 3: Payment ───────────────────────────────────── */}
        <Eyebrow className="block mb-3">PAYMENT</Eyebrow>
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel className="sr-only">How would you like to pay?</FormLabel>
              <div className="grid grid-cols-1 gap-2">
                <ChoiceCard
                  active={field.value === "bank_transfer"}
                  icon={Banknote}
                  title="Bank transfer"
                  desc="See the merchant's account next. Upload proof so they ship faster."
                  onClick={() => field.onChange("bank_transfer")}
                />
                <ChoiceCard
                  active={field.value === "pay_on_delivery"}
                  icon={Bike}
                  title="Pay on delivery"
                  desc="Pay the rider in cash or transfer when they arrive."
                  onClick={() => field.onChange("pay_on_delivery")}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Sticky submit bar with running total ─────────────────── */}
        <div className="sticky bottom-0 -mx-6 px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-paper/95 backdrop-blur border-t border-border z-10">
          {total > 0 && (
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[12px] uppercase tracking-[0.04em] text-muted-foreground font-bold">Total</span>
              <span className="text-[20px] font-bold tabular-nums text-foreground">{formatNgn(total)}</span>
            </div>
          )}
          <Button type="submit" disabled={submitting} className="w-full" size="lg">
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Placing order…
              </>
            ) : paymentMethod === "bank_transfer" ? (
              "Continue to payment →"
            ) : (
              "Place order →"
            )}
          </Button>
          <p className="mt-2 text-[11px] text-muted-foreground text-center">
            Delivery fee (if any) is confirmed by the merchant on WhatsApp.
          </p>
        </div>
      </form>
    </Form>
  );
};

export const OrderFormSheet = ({
  productId,
  productPreview,
  trigger,
}: {
  productId: number;
  productPreview?: ProductPreview;
  trigger: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[92vh] flex flex-col p-0 gap-0"
      >
        {/* Drag handle affordance */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="h-1 w-10 rounded-full bg-ink-200" />
        </div>
        <SheetHeader className="px-6 pb-4 shrink-0">
          <SheetTitle>Place your order</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-0">
          <OrderFormInline
            productId={productId}
            productPreview={productPreview}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
