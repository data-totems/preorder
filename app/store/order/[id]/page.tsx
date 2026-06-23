"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Banknote,
  Bike,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Truck,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/errors";
import { trackOrder, uploadPaymentProof } from "@/actions/orders.actions";

interface OrderDetail {
  id: number;
  status: string;
  payment_method: string;
  payment_reference: string | null;
  payment_proof_url: string | null;
  paid_at: string | null;
  total_price: string;
  quantity: number;
  customer_name: string;
  customer_whatsapp: string;
  delivery_method: string;
  product_name: string;
  product_details?: { name: string; price: string };
  merchant_bank: {
    bank_name: string;
    account_number: string;
    account_name: string | null;
  } | null;
}

const STATUS_LABEL: Record<string, string> = {
  awaiting_payment: "Awaiting payment",
  pending: "Awaiting merchant confirmation",
  accepted: "Accepted — being prepared",
  shipped: "Shipped",
  declined: "Declined",
  completed: "Completed",
};

const formatNgn = (price?: string) => {
  if (!price) return "—";
  const n = parseFloat(price);
  if (!isFinite(n)) return price;
  return `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
};

const POLL_MS = 15_000;

export default function OrderConfirmationPage() {
  const path = usePathname();
  const orderId = Number(path.split("/")[3]);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(orderId)) return;
    try {
      const r = await trackOrder(orderId);
      setOrder(r.data);
    } catch (e) {
      toast.error(errorMessage(e, "Could not load order."));
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll while still awaiting payment — so the customer's status flips to
  // "Accepted" the moment the merchant marks paid + accepts.
  useEffect(() => {
    if (!order) return;
    if (order.status !== "awaiting_payment" && order.status !== "pending") return;
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [order, load]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const r = await uploadPaymentProof(orderId, selectedFile);
      setOrder(r.data);
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      toast.success("Proof uploaded — the merchant has been notified.");
    } catch (e) {
      toast.error(errorMessage(e, "Could not upload proof."));
    } finally {
      setUploading(false);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copied`),
      () => toast.error(`Could not copy ${label}`),
    );
  };

  if (!order) {
    return (
      <main className="max-w-2xl mx-auto px-6 md:px-10 py-12">
        <Skeleton className="h-6 w-24 mb-3" />
        <Skeleton className="h-8 w-2/3 mb-6" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </main>
    );
  }

  const isBankTransfer = order.payment_method === "bank_transfer";
  const isPOD = order.payment_method === "pay_on_delivery";
  const statusLabel = STATUS_LABEL[order.status] ?? order.status;
  const productName = order.product_details?.name ?? order.product_name;

  // Pay on delivery → confirmation only, no bank flow.
  if (isPOD) {
    return (
      <main className="max-w-2xl mx-auto px-6 md:px-10 py-12">
        <Eyebrow className="block mb-2">ORDER #{order.id}</Eyebrow>
        <h1 className="text-[28px] leading-[36px] font-bold text-foreground">
          Order placed
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          You&apos;ll pay with cash or transfer when the rider arrives.
        </p>

        <Card padding="none" className="mt-6 p-6">
          <Eyebrow className="block">ORDER SUMMARY</Eyebrow>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold text-foreground">{productName}</div>
              <div className="text-[13px] text-muted-foreground">
                Quantity {order.quantity}
              </div>
            </div>
            <div className="text-[24px] font-bold text-forest-700 tabular-nums">
              {formatNgn(order.total_price)}
            </div>
          </div>
        </Card>

        <Card padding="none" className="mt-6 p-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center">
              <Bike className="size-5" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-foreground">
                Pay on delivery
              </div>
              <div className="text-[13px] text-muted-foreground">
                Status: <span className="capitalize">{statusLabel}</span>
              </div>
            </div>
          </div>
        </Card>
      </main>
    );
  }

  // Bank transfer flow
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-12 pb-24">
      <Eyebrow className="block mb-2">ORDER #{order.id}</Eyebrow>
      <h1 className="text-[28px] leading-[36px] font-bold text-foreground">
        {order.status === "awaiting_payment"
          ? "Almost done — pay to confirm"
          : "Payment received"}
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        Transfer the amount below from your banking app, then upload your
        receipt so the merchant can verify quickly.
      </p>

      {/* Status banner */}
      <div
        className={cn(
          "mt-6 rounded-md p-3 flex items-center gap-3",
          order.status === "awaiting_payment" && "bg-forest-50 border border-forest-100",
          order.status === "pending" && "bg-info/5 border border-info/20",
          (order.status === "accepted" || order.status === "shipped" || order.status === "completed") &&
            "bg-forest-50 border border-forest-100",
          order.status === "declined" && "bg-destructive/5 border border-destructive/20",
        )}
      >
        {order.status === "awaiting_payment" && <Banknote className="size-5 text-forest-700 shrink-0" />}
        {order.status === "pending" && <Loader2 className="size-5 text-info shrink-0 animate-spin" />}
        {(order.status === "accepted" ||
          order.status === "shipped" ||
          order.status === "completed") && (
          <CheckCircle2 className="size-5 text-forest-700 shrink-0" />
        )}
        <div className="text-[14px] font-semibold text-foreground">{statusLabel}</div>
      </div>

      {/* Amount + reference */}
      <Card padding="none" className="mt-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Eyebrow className="block">AMOUNT DUE</Eyebrow>
            <div className="mt-1 text-[36px] leading-[44px] font-bold text-forest-700 tabular-nums">
              {formatNgn(order.total_price)}
            </div>
          </div>
        </div>

        {order.payment_reference && (
          <button
            type="button"
            onClick={() => copy(order.payment_reference ?? "", "Reference")}
            className="w-full flex items-center justify-between gap-3 rounded-md border border-border bg-paper p-3 hover:bg-ink-50 transition-colors text-left"
          >
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">
                Reference (include in transfer)
              </div>
              <div className="mt-0.5 text-[15px] font-bold tabular-nums text-foreground">
                {order.payment_reference}
              </div>
            </div>
            <Copy className="size-4 text-ink-500 shrink-0" />
          </button>
        )}
      </Card>

      {/* Bank details */}
      {order.merchant_bank ? (
        <Card padding="none" className="mt-4 p-6">
          <Eyebrow className="block mb-3">TRANSFER TO</Eyebrow>
          <div className="flex flex-col gap-2.5">
            <Row
              label="Bank"
              value={order.merchant_bank.bank_name}
              onCopy={() => copy(order.merchant_bank!.bank_name, "Bank name")}
            />
            <Row
              label="Account number"
              value={order.merchant_bank.account_number}
              tabularValue
              onCopy={() =>
                copy(order.merchant_bank!.account_number, "Account number")
              }
            />
            {order.merchant_bank.account_name && (
              <Row
                label="Account name"
                value={order.merchant_bank.account_name}
                onCopy={() =>
                  copy(order.merchant_bank!.account_name!, "Account name")
                }
              />
            )}
          </div>
        </Card>
      ) : (
        <Card padding="none" className="mt-4 p-6">
          <p className="text-[14px] text-muted-foreground">
            The merchant hasn&apos;t added bank details yet. Please contact them
            on WhatsApp to arrange payment.
          </p>
        </Card>
      )}

      {/* Proof upload */}
      {order.status === "awaiting_payment" && (
        <Card padding="none" className="mt-4 p-6">
          <Eyebrow className="block mb-2">UPLOAD PAYMENT PROOF</Eyebrow>
          <p className="text-[13px] text-muted-foreground mb-3">
            Optional but speeds up verification — a screenshot of your bank app
            showing the transfer.
          </p>

          {order.payment_proof_url && !selectedFile && (
            <div className="mb-3">
              <div className="text-[12px] font-semibold text-forest-700 flex items-center gap-1.5 mb-2">
                <Check className="size-4" /> Proof on file
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.payment_proof_url}
                alt="Payment proof"
                className="rounded-md border border-border max-h-48 object-contain"
              />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />

          {previewUrl ? (
            <div className="mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Proof preview"
                className="rounded-md border border-border max-h-48 object-contain"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 rounded-md border-2 border-dashed border-ink-200 bg-ink-50 hover:bg-ink-100 transition-colors flex flex-col items-center justify-center gap-2 text-ink-500"
            >
              <Upload className="size-5" />
              <span className="text-[13px] font-semibold">
                Tap to choose an image
              </span>
              <span className="text-[12px] text-muted-foreground">
                JPG, PNG up to 5MB
              </span>
            </button>
          )}

          {selectedFile && (
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Upload proof"
                )}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Next steps */}
      <Card padding="none" className="mt-4 p-6">
        <Eyebrow className="block mb-3">WHAT HAPPENS NEXT</Eyebrow>
        <ol className="flex flex-col gap-3 text-[14px] text-foreground/80">
          <Step n={1} done text="You place the order." />
          <Step
            n={2}
            done={order.status !== "awaiting_payment"}
            text="Transfer the amount above with the reference number."
          />
          <Step
            n={3}
            done={
              order.status === "pending" ||
              order.status === "accepted" ||
              order.status === "shipped" ||
              order.status === "completed"
            }
            text="The merchant verifies the transfer in their bank app."
          />
          <Step
            n={4}
            done={
              order.status === "accepted" ||
              order.status === "shipped" ||
              order.status === "completed"
            }
            text="Merchant accepts the order and prepares it."
          />
          <Step
            n={5}
            done={order.status === "shipped" || order.status === "completed"}
            text="A rider is assigned and the order ships out."
          />
        </ol>
      </Card>

      <div className="mt-6 text-center">
        <Link
          href="/store"
          className="text-[14px] font-semibold text-forest-700 hover:text-forest-500"
        >
          ← Continue browsing
        </Link>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  onCopy,
  tabularValue,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  tabularValue?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="w-full flex items-center justify-between gap-3 rounded-md border border-border bg-paper p-3 hover:bg-ink-50 transition-colors text-left"
    >
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">
          {label}
        </div>
        <div
          className={cn(
            "mt-0.5 text-[15px] text-foreground truncate",
            tabularValue && "tabular-nums font-semibold",
          )}
        >
          {value}
        </div>
      </div>
      <Copy className="size-4 text-ink-500 shrink-0" />
    </button>
  );
}

function Step({ n, done, text }: { n: number; done: boolean; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div
        className={cn(
          "size-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5",
          done
            ? "bg-forest-700 text-white"
            : "bg-ink-100 text-ink-500",
        )}
      >
        {done ? <Check className="size-3" /> : n}
      </div>
      <span className={cn(done && "text-foreground", !done && "text-muted-foreground")}>
        {text}
      </span>
    </li>
  );
}
