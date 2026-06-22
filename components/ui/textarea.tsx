import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    data-slot="textarea"
    className={cn(
      "flex field-sizing-content min-h-32 w-full rounded-md border-0 bg-input px-3.5 py-3 text-[15px]",
      "text-foreground placeholder:text-ink-300",
      "transition-colors duration-150 outline-none",
      "focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:opacity-60 disabled:cursor-not-allowed",
      "aria-invalid:ring-2 aria-invalid:ring-destructive aria-invalid:bg-white",
      className
    )}
    {...props}
  />
))
Textarea.displayName = "Textarea"

export { Textarea }
