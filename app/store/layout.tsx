import TopNav from "@/components/shared/TopNav";
import Link from "next/link";
import StoreSearchBox from "@/components/store/StoreSearchBox";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <TopNav
        variant="storefront"
        centerSlot={<StoreSearchBox placeholder="Search stores or products" />}
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
