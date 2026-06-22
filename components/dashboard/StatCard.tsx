import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  eyebrow: string;
  value: string | number;
  caption?: string;
  loading?: boolean;
  icon?: LucideIcon;
}

const StatCard = ({ eyebrow, value, caption, loading, icon: Icon }: StatCardProps) => (
  <Card variant="elevated" padding="none" className="p-6">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <Eyebrow className="block">{eyebrow}</Eyebrow>
        {loading ? (
          <Skeleton className="mt-3 h-9 w-16" />
        ) : (
          <div className="mt-3 text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-foreground tabular-nums">
            {value}
          </div>
        )}
        {caption && (
          <div className="mt-1 text-[13px] text-muted-foreground truncate">
            {caption}
          </div>
        )}
      </div>
      {Icon && (
        <div className="size-9 rounded-md bg-forest-50 text-forest-700 flex items-center justify-center shrink-0">
          <Icon className="size-4" />
        </div>
      )}
    </div>
  </Card>
);

export default StatCard;
