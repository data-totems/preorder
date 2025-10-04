'use client'
import Account from "@/components/manage/Account"
import BussinessDetails from "@/components/manage/BussinessDetails"
import Category from "@/components/manage/Category"
import Dispatch from "@/components/manage/Dispatch"
import Payment from "@/components/manage/Payment"
import Navbar from "@/components/shared/Navbar"
import { useRouter } from "next/navigation"
import { useState } from "react"

const Manage = () => {
  const router = useRouter();
  const products = [
    {id: 1, title: 'Xiaomi Redmi Note 10 6.43" 4GB RAM/64GB ROM', image: '/product3.jpg'},
     {id: 2, title: 'Xiaomi Redmi Note 10 6.43" 4GB RAM/64GB ROM', image: '/product1.jpg'},
      {id: 3, title: 'Xiaomi Redmi Note 10 6.43" 4GB RAM/64GB ROM', image: '/product2.jpg'},
       {id: 4, title: 'Xiaomi Redmi Note 10 6.43" 4GB RAM/64GB ROM', image: '/product2.jpg'},
        {id: 5, title: 'Xiaomi Redmi Note 10 6.43" 4GB RAM/64GB ROM', image: '/product2.jpg'},
         {id: 6, title: 'Xiaomi Redmi Note 10 6.43" 4GB RAM/64GB ROM', image: '/product2.jpg'},
  ]

  const [currentTab, setCurrentTab] = useState(0);
  return (
    <div>
      <Navbar leftType="head" title="MANAGE" primarybtn="Create product" showIcon width="168px" height="40px" />
      

      <div className="flex pt-5 gap-3  ">
        <div className=" hidden lg:block h-full overflow-hidden w-[210px] ">
           <Category setCurrentTab={setCurrentTab} />
        </div>

        
        <div className="bg-[#F0F0F0] w-full h-fit p-3 rounded-[13px] mt-10  ">
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
        
          </div>

         

      
        </div>
      </div>
      
      </div>
  )
}

export default Manage