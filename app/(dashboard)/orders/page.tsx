"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Box, ChevronDown, Download, Loader2, Truck } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import DataPagination, { usePaginated } from "@/components/shared/DataPagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  acceptOrder,
  declineOrder,
  exportOrders,
  getAcceptedOrders,
  getAwaitingPaymentOrders,
  getDeclinedOrders,
  getIncomingOrders,
  getShippedOrder,
  markOrderPaid,
  shipOrder,
} from "@/actions/orders.actions";
import { formatDateWithOrdinal, formatTimestamp } from "@/lib/reuseable";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/api";
import { errorMessage } from "@/lib/errors";
import ShipDialog from "@/components/orders/ShipDialog";

type Row = { order: Order; actions?: React.ReactNode };

const OrderRow = ({ order, actions }: Row) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card padding="compact" className="px-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative size-14 rounded-md bg-ink-100 overflow-hidden shrink-0">
              {order.product_details?.primary_image && (
                <Image
                  src={order.product_details.primary_image}
                  alt={order.product_details.name ?? ""}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-foreground truncate">
                {order.customer_name}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[13px] text-muted-foreground tabular-nums">
                <span className="font-semibold text-forest-700">₦{order.total_price}</span>
                <span>·</span>
                <span>#{order.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              {expanded ? "Less" : "More"}
              <ChevronDown
                className={cn("size-4 transition-transform", expanded && "rotate-180")}
              />
            </Button>
            {actions}
          </div>
        </div>

        {expanded && (
          <div className="border-t border-border pt-3 flex flex-col gap-2 text-[13px]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Contact</span>
              <span className="text-foreground">{order.customer_whatsapp}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Time</span>
              <span className="text-foreground">{formatTimestamp(order.updated_at)}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Address</span>
              <span className="text-foreground text-right break-words">
                {order.customer_address}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Payment</span>
              <span className="text-foreground capitalize">
                {order.payment_method?.replace("_", " ") ?? "—"}
              </span>
            </div>
            {order.payment_reference && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Reference</span>
                <span className="text-foreground tabular-nums font-semibold">
                  {order.payment_reference}
                </span>
              </div>
            )}
            {order.payment_proof_url && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Proof</span>
                <a
                  href={order.payment_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.payment_proof_url}
                    alt="Payment proof"
                    className="rounded-md border border-border max-h-32 object-contain"
                  />
                </a>
              </div>
            )}
            {order.dispatcher_details && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Rider</span>
                <span className="text-foreground text-right">
                  {order.dispatcher_details.name} · {order.dispatcher_details.phone_number}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

const DeclineButton = ({
  orderId,
  onConfirm,
  declining,
}: {
  orderId: number;
  onConfirm: (orderId: number, reason: string) => Promise<boolean>;
  declining: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          Decline
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Decline this order?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be reversed. The customer will be notified with your reason.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3">
          <Label htmlFor={`decline-reason-${orderId}`}>Reason for declining</Label>
          <Textarea
            id={`decline-reason-${orderId}`}
            placeholder="A message to your customer"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!reason.trim() || declining}
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={async (e) => {
              e.preventDefault();
              const ok = await onConfirm(orderId, reason.trim());
              if (ok) {
                setOpen(false);
                setReason("");
              }
            }}
          >
            {declining && <Loader2 className="size-4 animate-spin" />}
            Decline order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const DateGroupedOrders = ({
  orders,
  getDate,
  renderActions,
  pageSize = 12,
}: {
  orders: Order[];
  getDate: (order: Order) => string;
  renderActions?: (order: Order) => React.ReactNode;
  pageSize?: number;
}) => {
  const { slice, page, setPage, totalItems } = usePaginated(orders, pageSize);
  const topRef = useRef<HTMLDivElement>(null);

  const grouped = slice.reduce<Record<string, Order[]>>((acc, order) => {
    const date = new Date(getDate(order)).toISOString().split("T")[0];
    (acc[date] ??= []).push(order);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <>
      <div ref={topRef} />
      {sortedDates.map((date) => (
        <section key={date}>
          <Eyebrow className="block mb-3">
            {formatDateWithOrdinal(date + "T00:00:00.000Z")}
          </Eyebrow>
          <div className="flex flex-col gap-3">
            {grouped[date].map((order) => (
              <OrderRow key={order.id} order={order} actions={renderActions?.(order)} />
            ))}
          </div>
        </section>
      ))}
      <DataPagination
        totalItems={totalItems}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        scrollTargetRef={topRef}
        className="pt-2"
      />
    </>
  );
};

const TabSkeleton = () => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-20 w-full rounded-lg" />
    ))}
  </div>
);

const Orders = () => {
  const [currentTab, setCurrentTab] = useState<string>("awaiting_payment");
  const [exporting, setExporting] = useState<"all" | "tab" | null>(null);

  const TAB_TO_STATUS: Record<string, string> = {
    awaiting_payment: "awaiting_payment",
    incoming: "pending",
    accepted: "accepted",
    shipped: "shipped",
    declined: "declined",
  };

  const handleExport = async (scope: "all" | "tab") => {
    setExporting(scope);
    try {
      const statusFilter = scope === "tab" ? TAB_TO_STATUS[currentTab] : undefined;
      const blob = await exportOrders(statusFilter);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const tag = scope === "tab" ? `-${currentTab}` : "";
      a.download = `buzzmart-orders${tag}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Orders CSV downloaded");
    } catch (error) {
      toast.error(errorMessage(error, "Export failed."));
    } finally {
      setExporting(null);
    }
  };

  const [awaitingPayment, setAwaitingPayment] = useState<Order[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [acceptedOrders, setAcceptedOrders] = useState<Order[] | null>(null);
  const [shippedOrders, setShippedOrders] = useState<Order[] | null>(null);
  const [declinedOrders, setDeclinedOrders] = useState<Order[] | null>(null);
  const [markingPaid, setMarkingPaid] = useState<number | null>(null);

  const [accepting, setAccepting] = useState<number | null>(null);
  const [declining, setDeclining] = useState<number | null>(null);
  const [shipping, setShipping] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [awp, inc, acc, ship, dec] = await Promise.all([
          getAwaitingPaymentOrders(),
          getIncomingOrders(),
          getAcceptedOrders(),
          getShippedOrder(),
          getDeclinedOrders(),
        ]);
        if (!alive) return;
        setAwaitingPayment(awp.data?.orders ?? []);
        setOrders(inc.data?.orders ?? []);
        setAcceptedOrders(acc.data?.orders ?? []);
        setShippedOrders(ship.data?.orders ?? []);
        setDeclinedOrders(dec.data?.orders ?? []);
      } catch (error) {
        if (alive) {
          toast.error(errorMessage(error, "Could not load orders."));
          setAwaitingPayment([]);
          setOrders([]);
          setAcceptedOrders([]);
          setShippedOrders([]);
          setDeclinedOrders([]);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleAccept = async (orderId: number) => {
    setAccepting(orderId);
    try {
      const response = await acceptOrder(orderId);
      if (response.status === 200) {
        toast.success("Order accepted");
        const accepted = orders?.find((o) => o.id === orderId);
        setOrders((prev) => (prev ?? []).filter((o) => o.id !== orderId));
        if (accepted) {
          const stamped = { ...accepted, updated_at: new Date().toISOString() };
          setAcceptedOrders((prev) => [stamped, ...(prev ?? [])]);
        }
      }
    } catch (error) {
      toast.error(errorMessage(error, "Could not accept order."));
    } finally {
      setAccepting(null);
    }
  };

  const handleDecline = async (orderId: number, _reason: string): Promise<boolean> => {
    setDeclining(orderId);
    try {
      const response = await declineOrder(orderId);
      if (response.status === 200) {
        toast.success("Order declined");
        const declined = orders?.find((o) => o.id === orderId);
        setOrders((prev) => (prev ?? []).filter((o) => o.id !== orderId));
        if (declined) {
          const stamped = { ...declined, updated_at: new Date().toISOString() };
          setDeclinedOrders((prev) => [stamped, ...(prev ?? [])]);
        }
        return true;
      }
      return false;
    } catch (error) {
      toast.error(errorMessage(error, "Could not decline order."));
      return false;
    } finally {
      setDeclining(null);
    }
  };

  const handleMarkPaid = async (orderId: number) => {
    setMarkingPaid(orderId);
    try {
      const response = await markOrderPaid(orderId);
      if (response.status === 200) {
        toast.success("Marked as paid");
        const updated = response.data;
        setAwaitingPayment((prev) => (prev ?? []).filter((o) => o.id !== orderId));
        setOrders((prev) => [updated, ...(prev ?? [])]);
      }
    } catch (error) {
      toast.error(errorMessage(error, "Could not mark as paid."));
    } finally {
      setMarkingPaid(null);
    }
  };

  const handleShip = async (orderId: number, dispatcherId: number): Promise<boolean> => {
    setShipping(orderId);
    try {
      const response = await shipOrder(orderId, dispatcherId);
      if (response.status === 200) {
        toast.success("Order shipped");
        const updated = response.data;
        setAcceptedOrders((prev) => (prev ?? []).filter((o) => o.id !== orderId));
        setShippedOrders((prev) => [updated, ...(prev ?? [])]);
        return true;
      }
      return false;
    } catch (error) {
      toast.error(errorMessage(error, "Could not ship order."));
      return false;
    } finally {
      setShipping(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      <PageHeader
        eyebrow="ORDERS"
        title="Your orders"
        description="Accept, ship, and track every customer order."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Download orders CSV"
              className="inline-flex items-center justify-center h-11 px-4 gap-2 rounded-md border border-border bg-transparent text-foreground hover:bg-ink-50 text-[15px] font-semibold transition-colors duration-150 disabled:opacity-50"
              disabled={exporting !== null}
            >
              <Download className="size-4" />
              {exporting !== null ? "Exporting…" : "Download CSV"}
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => handleExport("tab")}
                disabled={exporting !== null}
                className="cursor-pointer"
              >
                <Download className="size-4" /> Current tab only
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("all")}
                disabled={exporting !== null}
                className="cursor-pointer"
              >
                <Download className="size-4" /> All orders
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="px-6 md:px-10 pb-12">
        <TabsList variant="underline">
          <TabsTrigger value="awaiting_payment" variant="underline">
            Awaiting payment
            {awaitingPayment && awaitingPayment.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-pill bg-warning/15 text-warning text-[11px] font-bold tabular-nums">
                {awaitingPayment.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="incoming" variant="underline">
            Incoming
          </TabsTrigger>
          <TabsTrigger value="accepted" variant="underline">
            Accepted
          </TabsTrigger>
          <TabsTrigger value="shipped" variant="underline">
            Shipped
          </TabsTrigger>
          <TabsTrigger value="declined" variant="underline">
            Declined
          </TabsTrigger>
        </TabsList>

        <TabsContent value="awaiting_payment" className="mt-6 flex flex-col gap-6">
          {awaitingPayment === null ? (
            <TabSkeleton />
          ) : awaitingPayment.length === 0 ? (
            <EmptyState
              icon={<Box />}
              title="No awaiting payments"
              description="Bank-transfer orders waiting for your verification will appear here."
            />
          ) : (
            <DateGroupedOrders
              orders={awaitingPayment}
              getDate={(o) => o.created_at}
              renderActions={(order) => (
                <Button
                  size="sm"
                  disabled={markingPaid === order.id}
                  onClick={() => handleMarkPaid(order.id)}
                >
                  {markingPaid === order.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Mark paid"
                  )}
                </Button>
              )}
            />
          )}
        </TabsContent>

        <TabsContent value="incoming" className="mt-6 flex flex-col gap-6">
          {orders === null ? (
            <TabSkeleton />
          ) : orders.length === 0 ? (
            <EmptyState
              icon={<Box />}
              title="No incoming orders"
              description="When customers place orders from your store, they'll show up here."
            />
          ) : (
            <DateGroupedOrders
              orders={orders}
              getDate={(o) => o.created_at}
              renderActions={(order) => (
                <>
                  <DeclineButton
                    orderId={order.id}
                    onConfirm={handleDecline}
                    declining={declining === order.id}
                  />
                  <Button
                    size="sm"
                    disabled={accepting === order.id}
                    onClick={() => handleAccept(order.id)}
                  >
                    {accepting === order.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Accept"
                    )}
                  </Button>
                </>
              )}
            />
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-6 flex flex-col gap-6">
          {acceptedOrders === null ? (
            <TabSkeleton />
          ) : acceptedOrders.length === 0 ? (
            <EmptyState
              icon={<Box />}
              title="No accepted orders"
              description="Accept an incoming order to see it here."
            />
          ) : (
            <DateGroupedOrders
              orders={acceptedOrders}
              getDate={(o) => o.updated_at}
              renderActions={(order) => (
                <ShipDialog
                  orderId={order.id}
                  shipping={shipping === order.id}
                  onConfirm={handleShip}
                />
              )}
            />
          )}
        </TabsContent>

        <TabsContent value="shipped" className="mt-6 flex flex-col gap-6">
          {shippedOrders === null ? (
            <TabSkeleton />
          ) : shippedOrders.length === 0 ? (
            <EmptyState
              icon={<Truck />}
              title="No shipped orders"
              description="Orders you've dispatched will appear here."
            />
          ) : (
            <DateGroupedOrders orders={shippedOrders} getDate={(o) => o.updated_at} />
          )}
        </TabsContent>

        <TabsContent value="declined" className="mt-6 flex flex-col gap-6">
          {declinedOrders === null ? (
            <TabSkeleton />
          ) : declinedOrders.length === 0 ? (
            <EmptyState
              icon={<Box />}
              title="No declined orders"
              description="When you decline an order, it'll appear here for your records."
            />
          ) : (
            <DateGroupedOrders
              orders={declinedOrders}
              getDate={(o) => o.updated_at}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Orders;
