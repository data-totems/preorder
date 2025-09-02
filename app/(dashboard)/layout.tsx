import Sidebar from "@/components/shared/Sidebar"
import { ReactNode } from "react"

const DashboardLayout = ({ children }: { children: ReactNode}) => {
  return (
    <div className="flex  ">
        <div className="hidden lg:block fixed">
        <Sidebar  />
        </div>

        <main className="lg:pl-[260px]  pt-3 w-full pr-5  ">
            {children}
        </main>
    </div>
  )
}

export default DashboardLayout