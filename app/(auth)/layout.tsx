"use client";
import { usePathname } from "next/navigation";
import TopNav from "@/components/shared/TopNav";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onRegister = pathname?.startsWith("/register");
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <TopNav
        variant="minimal"
        rightSlot={
          onRegister ? (
            <Link href="/login" className="text-sm font-medium text-ink-500 hover:text-foreground">
              Already registered? <span className="text-forest-500 underline-offset-4 hover:underline">Sign in</span>
            </Link>
          ) : (
            <Link href="/register" className="text-sm font-medium text-ink-500 hover:text-foreground">
              New here? <span className="text-forest-500 underline-offset-4 hover:underline">Create account</span>
            </Link>
          )
        }
      />
      <div className="flex-1 flex">{children}</div>
    </div>
  );
}
