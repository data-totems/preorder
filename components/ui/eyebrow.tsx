import * as React from "react";
import { cn } from "@/lib/utils";

interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "muted" | "accent";
}

const Eyebrow = React.forwardRef<HTMLSpanElement, EyebrowProps>(
  ({ className, tone = "muted", children, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="eyebrow"
      className={cn(
        "text-[11px] leading-[14px] font-bold tracking-[0.08em] uppercase",
        tone === "muted" ? "text-ink-500" : "text-forest-500",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
);
Eyebrow.displayName = "Eyebrow";

export default Eyebrow;
export { Eyebrow };
