'use client'
import Account from "@/components/manage/Account"
import BussinessDetails from "@/components/manage/BussinessDetails"
import Category from "@/components/manage/Category"
import Dispatch from "@/components/manage/Dispatch"
import Payment from "@/components/manage/Payment"
import StoreLink from "@/components/manage/StoreLink"
import Navbar from "@/components/shared/Navbar"
import PageHeader from "@/components/shared/PageHeader"
import { useState } from "react"

const Manage = () => {
  const [currentTab, setCurrentTab] = useState(0);
  return (
    <div>
      <Navbar leftType="head" title="MANAGE" primarybtn="Create product" showIcon width="168px" height="40px" />

      <PageHeader
        eyebrow="MANAGE"
        title="Settings"
        description="Your account, business, payment, and dispatch settings."
      />

      <div className="flex pt-5 gap-3  ">
        <div className=" hidden lg:block h-full overflow-hidden w-[210px] ">
           <Category setCurrentTab={setCurrentTab} />
        </div>


        <div className="bg-ink-100 w-full h-fit p-3 rounded-md mt-10  ">
          <div className="p-2 ">
             {currentTab === 0 && (
            <Account />
          )}


          {currentTab === 1 && (
            <BussinessDetails />
          )}

           {currentTab === 2 && (
            <Payment />
          )}

           {currentTab === 3 && (
            <Dispatch />
          )}

           {currentTab === 4 && (
            <StoreLink />
          )}

          </div>

         

      
        </div>
      </div>
      
      </div>
  )
}

export default Manage