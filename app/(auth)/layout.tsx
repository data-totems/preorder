'use client'

import Image from "next/image"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

const AuthLayout = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname();
    const currentRoute = pathname.split('/')[1]
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      
      {/* LEFT – AUTH CONTENT */}
      <div className="flex flex-col  items-center justify-center px-20">
        <main className="w-full max-w-lg ">
              <div className="flex items-center gap-1">
            <Image src={'/logo.svg'} alt="Buzzmart" width={100} height={100} className="w-16 h-16" />
            <h2 className="font-bold text-2xl ">BuzzMart</h2>
        </div>
          {children}
        </main>
      </div>

      {/* RIGHT – IMAGE SECTION */}
      <div className="relative hidden lg:block">
        <Image
          src={`/${currentRoute}.png`}
          alt="Login background"
          fill
          priority
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Text Overlay */}
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h2 className="text-3xl font-bold leading-tight">
            EXPERIENCE THE LEVERAGE <br />
            YOUR BUSINESS NEEDS
          </h2>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
