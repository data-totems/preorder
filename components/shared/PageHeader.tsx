import * as React from "react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/eyebrow";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  className?: string;
  bordered?: boolean;
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  tabs,
  className,
  bordered,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "pt-8 pb-6 px-6 md:px-10",
        bordered && "border-b border-border",
        className
      )}
    >
      {eyebrow && <Eyebrow className="mb-2 block">{eyebrow}</Eyebrow>}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <h1 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-foreground">
          {title}
        </h1>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
      {description && (
        <p className="mt-2 text-[17px] leading-[26px] text-muted-foreground max-w-2xl">
          {description}
        </p>
      )}
      {tabs && <div className="mt-6">{tabs}</div>}
    </header>
  );
}

export { PageHeader };
