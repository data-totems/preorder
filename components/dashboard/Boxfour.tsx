'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"

const chartData = [
  { month: "Mar", orders: 10 },
  { month: "Apr", orders: 22 },
  { month: "May", orders: 33 },
  { month: "Jun", orders: 15 },
]

const chartConfig = {
  orders: {
    label: "Orders",
    color: "#27BA5F", // green
  },
} satisfies ChartConfig

const Boxfour = () => {
  return (
    <div>
      <h3 className="text-[16px] font-[700]">
        STORE ANALYSIS
      </h3>

      <div className="flex lg:flex-row flex-col  items-center gap-5 pt-10">
        {/* Chart */}
        <div className="">
          <ChartContainer config={chartConfig} className="min-h-[220px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={true} strokeDasharray="3 3" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${value} Orders`, ""]} />
              <Bar
                dataKey="orders"
                fill="var(--color-orders)"
                radius={[4, 4, 0, 0]}
                barSize={30} // slim bar width
              />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Stats Panel */}
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-xs text-[#03140A80] font-[700] ">TOTAL SALES</p>
            <p className="text-sm font-bold">NGN 456,000.00</p>
          </div>
          <div>
            <p className="text-xs text-[#03140A80] font-[700]">ORDER RECEIVED</p>
            <p className="text-[16px] font-[500] ">78 orders</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ORDER SHIPPED</p>
            <p className="text-sm font-bold">45 orders</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Boxfour
