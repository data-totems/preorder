import TopNav from "@/components/shared/TopNav";
import Link from "next/link";
import { Search } from "lucide-react";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <TopNav
        variant="storefront"
        centerSlot={
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-300" />
            <input
              placeholder="Search stores or products"
              className="w-full h-10 rounded-md bg-ink-100 border-0 pl-10 pr-3 text-[14px] placeholder:text-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-white"
            />
          </div>
        }
        rightSlot={
          <Link href="/login" className="text-[13px] font-medium text-ink-500 hover:text-foreground">
            Are you a merchant? <span className="text-forest-500">Sign in →</span>
          </Link>
        }
      />
      {children}
    </div>
  );
}
