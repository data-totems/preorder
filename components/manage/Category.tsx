"use client";
import { Briefcase, CreditCard, Link2, Truck, User } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Account", icon: User },
  { name: "Business", icon: Briefcase },
  { name: "Payment", icon: CreditCard },
  { name: "Dispatch", icon: Truck },
  { name: "Store link", icon: Link2 },
];

interface Props {
  currentTab: number;
  setCurrentTab: (value: number) => void;
}

export default function Category({ currentTab, setCurrentTab }: Props) {
  return (
    <nav aria-label="Settings sections" className="flex flex-col gap-1">
      <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-ink-500 px-3 mb-2">
        Sections
      </span>
      {categories.map((c, idx) => {
        const Icon = c.icon;
        const active = currentTab === idx;
        return (
          <button
            key={c.name}
            type="button"
            onClick={() => setCurrentTab(idx)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 h-10 px-3 rounded-md text-[14px] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active
                ? "bg-forest-100 text-forest-700 font-semibold"
                : "text-ink-500 hover:bg-ink-50 hover:text-foreground font-medium",
            )}
          >
            <Icon className="size-4" />
            <span>{c.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
