"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, Bike } from "lucide-react";
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
  quantity: z.string().min(1),
  paymentMethod: z.enum(["bank_transfer", "pay_on_delivery"]),
});

type FormValues = z.infer<typeof schema>;

export const OrderFormInline = ({
  productId,
  onSuccess,
}: {
  productId: number;
  onSuccess?: () => void;
}) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
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

  const paymentMethod = form.watch("paymentMethod");

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const response = await createOrders({
        product: productId,
        customer_name: values.customerName,
        customer_address: values.customerAddress,
        customer_whatsapp: values.customerWhatsapp,
        delivery_method: values.deliveryMethod,
        quantity: Number(values.quantity),
        payment_method: values.paymentMethod,
      });
      const orderId = response.data?.id;
      onSuccess?.();
      form.reset();

      if (values.paymentMethod === "bank_transfer" && orderId) {
        // Send the customer to the payment-confirmation page where they see
        // the bank details + reference + can upload proof.
        router.push(`/store/order/${orderId}`);
      } else {
        toast.success("Order placed! The merchant will contact you on WhatsApp.");
        if (orderId) router.push(`/store/order/${orderId}`);
      }
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
