"use client";
import { useEffect, useState } from "react";
import { Loader2, Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eyebrow } from "@/components/ui/eyebrow";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/errors";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { createDispatch, listDispatch } from "@/actions/products.actions";

interface Dispatcher {
  id: number;
  name: string;
  phone_number: string;
  vehicle_type: string;
  plate_number?: string;
}

interface Props {
  orderId: number;
  shipping: boolean;
  onConfirm: (orderId: number, dispatcherId: number) => Promise<boolean>;
}

export default function ShipDialog({ orderId, shipping, onConfirm }: Props) {
  const [open, setOpen] = useState(false);
  const [dispatchers, setDispatchers] = useState<Dispatcher[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    vehicle_type: "motorcycle" as "motorcycle" | "car",
    plate_number: "",
  });

  useEffect(() => {
    if (!open) return;
    let alive = true;
    listDispatch()
      .then((r) => {
        if (!alive) return;
        if (Array.isArray(r.data)) {
          setDispatchers(r.data);
          if (r.data.length === 0) setShowAdd(true);
          else if (!selectedId) setSelectedId(String(r.data[0].id));
        } else {
          setDispatchers([]);
          setShowAdd(true);
        }
      })
      .catch(() => {
        if (!alive) return;
        // No dispatcher profile yet — backend 404s. Treat as empty.
        setDispatchers([]);
        setShowAdd(true);
      });
    return () => {
      alive = false;
    };
  }, [open]);

  const handleQuickAdd = async () => {
    if (
      !form.name.trim() ||
      !form.phone_number.trim() ||
      !form.plate_number.trim()
    ) {
      toast.error("Name, phone, and plate are required.");
      return;
    }
    if (!isValidPhone(form.phone_number)) {
      toast.error("Enter a valid phone number (e.g. +234 or 080…).");
      return;
    }
    setAdding(true);
    try {
      const r = await createDispatch({
        name: form.name.trim(),
        phone_number: normalizePhone(form.phone_number) ?? form.phone_number.trim(),
        vehicle_type: form.vehicle_type,
        plate_number: form.plate_number.trim(),
        // Quick-add stubs — merchant can fill these in later in Settings.
        address: "—",
        next_of_kin: "—",
        bank_name: "—",
        account_number: "0000000000",
        account_name: "—",
        location_area: "Local",
        peferred_transport_area: "anywhere",
        is_available: true,
      });
      const added: Dispatcher = r.data;
      setDispatchers((prev) => [added, ...(prev ?? [])]);
      setSelectedId(String(added.id));
      setShowAdd(false);
      setForm({
        name: "",
        phone_number: "",
        vehicle_type: "motorcycle",
        plate_number: "",
      });
      toast.success("Rider added");
    } catch (e) {
      toast.error(errorMessage(e, "Could not add rider."));
    } finally {
      setAdding(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedId) {
      toast.error("Pick a rider first.");
      return;
    }
    const ok = await onConfirm(orderId, Number(selectedId));
    if (ok) {
      setOpen(false);
      setSelectedId("");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" disabled={shipping}>
          {shipping ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Truck className="size-4" /> Ship
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Ship order #{orderId}</AlertDialogTitle>
          <AlertDialogDescription>
            Pick the rider who will deliver this order to the customer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {dispatchers === null ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : dispatchers.length > 0 && !showAdd ? (
            <>
              <div className="flex flex-col gap-2">
                <Label>Rider</Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a rider" />
                  </SelectTrigger>
                  <SelectContent>
                    {dispatchers.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name} · {d.phone_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-forest-700 self-start"
                onClick={() => setShowAdd(true)}
              >
                <Plus className="size-4" /> Add new rider
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-3 rounded-md bg-paper border border-border p-4">
              <Eyebrow className="block">NEW RIDER</Eyebrow>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`rider-name-${orderId}`}>Name</Label>
                <Input
                  id={`rider-name-${orderId}`}
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`rider-phone-${orderId}`}>Phone</Label>
                <Input
                  id={`rider-phone-${orderId}`}
                  type="tel"
                  placeholder="+234 …"
                  value={form.phone_number}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone_number: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Vehicle</Label>
                <div className="flex gap-2">
                  {(["motorcycle", "car"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, vehicle_type: v }))
                      }
                      className={cn(
                        "px-3 py-1.5 rounded-md border text-[13px] font-medium capitalize transition-colors",
                        form.vehicle_type === v
                          ? "border-forest-500 bg-forest-50 text-forest-700"
                          : "border-border bg-paper text-foreground hover:bg-ink-50",
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`rider-plate-${orderId}`}>Plate number</Label>
                <Input
                  id={`rider-plate-${orderId}`}
                  placeholder="e.g. AKD123XY"
                  value={form.plate_number}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, plate_number: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center justify-end gap-2 mt-2">
                {dispatchers && dispatchers.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdd(false)}
                  >
                    Cancel
                  </Button>
                )}
                <Button size="sm" onClick={handleQuickAdd} disabled={adding}>
                  {adding ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Save rider"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={shipping || !selectedId || showAdd}
          >
            {shipping && <Loader2 className="size-4 animate-spin" />}
            Confirm ship
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
