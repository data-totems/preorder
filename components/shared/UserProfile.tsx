"use client";
import { ChevronsUpDown, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/zustand";
import { useLogout } from "@/lib/useLogout";

const initials = (name?: string | null) => {
  if (!name) return "B";
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "B"
  );
};

const UserProfile = () => {
  const user = useUserStore((s) => s.user);
  const handleLogout = useLogout();

  const name = user?.fullName ?? "Welcome";
  const business = user?.business_name ?? "Set up your store";
  const email = user?.email ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="group w-full rounded-md bg-white/5 hover:bg-white/10 data-[state=open]:bg-white/10 p-3 mt-4 flex items-center gap-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-900"
        >
          <div className="h-9 w-9 rounded-full bg-forest-400 text-white flex items-center justify-center font-bold text-[13px] shrink-0">
            {initials(name)}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="text-[14px] font-semibold text-ink-100 truncate">
              {name}
            </div>
            <div className="text-[12px] text-ink-300 truncate">{business}</div>
          </div>
          <ChevronsUpDown className="size-4 text-ink-300 group-hover:text-ink-100 transition-colors shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="right" sideOffset={8} className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-[14px] font-semibold text-foreground truncate">
            {name}
          </span>
          {email && (
            <span className="text-[12px] text-muted-foreground font-normal truncate">
              {email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="cursor-pointer"
        >
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
