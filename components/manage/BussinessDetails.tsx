"use client";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/zustand";

const chartData = [
  { month: "Jan", orders: 10 },
  { month: "Feb", orders: 22 },
  { month: "Mar", orders: 33 },
  { month: "Apr", orders: 15 },
  { month: "May", orders: 10 },
  { month: "Jun", orders: 22 },
  { month: "Jul", orders: 33 },
  { month: "Aug", orders: 15 },
  { month: "Sep", orders: 22 },
  { month: "Oct", orders: 33 },
  { month: "Nov", orders: 28 },
  { month: "Dec", orders: 15 },
];

const chartConfig = {
  orders: { label: "Orders", color: "var(--color-forest-500)" },
} satisfies ChartConfig;

const ReadField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-2 min-w-0">
    <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-ink-500">
      {label}
    </span>
    <span className="text-[15px] text-foreground min-h-[44px] flex items-center">
      {value || <span className="text-muted-foreground">Not set</span>}
    </span>
  </div>
);

export default function BussinessDetails() {
  const { user } = useUserStore((state) => state);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <Eyebrow className="block mb-4">BUSINESS DETAILS</Eyebrow>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReadField label="Business name" value={user?.username ?? ""} />
          <ReadField label="Address" value={user?.address ?? ""} />
          <ReadField label="Contact" value={user?.phoneNumber ?? ""} />
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-ink-500">
              Industry
            </span>
            <div className="min-h-[44px] flex items-center">
              <Badge className="bg-ink-100">Technology</Badge>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 p-3 rounded-md bg-forest-50 border border-forest-100">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-forest-500 flex items-center justify-center">
              <Check className="size-3 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-forest-700">
              WhatsApp linked
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-forest-700">
            Unlink
          </Button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <Eyebrow>BUSINESS ANALYTICS</Eyebrow>
          <Button variant="link" size="sm" className="text-forest-500">
            Download report
          </Button>
        </div>

        <div className="flex items-center justify-end gap-3 mb-2">
          <Button variant="ghost" size="icon" aria-label="Previous year">
            <ChevronLeft className="size-4 text-ink-500" />
          </Button>
          <span className="text-[14px] font-semibold tabular-nums">2025</span>
          <Button variant="ghost" size="icon" aria-label="Next year">
            <ChevronRight className="size-4 text-ink-500" />
          </Button>
        </div>

        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip formatter={(value) => [`${value} orders`, ""]} />
            <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} barSize={28} />
          </BarChart>
        </ChartContainer>
      </section>
    </div>
  );
}
