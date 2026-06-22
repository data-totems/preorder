"use client";
import { useEffect, useState } from "react";
import { Bike, Car, Loader2, Phone, Plus, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/shared/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/errors";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import {
  createDispatch,
  deleteDispatch,
  listDispatch,
} from "@/actions/products.actions";

interface Rider {
  id: number;
  name: string;
  phone_number: string;
  vehicle_type: string;
  plate_number?: string;
  location_area?: string;
  is_available?: boolean;
}

const vehicleIconFor = (v: string) => (v === "car" ? Car : Bike);

const initialFormState = {
  name: "",
  phone_number: "",
  vehicle_type: "motorcycle" as "motorcycle" | "car",
  plate_number: "",
};

export default function Dispatch() {
  const [riders, setRiders] = useState<Rider[] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [pendingDelete, setPendingDelete] = useState<Rider | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadRiders = async () => {
    try {
      const r = await listDispatch();
      setRiders(Array.isArray(r.data) ? r.data : []);
    } catch {
      // Backend returns 404 when the merchant has no riders yet.
      setRiders([]);
    }
  };

  useEffect(() => {
    loadRiders();
  }, []);

  const resetForm = () => setForm(initialFormState);

  const handleSave = async () => {
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
    setSaving(true);
    try {
      const r = await createDispatch({
        name: form.name.trim(),
        phone_number: normalizePhone(form.phone_number) ?? form.phone_number.trim(),
        vehicle_type: form.vehicle_type,
        plate_number: form.plate_number.trim(),
        // Stubs for fields not collected in this quick-add form.
        address: "—",
        next_of_kin: "—",
        bank_name: "—",
        account_number: "0000000000",
        account_name: "—",
        location_area: "Local",
        peferred_transport_area: "anywhere",
        is_available: true,
      });
      const added: Rider = r.data;
      setRiders((prev) => [added, ...(prev ?? [])]);
      setAddOpen(false);
      resetForm();
      toast.success("Rider added");
    } catch (e) {
      toast.error(errorMessage(e, "Could not add rider."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const r = await deleteDispatch(pendingDelete.id);
      if (r.status >= 200 && r.status < 300) {
        toast.success("Rider removed");
        setRiders((prev) =>
          (prev ?? []).filter((d) => d.id !== pendingDelete.id),
        );
        setPendingDelete(null);
      }
    } catch (e) {
      toast.error(errorMessage(e, "Could not remove rider."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow className="block mb-2">DISPATCH RIDERS</Eyebrow>
          <p className="text-[14px] text-muted-foreground max-w-md">
            The riders you can assign when shipping accepted orders. They&apos;re scoped to your store.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" /> Add rider
        </Button>
      </div>

      {riders === null ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      ) : riders.length === 0 ? (
        <EmptyState
          icon={<Truck />}
          title="No riders yet"
          description="Add a rider here, then you can pick them when shipping an order."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4" /> Add your first rider
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {riders.map((r) => {
            const Icon = vehicleIconFor(r.vehicle_type);
            return (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="size-10 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-bold text-[13px] shrink-0">
                    {r.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((s) => s[0]?.toUpperCase())
                      .join("") || "R"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[15px] font-semibold text-foreground truncate">
                        {r.name}
                      </span>
                      <Badge
                        variant="default"
                        className={cn(
                          "bg-ink-100 capitalize",
                          r.is_available === false && "bg-warning/10 text-warning",
                        )}
                      >
                        <Icon className="size-3" /> {r.vehicle_type}
                      </Badge>
                      {r.plate_number && (
                        <Badge className="bg-ink-100 tabular-nums uppercase">
                          {r.plate_number}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 text-[13px] text-muted-foreground flex items-center gap-1.5 tabular-nums">
                      <Phone className="size-3.5" />
                      {r.phone_number}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive shrink-0"
                  aria-label={`Remove ${r.name}`}
                  onClick={() => setPendingDelete(r)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add rider</DialogTitle>
            <DialogDescription>
              Quick-add the essentials. You can fill in bank + address details later.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-rider-name">Name</Label>
              <Input
                id="add-rider-name"
                placeholder="Full name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-rider-phone">Phone</Label>
              <Input
                id="add-rider-phone"
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
                    onClick={() => setForm((f) => ({ ...f, vehicle_type: v }))}
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
              <Label htmlFor="add-rider-plate">Plate number</Label>
              <Input
                id="add-rider-plate"
                placeholder="e.g. AKD123XY"
                value={form.plate_number}
                onChange={(e) =>
                  setForm((f) => ({ ...f, plate_number: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Add rider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They won&apos;t be available to assign to new shipments. Orders
              previously assigned to them stay attached.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
