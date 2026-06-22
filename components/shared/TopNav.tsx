"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopNavProps {
  variant?: "minimal" | "storefront" | "silent";
  rightSlot?: React.ReactNode;
  centerSlot?: React.ReactNode;
  className?: string;
}

const TopNav = ({ variant = "minimal", rightSlot, centerSlot, className }: TopNavProps) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-14 md:h-16 bg-paper/80 backdrop-blur border-b border-border",
        className
      )}
    >
      <div className="h-full mx-auto max-w-7xl px-6 md:px-10 flex items-center justify-between gap-6">
        <Link href="/" className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
          Buzzmart
        </Link>
        {variant === "storefront" && centerSlot && (
          <div className="hidden md:flex flex-1 justify-center max-w-md">{centerSlot}</div>
        )}
        {variant !== "silent" && rightSlot && (
          <div className="flex items-center gap-3">{rightSlot}</div>
        )}
      </div>
    </header>
  );
};

export default TopNav;
export { TopNav };
