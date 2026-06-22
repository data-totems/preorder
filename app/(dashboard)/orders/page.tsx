"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ArrowRight, Box, Check, ChevronDown, Loader2, Plus, Truck } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Distribute from "@/components/orders/Distribute";
import {
  acceptOrder,
  declineOrder,
  getAcceptedOrders,
  getIncomingOrders,
  getShippedOrder,
} from "@/actions/orders.actions";
import { formatDateWithOrdinal, formatTimestamp } from "@/lib/reuseable";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/api";
import { errorMessage } from "@/lib/errors";

const distributeStepConfig = [
  { id: 1, title: "Select dispatch", icon: Truck },
  { id: 2, title: "Select product", icon: Box },
];

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
}: {
  orders: Order[];
  getDate: (order: Order) => string;
  renderActions?: (order: Order) => React.ReactNode;
}) => {
  const grouped = orders.reduce<Record<string, Order[]>>((acc, order) => {
    const date = new Date(getDate(order)).toISOString().split("T")[0];
    (acc[date] ??= []).push(order);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <>
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
  const [currentTab, setCurrentTab] = useState<string>("incoming");
  const [distributeDialog, setDistributeDialog] = useState(false);
  const [distributeStep, setDistributeStep] = useState(1);
  const [openCompleted, setOpenCompleted] = useState(false);
  const [addDispatchModal, setAddDispatchModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(0);

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [acceptedOrders, setAcceptedOrders] = useState<Order[] | null>(null);
  const [shippedOrders, setShippedOrders] = useState<Order[] | null>(null);

  const [accepting, setAccepting] = useState<number | null>(null);
  const [declining, setDeclining] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [inc, acc, ship] = await Promise.all([
          getIncomingOrders(),
          getAcceptedOrders(),
          getShippedOrder(),
        ]);
        if (!alive) return;
        setOrders(inc.data?.orders ?? []);
        setAcceptedOrders(acc.data?.orders ?? []);
        setShippedOrders(ship.data?.orders ?? []);
      } catch (error) {
        if (alive) {
          toast.error(errorMessage(error, "Could not load orders."));
          setOrders([]);
          setAcceptedOrders([]);
          setShippedOrders([]);
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
        setOrders((prev) => (prev ?? []).filter((o) => o.id !== orderId));
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

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      <PageHeader
        eyebrow="ORDERS"
        title="Your orders"
        description="Manage incoming orders and dispatch."
        actions={
          <Button onClick={() => setDistributeDialog(true)}>
            <Truck className="size-4" /> Distribute
          </Button>
        }
      />

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="px-6 md:px-10 pb-12">
        <TabsList variant="underline">
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
            <DateGroupedOrders orders={acceptedOrders} getDate={(o) => o.updated_at} />
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
          <EmptyState
            icon={<Box />}
            title="No declined orders"
            description="Declined orders will appear here for your records."
          />
        </TabsContent>
      </Tabs>

      <Dialog open={distributeDialog} onOpenChange={setDistributeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Distribute order</DialogTitle>
            <DialogDescription>
              Pick a dispatch rider and the product you want to send out.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 mt-2">
            {distributeStepConfig.map((item, idx) => {
              const Icon = item.icon;
              const active = distributeStep === item.id;
              return (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <Icon
                      className={cn("size-5", active ? "text-forest-700" : "text-ink-300")}
                    />
                    <span
                      className={cn(
                        "mt-1 text-[10px] font-semibold tracking-[0.04em] uppercase",
                        active ? "text-forest-700" : "text-ink-500",
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                  {idx < distributeStepConfig.length - 1 && (
                    <div className="h-px w-10 bg-border" />
                  )}
                </div>
              );
            })}
          </div>

          <Distribute
            currentStep={distributeStep}
            setCurrentStep={setDistributeStep}
            setOpen={setDistributeDialog}
            openCompleted={openCompleted}
            setOpenCompleted={setOpenCompleted}
            setDispatchModal={setAddDispatchModal}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={openCompleted} onOpenChange={setOpenCompleted}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="sr-only">Distribution successful</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Your product distribution has been initiated.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col items-center justify-center py-4">
            <div className="bg-forest-500/15 size-20 rounded-full flex items-center justify-center">
              <div className="bg-forest-500/15 size-16 rounded-full flex items-center justify-center">
                <div className="bg-forest-500 size-12 rounded-full flex items-center justify-center">
                  <Check className="size-5 text-white" />
                </div>
              </div>
            </div>
            <h3 className="mt-4 text-[20px] font-bold text-foreground">Successful</h3>
            <span className="mt-1 text-[13px] text-muted-foreground text-center max-w-[220px]">
              Your product distribution has been initiated.
            </span>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="w-full">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={addDispatchModal} onOpenChange={setAddDispatchModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add one-time dispatch</DialogTitle>
            <DialogDescription>Register a rider for this distribution.</DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dispatch-name">Dispatch name</Label>
              <Input id="dispatch-name" placeholder="e.g. Dispatch IV" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dispatch-phone">Phone number</Label>
              <Input id="dispatch-phone" type="tel" placeholder="+234902 …" />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Vehicle</Label>
              <div className="flex items-center gap-3">
                {["Motorcycle", "Car"].map((item, index) => {
                  const active = selectedRide === index;
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setSelectedRide(index)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md border transition-colors",
                        active
                          ? "border-forest-500 bg-forest-50 text-forest-700"
                          : "border-border bg-paper text-foreground hover:bg-ink-50",
                      )}
                    >
                      <span
                        className={cn(
                          "size-4 rounded-full border flex items-center justify-center transition-colors",
                          active ? "border-forest-500" : "border-ink-300",
                        )}
                      >
                        {active && <span className="size-2 rounded-full bg-forest-500" />}
                      </span>
                      <span className="text-[13px] font-semibold">{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dispatch-plate">Plate number</Label>
              <Input id="dispatch-plate" placeholder="e.g. BND-209-JX" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Button variant="ghost" className="text-forest-700">
              <Plus className="size-4" /> Register dispatch
            </Button>
            <Button
              onClick={() => {
                setDistributeStep(2);
                setDistributeDialog(true);
                setAddDispatchModal(false);
              }}
            >
              Use dispatch <ArrowRight className="size-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
