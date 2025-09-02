"use client"

import { House, Package, Store } from "lucide-react"
import UserProfile from "./UserProfile"
import Link from "next/link"
import { usePathname } from "next/navigation"

const Sidebar = () => {
    const pathname = usePathname();
    const navMenu = [
        {id: 1, title: "Dashboard", href: "/", icon: House},
        {id: 2, title: "Marketplace", href: "/marketplace", icon: Store},
         {id: 3, title: "Orders", href: "/orders", notify: true, icon: Package},
    ]
  return (
    <div
    className="h-screen bg-black w-[230px] "
    >
      <UserProfile />  

      <div className="">
        {navMenu.map((item) => (
            <Link key={item.id} href={item.href} className={` p-3 flex flex-col items-center justify-center text-white `}>
                <div className={` ${pathname === item.href ? 'bg-white text-black font-[500] ' : '' } p-2 rounded-[12px] w-[175px]  flex items-center gap-5`}>
                    <item.icon className={` ${pathname === item.href ? 'text-black' : 'text-[#CDD0CE]'}`} />
                    <span className="">{item.title}</span>
                </div>
            </Link>
        ))}
      </div>
        </div>
  )
}

export default Sidebar