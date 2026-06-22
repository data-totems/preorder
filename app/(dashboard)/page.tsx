"use client";
import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TopProductsList from "@/components/dashboard/TopProductsList";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/zustand";
import Link from "next/link";
import { getIncomingOrders } from "@/actions/orders.actions";
import { getLeads, getStoreShareStats } from "@/actions/share-links.actions";

const Dashboard = () => {
  const user = useUserStore((s) => s.user);
  const firstName = (user?.fullName ?? "there").split(" ")[0];

  const [orders, setOrders] = useState<number | null>(null);
  const [leads, setLeads] = useState<number | null>(null);
  const [clicks, setClicks] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    getIncomingOrders().then((r) => alive && setOrders(r.data?.count ?? 0)).catch(() => alive && setOrders(0));
    getLeads({}).then((d) => alive && setLeads(d?.count ?? 0)).catch(() => alive && setLeads(0));
    getStoreShareStats().then((s) => alive && setClicks(s?.total_clicks ?? 0)).catch(() => alive && setClicks(0));
    return () => { alive = false; };
  }, []);

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

      <section className="px-6 md:px-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard eyebrow="ORDERS" value={orders ?? "—"} caption="incoming" loading={orders === null} />
        <StatCard eyebrow="LEADS" value={leads ?? "—"} caption="captured" loading={leads === null} />
        <StatCard eyebrow="CLICKS" value={clicks ?? "—"} caption="on your store" loading={clicks === null} />
        <StatCard eyebrow="SHARE LINKS" value={1} caption="active store link" />
      </section>

      <section className="px-6 md:px-10 grid lg:grid-cols-3 gap-6 pb-12">
        <div className="lg:col-span-2"><RecentActivity /></div>
        <div className="lg:col-span-1"><TopProductsList /></div>
      </section>
    </div>
  );
};

export default Dashboard;
