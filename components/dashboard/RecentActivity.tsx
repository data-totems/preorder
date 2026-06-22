"use client";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Users, MousePointerClick } from "lucide-react";
import Link from "next/link";

type ActivityKind = "order" | "lead" | "click";
interface Activity {
  kind: ActivityKind;
  title: string;
  href: string;
  at: string;
}

interface OrderLite {
  customer_name: string;
  created_at: string;
}
interface LeadLite {
  name: string;
  wa_number: string;
  first_seen_at: string;
}
interface ClickLite {
  lead: { name?: string } | null;
  occurred_at: string;
}

interface Props {
  recentOrders?: OrderLite[];
  recentLeads?: LeadLite[];
  recentClicks?: ClickLite[];
  loading?: boolean;
}

const iconFor = (k: ActivityKind) =>
  k === "order" ? Package : k === "lead" ? Users : MousePointerClick;

const relTime = (iso: string): string => {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const RecentActivity = ({ recentOrders, recentLeads, recentClicks, loading }: Props) => {
  const items: Activity[] = [
    ...(recentOrders ?? []).map((o) => ({
      kind: "order" as const,
      title: `Order from ${o.customer_name || "a customer"}`,
      href: "/orders",
      at: o.created_at,
    })),
    ...(recentLeads ?? []).map((l) => ({
      kind: "lead" as const,
      title: `${l.name || "New lead"} (${l.wa_number})`,
      href: "/leads",
      at: l.first_seen_at,
    })),
    ...(recentClicks ?? []).map((c) => ({
      kind: "click" as const,
      title: c.lead?.name
        ? `${c.lead.name} viewed your store`
        : "Anonymous click on your store",
      href: "/leads",
      at: c.occurred_at,
    })),
  ]
    .sort((a, b) => (b.at > a.at ? 1 : -1))
    .slice(0, 8);

  return (
    <Card padding="none" className="p-6">
      <div>
        <Eyebrow className="block">RECENT ACTIVITY</Eyebrow>
        <ul className="mt-4 flex flex-col divide-y divide-border">
          {loading && (
            <>
              <li className="py-3"><Skeleton className="h-4 w-3/4" /></li>
              <li className="py-3"><Skeleton className="h-4 w-1/2" /></li>
              <li className="py-3"><Skeleton className="h-4 w-2/3" /></li>
            </>
          )}
          {!loading && items.length === 0 && (
            <li className="py-8 text-center text-[14px] text-muted-foreground">
              No activity yet — share your store on WhatsApp to get started.
            </li>
          )}
          {!loading &&
            items.map((item, i) => {
              const Icon = iconFor(item.kind);
              return (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="-mx-3 px-3 py-3 flex items-center gap-3 rounded-md hover:bg-ink-50 transition-colors"
                  >
                    <div className="size-8 rounded-md bg-forest-50 text-forest-700 flex items-center justify-center shrink-0">
                      <Icon className="size-4" />
                    </div>
                    <span className="text-[15px] text-foreground flex-1 truncate">
                      {item.title}
                    </span>
                    <span className="text-[12px] text-muted-foreground whitespace-nowrap">
                      {relTime(item.at)}
                    </span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </div>
    </Card>
  );
};

export default RecentActivity;
