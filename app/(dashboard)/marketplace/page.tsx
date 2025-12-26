'use client'
import { getuserProducts } from "@/actions/products.actions"
import Category from "@/components/marketplace/Category"
import CreateProduct from "@/components/shared/CreateProduct"
import Navbar from "@/components/shared/Navbar"
import ProductCard from "@/components/shared/ProductCard"
import { Button } from "@/components/ui/button"
import { LinkIcon, PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const Marketplace = () => {
  const router = useRouter();
  const [products, setProducts] = useState<ProductProps[]>([])
 const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await getuserProducts();

        if(response.status === 200) {
          setProducts(response.data)
        }
      } catch (error) {
        alert(`${error}`)
      }
    }

    getProducts();
  }, [])
  return (
    <div>
      <Navbar leftType="head" onPress={() => setOpenDialog(true)} title="MARKETPLACE" primarybtn="Create product" showIcon width="168px" height="40px" />
      

      <div className="flex pt-5 gap-3  ">
        <div className=" hidden lg:block h-full overflow-hidden w-[118px] ">
           <Category />
        </div>

        
        <div className="bg-[#F0F0F0] w-full h-[80vh] p-3 rounded-[13px] mt-10  ">

          <div className="flex justify-between items-center">
            <h2 className="text-[#03140A80] font-[700] ">{products.length} items</h2>
            <div className="bg-[#27BA5F1F] w-[139px] cursor-pointer h-[32px] rounded-[12px] p-2  flex items-center gap-2  ">
              <LinkIcon color="#27BA5F" size={20} />
              <span  className="text-[#27BA5F] text-[12px] font-[500] ">Copy Market link</span>
            </div>
          </div>
          {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  gap-4 mt-5  ">
            {products.map((product) => (
              <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              image_url={product.images && product?.images[0]?.image_url}
              type="market"
              onPress={() => router.push(`/marketplace/product/${product.id}`)}
               />
            ))}
          </div>
          ) : (
              <div className="flex flex-col justify-center items-center gap-3 h-full w-full">
                <img
                src={'/Bookshelf.png'}
                alt="book shelf"
                width={150}
                height={150}
                // className="w-35 h-35"
                 />

                 <span className="text-[#03140A] text-[16px] font-semibold">You have no product</span>

                 <Button onClick={() => setOpenDialog(true)} className="text-[#27BA5F] hover:text-green-400 cursor-pointer font-bold" variant={'ghost'}>
                  <PlusIcon />
                  Create Product
                 </Button>
              </div>
            )}

      
        </div>
      </div>
      {openDialog && (
        <CreateProduct open={openDialog} setOpen={setOpenDialog} />
      )}
      </div>
  )
}

export default Marketplace