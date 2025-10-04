'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"
import { Check, ChevronLeft, ChevronRight, Pen, X } from "lucide-react"
import { Chevron } from "react-day-picker"
import { useState } from "react"
import { Input } from "../ui/input"


const chartData = [
  { month: "Jan", orders: 10 },
  { month: "Feb", orders: 22 },
  { month: "Apr", orders: 33 },
  { month: "May", orders: 15 },
   { month: "Jun", orders: 10 },
  { month: "Jul", orders: 22 },
  { month: "Aug", orders: 33 },
  { month: "Sep", orders: 15 },
   { month: "Oct", orders: 22 },
  { month: "Nov", orders: 33 },
  { month: "Dec", orders: 15 },
]

const chartConfig = {
  orders: {
    label: "Orders",
    color: "#27BA5F", // green
  },
} satisfies ChartConfig
const BussinessDetails = () => {
  const [editId, setEditId] = useState(0)
  return (
    <div>
          <div className=" flex flex-col gap-4 ">
                  <h2 className="font-bold text-md">ACCOUNT DETAILS</h2>
      

      
              <div className="pt-6 flex flex-col gap-9  ">
      
                  <div className="flex flex-col lg:flex-row  items-center gap-[100px] ">
                      {/* FULL NAME */}
                       <div className="flex flex-col gap-3 ">
                      <h2 className="text-[#03140A80] font-[700] ">BUSSINESS NAME</h2>
                      <div className="flex items-center gap-5 ">
                          {editId === 1 ? (
                              <div className="flex bg-white items-center p-1.5 rounded-[12px]  ">
                                  <Input className="border-none outline-none" placeholder="Enter bussiness name" value={"Ak Tech"} />
                                  <div className="">
                                      <X size={14} color="#A9AEAB" />
                                  </div>
                              </div>
                              
                          ) : (
                              <span className="text-[16px]">Ak Tech</span>
                          )}
                          
                          <div className="cursor-pointer" onClick={()=> {
                          if(editId === 1 ) {
                              setEditId(0)
                          } else {
                              setEditId(1)
                          }
                          }}>
                              {editId === 1 ? (
                                  <div className=" flex items-center gap-3 ">
                                      <Check size={14} color="#27BA5F" className="text-sm" />
                                      <span className="text-[#27BA5F] text-sm font-[500] ">Save</span>
                                  </div>
                              ) : (
                                  <Pen color="#27BA5F" fill="#27BA5F" size={13} className="cursor-pointer" />
                              )}
                              
                          </div>
                          
                      </div>
                  </div>

                     <div className="flex flex-col gap-3 ">
                      <h2 className="text-[#03140A80] font-[700] ">ADDRESS</h2>
                      <div className="flex items-center gap-5 ">
                          {editId === 4 ? (
                              <div className="flex bg-white items-center p-1.5 rounded-[12px]  ">
                                  <Input className="border-none outline-none" placeholder="Enter full name" value={"30 Ogunsiji Cl, Off Adebayo Solake street, Allen Avenue, Ikeja, Lagos"} />
                                  <div className="">
                                      <X size={14} color="#A9AEAB" />
                                  </div>
                              </div>
                              
                          ) : (
                              <span className="text-[16px] w-[300px] ">30 Ogunsiji Cl, Off Adebayo Solake street, Allen Avenue, Ikeja, Lagos</span>
                          )}
                          
                          <div className="cursor-pointer" onClick={()=> {
                          if(editId === 4 ) {
                              setEditId(0)
                          } else {
                              setEditId(4)
                          }
                          }}>
                              {editId === 4 ? (
                                  <div className=" flex items-center gap-3 ">
                                      <Check size={14} color="#27BA5F" className="text-sm" />
                                      <span className="text-[#27BA5F] text-sm font-[500] ">Save</span>
                                  </div>
                              ) : (
                                  <Pen color="#27BA5F" fill="#27BA5F" size={13} className="cursor-pointer" />
                              )}
                              
                          </div>
                          
                      </div>
                  </div>
      
                   
                  </div>
      
                   <div className="flex flex-col lg:flex-row  items-center gap-[100px] ">
                      {/* EMAIL */}
                 
      
                  {/* PHONE NUMBER  */}
                 <div className="flex flex-col gap-3 ">
                      <h2 className="text-[#03140A80] font-[700] ">CONTACT</h2>
                      <div className="flex items-center gap-5 ">
                          {editId === 2 ? (
                              <div className="flex bg-white items-center p-1.5 rounded-[12px]  ">
                                  <Input className="border-none outline-none" placeholder="Enter full name" value={"090235623...."} />
                                  <div className="">
                                      <X size={14} color="#A9AEAB" />
                                  </div>
                              </div>
                              
                          ) : (
                              <span className="text-[16px]">090235623....</span>
                          )}
                          
                          <div className="cursor-pointer" onClick={()=> {
                          if(editId === 2 ) {
                              setEditId(0)
                          } else {
                              setEditId(2)
                          }
                          }}>
                              {editId === 2 ? (
                                  <div className=" flex items-center gap-3 ">
                                      <Check size={14} color="#27BA5F" className="text-sm" />
                                      <span className="text-[#27BA5F] text-sm font-[500] ">Save</span>
                                  </div>
                              ) : (
                                  <Pen color="#27BA5F" fill="#27BA5F" size={13} className="cursor-pointer" />
                              )}
                              
                          </div>
                          
                      </div>
                  </div>

                        <div className="flex flex-col gap-3 ">
                      <h2 className="text-[#03140A80] font-[700] ">INDUSTRY</h2>
                      <div className="flex items-center bg-white w-fit p-1 text-[12px] text-[#03140A] rounded-[4px] gap-5 ">
                          <span>Technology</span>
                          
                      </div>
                  </div>

                  
                  </div>
              </div>

                 <div className="gap-3 flex flex-col">
                <h2 className="text-[#03140A80] font-[700] ">WHATSAPP</h2>
                <div className="flex items-center gap-3">
                  <div className="bg-[#27BA5F1F] w-fit flex items-center gap-3  h-fit cursor-pointer p-2 rounded-[12px]  ">
                  <Check color="#27BA5F" size={14} />
                    <h2 className="text-[#27BA5F] font-[500] text-[12px] ">Whatsapp linked</h2>
                </div>

                <div className="cursor-pointer text-[12px] text-[#27BA5F]  font-[500] ">Unlink</div>
                </div>
                
              </div>
              </div>

      {/* BUSSINESS ANALYTICS */}
       <div className="pt-5  ">
        <div className="flex items-center justify-between pb-5 ">
         <h2 className="font-bold text-md">BUSSINESS ANALYTICS</h2>
         <div className="cursor-pointer">
          <h1 className="text-[#27BA5F] font-[500] text-[12px] ">Download report</h1>
         </div>
        </div>

      <div className="">
        <div className="flex items-center gap-5 justify-end">
          <ChevronLeft  color="#A9AEAB" className="cursor-pointer"  />
          <span>2025</span>
          <ChevronRight  color="#A9AEAB" className="cursor-pointer" />
        </div>
       
        <div className="p-5 ">
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
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

        <div className="">
          TABLE
        </div>
      </div>
    </div>
      </div>
  )
}

export default BussinessDetails