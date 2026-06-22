import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "py-20 flex flex-col items-center text-center max-w-md mx-auto",
        className
      )}
    >
      {icon && (
        <div className="bg-forest-50 rounded-full p-3 text-forest-700 mb-4 [&>svg]:size-6">
          {icon}
        </div>
      )}
      <h2 className="text-[22px] leading-[30px] font-bold tracking-[-0.005em] text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-[17px] leading-[26px] text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export { EmptyState };
