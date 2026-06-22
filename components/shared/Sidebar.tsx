"use client";
import { Grid, House, LogOut, Package, Store, Users } from "lucide-react";
import UserProfile from "./UserProfile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LeadsNavBadge from "./LeadsNavBadge";
import { useLogout } from "@/lib/useLogout";

const navMenu = [
  { id: 1, title: "Dashboard", href: "/", icon: House },
  { id: 2, title: "Marketplace", href: "/marketplace", icon: Store },
  { id: 3, title: "Orders", href: "/orders", icon: Package },
  { id: 4, title: "Leads", href: "/leads", icon: Users, badge: true },
  { id: 5, title: "Manage", href: "/manage", icon: Grid },
];

const Sidebar = () => {
  const pathname = usePathname();
  const handleLogout = useLogout();

  return (
    <nav aria-label="Main" className="hidden md:flex h-screen w-64 flex-col bg-forest-900 py-6 px-3">
      <div className="px-3">
        <span className="text-2xl font-extrabold tracking-tight text-forest-50">Buzzmart</span>
      </div>
      <UserProfile />

      <div className="mt-8 flex flex-col gap-1">
        {navMenu.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative h-11 rounded-md px-3 flex items-center gap-3 text-[15px] transition-colors duration-150 ${
                active
                  ? "bg-forest-700 text-white font-semibold"
                  : "text-ink-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-pill bg-forest-400" />
              )}
              <item.icon className={`size-5 ${active ? "text-forest-400" : "text-ink-300"}`} />
              <span>{item.title}</span>
              {item.badge && <LeadsNavBadge />}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="group w-full h-11 px-3 rounded-md flex items-center gap-3 text-[15px] font-medium text-ink-200 hover:bg-destructive/15 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-forest-900"
        >
          <LogOut className="size-5 text-ink-300 group-hover:text-white transition-colors" />
          <span>Log out</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
