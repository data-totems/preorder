import TopNav from "@/components/shared/TopNav";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <TopNav
        variant="minimal"
        rightSlot={
          <Link href="/register" className="text-[13px] font-medium text-ink-500 hover:text-foreground">
            New here? <span className="text-forest-500 underline-offset-4 hover:underline">Create account</span>
          </Link>
        }
      />
      <div className="flex-1 flex">{children}</div>
    </div>
  );
}
