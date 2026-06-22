"use client";
import { useState } from "react";
import { Camera, Laptop, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import EditableField from "@/components/manage/EditableField";
import { useUserStore } from "@/zustand";
import { updateProfileDetails } from "@/actions/auth.actions";
import { errorMessage } from "@/lib/errors";
import { useLogout } from "@/lib/useLogout";

type FieldKey = "fullName" | "phoneNumber" | "email" | "address";

export default function Account() {
  const { user, setUser } = useUserStore((state) => state);
  const [editing, setEditing] = useState<FieldKey | null>(null);
  const handleLogout = useLogout();

  const initials =
    user?.fullName
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "U";

  const save = async (field: FieldKey, value: string) => {
    try {
      const payload: Record<string, string> = {};
      if (field === "fullName") payload.full_name = value;
      else if (field === "phoneNumber") payload.phone_number = value;
      else if (field === "address") payload.address = value;
      else return;

      const response = await updateProfileDetails(payload);
      if (response.status === 200) {
        toast.success("Profile updated");
        if (response.data && user) {
          setUser({ ...user, ...response.data });
        }
        setEditing(null);
      }
    } catch (e) {
      toast.error(errorMessage(e, "Could not update profile."));
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <section>
        <Eyebrow className="block mb-4">ACCOUNT DETAILS</Eyebrow>

        <div className="flex items-center gap-4 mb-6">
          <div className="size-16 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-bold text-[20px]">
            {initials}
          </div>
          <Button variant="outline" size="sm" disabled>
            <Camera className="size-4" /> Change photo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EditableField
            label="Full name"
            value={user?.fullName ?? ""}
            placeholder="Your full name"
            editing={editing === "fullName"}
            onEdit={() => setEditing("fullName")}
            onSave={(v) => save("fullName", v)}
            onCancel={() => setEditing(null)}
          />
          <EditableField
            label="Phone"
            value={user?.phoneNumber ?? ""}
            placeholder="+234 …"
            type="tel"
            editing={editing === "phoneNumber"}
            onEdit={() => setEditing("phoneNumber")}
            onSave={(v) => save("phoneNumber", v)}
            onCancel={() => setEditing(null)}
          />
          <EditableField
            label="Email"
            value={user?.email ?? ""}
            placeholder="you@example.com"
            type="email"
            disabled
            editing={false}
            onEdit={() => {}}
            onSave={() => {}}
            onCancel={() => {}}
          />
          <EditableField
            label="Address"
            value={user?.address ?? ""}
            placeholder="Your address"
            editing={editing === "address"}
            onEdit={() => setEditing("address")}
            onSave={(v) => save("address", v)}
            onCancel={() => setEditing(null)}
          />
        </div>
      </section>

      <section>
        <Eyebrow className="block mb-4">ACCOUNT SECURITY</Eyebrow>
        <div className="flex flex-col divide-y divide-border">
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <div className="text-[14px] font-semibold text-foreground">Password</div>
              <div className="text-[13px] text-muted-foreground">
                Update the password you use to sign in.
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Change
            </Button>
          </div>
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <div className="text-[14px] font-semibold text-foreground">
                Two-factor authentication
              </div>
              <div className="text-[13px] text-muted-foreground">
                Add an extra layer of security at sign-in.
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Set up
            </Button>
          </div>
        </div>
      </section>

      <section>
        <Eyebrow className="block mb-4">SESSIONS</Eyebrow>
        <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-paper p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-md bg-forest-50 text-forest-700 flex items-center justify-center">
              <Laptop className="size-5" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-foreground">Current session</div>
              <div className="text-[12px] text-muted-foreground">Active now · this device</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-destructive hover:text-destructive"
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </section>
    </div>
  );
}
