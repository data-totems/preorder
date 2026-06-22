import Sidebar from "@/components/shared/Sidebar";
import MobileNav from "@/components/shared/MobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-paper">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
