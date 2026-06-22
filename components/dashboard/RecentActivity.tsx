"use client";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Users, MousePointerClick } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLeads, getStoreShareStats } from "@/actions/share-links.actions";
import { getIncomingOrders } from "@/actions/orders.actions";

type ActivityKind = "order" | "lead" | "click";
interface Activity {
  kind: ActivityKind;
  title: string;
  href: string;
  at: string;
}

const iconFor = (k: ActivityKind) => k === "order" ? Package : k === "lead" ? Users : MousePointerClick;

const RecentActivity = () => {
  const [items, setItems] = useState<Activity[] | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      getIncomingOrders().then((r) => r.data?.orders ?? []).catch(() => []),
      getLeads({}).then((d) => d?.results ?? []).catch(() => []),
      getStoreShareStats().then((s) => s?.recent_clicks ?? []).catch(() => []),
    ]).then(([ordersR, leadsR, clicksR]) => {
      if (!alive) return;
      const orders = (ordersR.status === "fulfilled" ? ordersR.value : []).slice(0, 5).map((o: any) => ({
        kind: "order" as const,
        title: `Order from ${o.customer_name || "a customer"}`,
        href: `/orders`,
        at: o.created_at ?? "",
      }));
      const leads = (leadsR.status === "fulfilled" ? leadsR.value : []).slice(0, 5).map((l: any) => ({
        kind: "lead" as const,
        title: `${l.name || "New lead"} (${l.wa_number})`,
        href: `/leads`,
        at: l.first_seen_at ?? "",
      }));
      const clicks = (clicksR.status === "fulfilled" ? clicksR.value : []).slice(0, 5).map((c: any) => ({
        kind: "click" as const,
        title: c.lead?.name ? `${c.lead.name} viewed your store` : "Anonymous click on your store",
        href: `/leads`,
        at: c.occurred_at ?? "",
      }));
      const merged = [...orders, ...leads, ...clicks].sort((a, b) => (b.at > a.at ? 1 : -1)).slice(0, 8);
      setItems(merged);
    });
    return () => { alive = false; };
  }, []);

  return (
    <Card padding="none" className="p-6">
      <div>
        <Eyebrow className="block">RECENT ACTIVITY</Eyebrow>
        <ul className="mt-4 flex flex-col divide-y divide-border">
          {items === null && (
            <>
              <li className="py-3"><Skeleton className="h-4 w-3/4" /></li>
              <li className="py-3"><Skeleton className="h-4 w-1/2" /></li>
              <li className="py-3"><Skeleton className="h-4 w-2/3" /></li>
            </>
          )}
          {items?.length === 0 && (
            <li className="py-8 text-center text-[14px] text-muted-foreground">No activity yet — share your store on WhatsApp to get started.</li>
          )}
          {items?.map((item, i) => {
            const Icon = iconFor(item.kind);
            return (
              <li key={i}>
                <Link href={item.href} className="-mx-3 px-3 py-3 flex items-center gap-3 rounded-md hover:bg-ink-50 transition-colors">
                  <div className="size-8 rounded-md bg-forest-50 text-forest-700 flex items-center justify-center shrink-0"><Icon className="size-4" /></div>
                  <span className="text-[15px] text-foreground flex-1 truncate">{item.title}</span>
                  <span className="text-[12px] text-muted-foreground whitespace-nowrap">{relTime(item.at)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
};

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

export default RecentActivity;
