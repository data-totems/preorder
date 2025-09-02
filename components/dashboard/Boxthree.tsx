import { ChevronDown, Plus } from "lucide-react"
import Link from "next/link"
import ProductCard from "../shared/ProductCard"

const Boxthree = () => {
    const products = [
        {id: 1, title: "XIAOMI Redmi 14C", price: "134,320", image: "/product1.jpg"},
        {id: 2, title:'itel A50 6.6" 2GB RAM/64GB ROM', price: "102,120", image: "/product2.jpg"},
    ]
  return (
    <div className="flex flex-col gap-5 ">

        <div className="flex items-center justify-between">
                    <h3 className="text-[16px] font-[700] ">
                        MARKETPLACE
                    </h3>
        
                    <Link className=" flex p-4 items-center gap-3  h-[32px] rounded-[15px] " href='/'>
                   
                    <span className="text-[#27BA5F] text-[12px] font-[700] ">Create product</span>
                     <ChevronDown  color="#27BA5F" width={15} />
                    </Link>
                </div>



                <div className="flex items-center gap-3">
                    {products.map((product) => (
                        <ProductCard
                        key={product.id}
                        title={product.title}
                        price={product.price}
                        image={product.image}
                         />
                    ))}
                </div>
    </div>
  )
}

export default Boxthree