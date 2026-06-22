import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";

interface StatCardProps {
  eyebrow: string;
  value: string | number;
  caption?: string;
  loading?: boolean;
}

const StatCard = ({ eyebrow, value, caption, loading }: StatCardProps) => (
  <Card variant="elevated">
    <Eyebrow className="block">{eyebrow}</Eyebrow>
    <div className="mt-3 text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-foreground">
      {loading ? "—" : value}
    </div>
    {caption && <div className="mt-1 text-[13px] text-muted-foreground">{caption}</div>}
  </Card>
);

export default StatCard;
