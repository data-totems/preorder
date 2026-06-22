import TopNav from "@/components/shared/TopNav"
import { ReactNode } from "react"


const SetupLayout = ({ children }: {children: ReactNode}) => {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <TopNav variant="minimal" />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  )
}

export default SetupLayout
