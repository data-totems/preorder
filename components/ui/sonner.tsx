"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    className="toaster"
    toastOptions={{
      classNames: {
        toast: "rounded-lg bg-white text-foreground border border-border shadow-lg p-4",
        title: "text-[15px] font-semibold",
        description: "text-[13px] text-muted-foreground",
        success: "bg-forest-100 text-forest-900 border-l-4 border-l-forest-400",
        error: "bg-[color:rgb(214_59_59/0.05)] text-destructive border-l-4 border-l-destructive",
      },
    }}
    {...props}
  />
)

export { Toaster }
