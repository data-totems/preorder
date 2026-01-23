import { ChevronDown, Plus } from "lucide-react"
import Link from "next/link"
import ProductCard from "../shared/ProductCard"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { getuserProducts } from "@/actions/products.actions"
import Image from "next/image"
import CreateProduct from "../shared/CreateProduct"

const Boxthree = () => {
    const [products, setProducts] = useState<ProductProps[]>([]);
    const [openDialog, setOpenDialog] = useState(false)
    useEffect(() => {
    const getProducts = async () => {
        try {
            const response = await getuserProducts();

            setProducts(response.data)
        } catch (error) {
            toast.error(`${error}`)
        }
    }

    getProducts();
    }, [])
    
  return (
    <div className="flex flex-col gap-5 ">

        <div className="flex items-center justify-between">
                    <h3 className="text-[16px] font-[700] ">
                        MARKETPLACE
                    </h3>
        
                    <div className=" flex p-4 items-center gap-3  h-[32px] rounded-[15px] cursor-pointer " onClick={() => setOpenDialog(!openDialog)}>
                   
                    <span className="text-[#27BA5F] text-[12px] font-[700] ">Create product</span>
                     <ChevronDown  color="#27BA5F" width={15} />
                    </div>
                </div>



                <div className="flex items-center gap-3 h-fit">
                    {products.length > 0 ? products.map((product) => (
                        <ProductCard
                        key={product.id}
                        name={product.name}
                        price={product.price}
                        // image={product.images}
                        image_url={product.images ? product?.images[0]?.image_url : ''}
                        id={product.id}
                         />
                    )): (
                        <div className="flex flex-col w-full gap-3 justify-center items-center">
                            <Image
                            src={'/Bookshelf.png'}
                            alt="Book Shelf"
                            width={100}
                            height={100}
                            className=""
                             />
                             <h2 className="text-sm font-semibold " >You have no product</h2>
                        </div>
                    )}
                </div>

                  {openDialog && (
        <CreateProduct open={openDialog} setOpen={setOpenDialog} />
      )}
    </div>
  )
}

export default Boxthree