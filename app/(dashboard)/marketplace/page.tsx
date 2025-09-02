'use client'
import Category from "@/components/marketplace/Category"
import Navbar from "@/components/shared/Navbar"
import ProductCard from "@/components/shared/ProductCard"
import { LinkIcon } from "lucide-react"
import { useRouter } from "next/navigation"

const Marketplace = () => {
  const router = useRouter();
  const products = [
    {id: 1, title: 'Xiaomi Redmi Note 10 6.43" 4GB RAM/64GB ROM', image: '/product3.jpg'},
     {id: 2, title: 'Xiaomi Redmi Note 10 6.43" 4GB RAM/64GB ROM', image: '/product1.jpg'},
      {id: 3, title: 'Xiaomi Redmi Note 10 6.43" 4GB RAM/64GB ROM', image: '/product2.jpg'},
       {id: 4, title: 'Xiaomi Redmi Note 10 6.43" 4GB RAM/64GB ROM', image: '/product2.jpg'},
        {id: 5, title: 'Xiaomi Redmi Note 10 6.43" 4GB RAM/64GB ROM', image: '/product2.jpg'},
         {id: 6, title: 'Xiaomi Redmi Note 10 6.43" 4GB RAM/64GB ROM', image: '/product2.jpg'},
  ]
  return (
    <div>
      <Navbar leftType="head" title="MARKETPLACE" primarybtn="Create product" showIcon width="168px" height="40px" />
      

      <div className="flex pt-5 gap-3  ">
        <div className=" hidden lg:block h-full overflow-hidden w-[118px] ">
           <Category />
        </div>

        
        <div className="bg-[#F0F0F0] w-full h-full p-3 rounded-[13px] mt-10  ">

          <div className="flex justify-between items-center">
            <h2 className="text-[#03140A80] font-[700] ">0 items</h2>
            <div className="bg-[#27BA5F1F] w-[139px] cursor-pointer h-[32px] rounded-[12px] p-2  flex items-center gap-2  ">
              <LinkIcon color="#27BA5F" size={20} />
              <span  className="text-[#27BA5F] text-[12px] font-[500] ">Copy Market link</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  gap-4 mt-5  ">
            {products.map((product) => (
              <ProductCard
              key={product.id}
              title={product.title}
              image={product.image}
              type="market"
              onPress={() => router.push(`/marketplace/product/${product.id}`)}
               />
            ))}
          </div>
        </div>
      </div>
      
      </div>
  )
}

export default Marketplace