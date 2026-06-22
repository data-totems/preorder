import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    data-slot="input"
    className={cn(
      "flex h-11 w-full min-w-0 rounded-md border-0 bg-input px-3.5 py-2 text-[15px]",
      "text-foreground placeholder:text-ink-300 selection:bg-primary selection:text-primary-foreground",
      "transition-colors duration-150 outline-none",
      "focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none",
      "aria-invalid:ring-2 aria-invalid:ring-destructive aria-invalid:bg-white",
      "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
      className
    )}
    {...props}
  />
))
Input.displayName = "Input"

export { Input }
