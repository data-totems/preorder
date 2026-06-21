"use client"

import { Grid, House, LogOut, Package, Store, Users } from "lucide-react"
import UserProfile from "./UserProfile"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import LeadsNavBadge from "./LeadsNavBadge"
import { useUserStore } from "@/zustand"

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const setUser = useUserStore((state) => state.setUser);
    const navMenu = [
        {id: 1, title: "Dashboard", href: "/", icon: House},
        {id: 2, title: "Marketplace", href: "/marketplace", icon: Store},
         {id: 3, title: "Orders", href: "/orders", notify: true, icon: Package},
         {id: 4, title: "Leads", href: "/leads", icon: Users, badge: true},
         {id: 5, title: "Manage", href: "/manage", notify: true, icon: Grid},
    ]

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("buzzToken");
            localStorage.removeItem("lastSeenLeadsAt");
        }
        // Clear in-memory user state so the dashboard doesn't briefly show stale data.
        setUser(null as unknown as UserProps);
        router.replace("/login");
    }

  return (
    <div
    className="h-screen bg-black w-[230px] flex flex-col"
    >
      <UserProfile />

      <div className="">
        {navMenu.map((item) => (
            <Link key={item.id} href={item.href} className={` p-3 flex flex-col items-center justify-center text-white `}>
                <div className={` ${pathname === item.href ? 'bg-white text-black font-[500] ' : '' } p-2 rounded-[12px] w-[175px]  flex items-center gap-5`}>
                    <item.icon className={` ${pathname === item.href ? 'text-black' : 'text-[#CDD0CE]'}`} />
                    <span className="">{item.title}</span>
                    {item.badge && <LeadsNavBadge />}
                </div>
            </Link>
        ))}
      </div>

      <div className="mt-auto p-3 flex justify-center">
        <button
          onClick={handleLogout}
          className="p-2 rounded-[12px] w-[175px] flex items-center gap-5 text-white hover:bg-white/10 transition-colors"
          aria-label="Log out"
        >
          <LogOut className="text-[#CDD0CE]" />
          <span>Log out</span>
        </button>
      </div>
        </div>
  )
}

export default Sidebar