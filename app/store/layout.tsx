import TopNav from "@/components/shared/TopNav";
import Link from "next/link";
import StoreSearchBox from "@/components/store/StoreSearchBox";
import { CartProvider } from "@/components/store/CartProvider";
import CartButton from "@/components/store/CartButton";
import CartDrawer from "@/components/store/CartDrawer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-paper">
        <TopNav
          variant="storefront"
          centerSlot={<StoreSearchBox placeholder="Search stores or products" />}
          rightSlot={
            <div className="flex items-center gap-3">
              <CartButton />
              <Link href="/login" className="text-[13px] font-medium text-ink-500 hover:text-foreground hidden sm:inline">
                Are you a merchant? <span className="text-forest-500">Sign in →</span>
              </Link>
            </div>
          }
        />
        {children}
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
