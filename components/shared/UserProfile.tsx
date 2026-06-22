"use client";
import { useUserStore } from "@/zustand";

const initials = (name?: string | null) => {
  if (!name) return "B";
  return name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "B";
};

const UserProfile = () => {
  const user = useUserStore((s) => s.user);
  const name = user?.fullName ?? "Welcome";
  const business = user?.business_name ?? "Set up your store";
  return (
    <div className="rounded-md bg-white/5 p-3 mt-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-forest-400 text-white flex items-center justify-center font-bold text-[13px]">
        {initials(name)}
      </div>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-ink-100 truncate">{name}</div>
        <div className="text-[12px] text-ink-300 truncate">{business}</div>
      </div>
    </div>
  );
};

export default UserProfile;
