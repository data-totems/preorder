"use client";
import { Grid, House, Package, Store, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getLeads } from "@/actions/share-links.actions";

const navItems = [
  { title: "Home", href: "/", icon: House },
  { title: "Market", href: "/marketplace", icon: Store },
  { title: "Orders", href: "/orders", icon: Package },
  { title: "Leads", href: "/leads", icon: Users, badge: true },
  { title: "Manage", href: "/manage", icon: Grid },
];

const MobileNav = () => {
  const pathname = usePathname();
  const [hasLeads, setHasLeads] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const since = localStorage.getItem("lastSeenLeadsAt");
    getLeads(since ? { since } : {}).then((d) => setHasLeads((d.count ?? 0) > 0)).catch(() => {});
  }, []);

  return (
    <nav
      aria-label="Mobile"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`relative h-full flex flex-col items-center justify-center gap-1 active:bg-ink-50 transition-colors ${
                  active ? "text-forest-700 font-semibold" : "text-ink-500"
                }`}
              >
                <item.icon className="size-[22px]" />
                {item.badge && hasLeads && (
                  <span className="absolute top-2 right-[calc(50%-16px)] h-2 w-2 rounded-full bg-forest-400" />
                )}
                <span className="text-[12px] leading-4">{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileNav;
