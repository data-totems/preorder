"use client";
import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TopProductsList from "@/components/dashboard/TopProductsList";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/zustand";
import Link from "next/link";
import { Package, Users, MousePointerClick, Link2 } from "lucide-react";
import { getMerchantDashboard } from "@/actions/auth.actions";

interface DashboardData {
  stats: {
    orders_incoming: number;
    leads: number;
    clicks: number;
    share_links: number;
  };
  recent_orders: Array<{
    id: number;
    customer_name: string;
    total_price: string;
    status: string;
    created_at: string;
    product_name: string | null;
  }>;
  recent_leads: Array<{
    id: number;
    name: string;
    wa_number: string;
    first_seen_at: string;
  }>;
  recent_clicks: Array<{
    id: number;
    event_type: string;
    occurred_at: string;
    lead: { wa_number: string; name: string } | null;
  }>;
  top_products: Array<{
    id: number;
    name: string;
    price: string;
    primary_image: string | null;
  }>;
}

const Dashboard = () => {
  const user = useUserStore((s) => s.user);
  const firstName = (user?.fullName ?? "there").split(" ")[0];

  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    let alive = true;
    getMerchantDashboard()
      .then((r) => {
        if (alive) setData(r.data);
      })
      .catch(() => {
        // Silent — page still renders the loading state -> 0
      });
    return () => {
      alive = false;
    };
  }, []);

  const stats = data?.stats;
  const loading = data === null;

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        eyebrow="GOOD MORNING"
        title={firstName}
        description="Here's what's happening with your store today."
        actions={
          <Link href="/marketplace"><Button>+ New product</Button></Link>
        }
      />

      <section className="px-6 md:px-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          eyebrow="ORDERS"
          value={stats?.orders_incoming ?? 0}
          caption="incoming"
          loading={loading}
          icon={Package}
        />
        <StatCard
          eyebrow="LEADS"
          value={stats?.leads ?? 0}
          caption="captured"
          loading={loading}
          icon={Users}
        />
        <StatCard
          eyebrow="CLICKS"
          value={stats?.clicks ?? 0}
          caption="on your store"
          loading={loading}
          icon={MousePointerClick}
        />
        <StatCard
          eyebrow="SHARE LINKS"
          value={stats?.share_links ?? 0}
          caption="active links"
          loading={loading}
          icon={Link2}
        />
      </section>

      <section className="px-6 md:px-10 grid lg:grid-cols-3 gap-6 pb-12">
        <div className="lg:col-span-2">
          <RecentActivity
            recentOrders={data?.recent_orders}
            recentLeads={data?.recent_leads}
            recentClicks={data?.recent_clicks}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-1">
          <TopProductsList
            products={data?.top_products}
            loading={loading}
          />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
