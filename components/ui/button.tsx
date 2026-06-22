import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-colors duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:pointer-events-none shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-forest-500",
        secondary: "bg-secondary text-secondary-foreground hover:bg-ink-200",
        outline: "border border-border bg-transparent text-foreground hover:bg-ink-50",
        ghost: "bg-transparent text-foreground hover:bg-ink-100",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        link: "bg-transparent text-forest-500 hover:underline underline-offset-4",
      },
      size: {
        default: "h-11 px-6 text-[15px]",
        md: "h-11 px-6 text-[15px]",
        sm: "h-9 px-4 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
