'use client'

import { getStoreDetails } from "@/actions/products.actions"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const StoreDetails = () => {
    const router = useRouter();
    const slug = usePathname().split('/')[2];
    const [currentFiltter, setCurrentFiltter] = useState('All')

    const [store, setStore] = useState<any>()

    useEffect(() => {
        const getStore = async () => {
            try {
                const response = await getStoreDetails(slug);
                setStore(response.data);

              
            } catch (error) {
                toast.error(`${error}`)
            }
        }
        getStore();
    }, [])
    

    if(!store) return;
  return (
    <div className="p-5 ">
         <Button onClick={() => {router.back()}} variant={'ghost'}>
            <ArrowLeft />
        </Button>

        <div className="bg-[#F0F0F0] w-full flex flex-col gap-4  mt-5  h-fit p-4 ">
             <div className="flex items-center  justify-between">
                                    <div className="flex items-center gap-3 ">
                                        <div className="bg-[#E0D33D] w-[40px] h-[40px] rounded-[30px] ">
                                            <Image src={'/avatar.png'} alt="seller img" width={40} height={40}  />
                                        </div>
                                        <div className="">
                                            <h2 className="text-[#03140A80] text-[16px] ">{store.merchant.business_name}</h2>
                                            <span className="text-[12px] text-[#03140A80]">Joined 2 weeks ago</span>
                                        </div>
                                        
                                    </div>
            
                                     <div className="flex items-center bg-white p-3 h-[24px] rounded-[12px] gap-2  ">
                                                    <Image
                                                    src={'/gem.png'}
                                                    alt="gem"
                                                    width={16}
                                                    height={16}
                                                     />
                                                     <h2 className="text-[12px] text-[#03140A80] font-[500] ">Verified ID</h2>
                                                </div>
                                </div>
                                <div className="border w-full h-0" />

                                <div className="mt-5 flex flex-col gap-4 ">
                                    <h2 className="font-bold uppercase text-md ">contact</h2>
                                    <div className="">
                                        <div className="flex items-center justify-between text-[#03140A80] text-sm ">
                                            {store.merchant.phone_number}

                                            <Link className="text-sm text-[#27BA5F] font-bold" href={'/store'}>Chat on Whatsapp</Link>
                                        </div>

                                          <div className="flex items-center justify-between text-[#03140A80] text-sm ">
                                            {store.merchant.business_email}
                                        </div>
                                    </div>
                                </div>
        </div>

        <div className="mt-7">
            <h2 className="font-bold text-xl uppercase">marketplace</h2>

            <div className="flex items-center gap-7 mt-4">
                {["All", "Phone", "Tablets", "Laptop"].map((item) => (
                    <div onClick={() => setCurrentFiltter(item)} className={`${currentFiltter === item ? 'bg-[#27BA5F1F] text-[#27BA5F] p-4 rounded-[12px] font-bold ' : 'text-[#03140A4D] '}`}>
                        <h1>{item}</h1>
                    </div>
                ))}
            </div>

          <div className="mt-10">
            <ProductGrid items={store.products} />
          </div>
        </div>
    </div>
  )
}

export default StoreDetails;



const ProductGrid = ({ items }: { items: any[] }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item, i) => (
        <Link href={`/store/product/${item.id}`}
          key={i}
          className="bg-white rounded-xl p-3 shadow-sm"
        >
          <img
            src={item.images ? item?.images[0]?.image_url : '' }
            alt="product"
            className="w-full h-32 object-contain"
          />
          <h3 className="text-xs font-medium mt-2">
          {item.name}
          </h3>
          <p className="text-orange-500 text-xs font-semibold">
            NGN{item.price}
          </p>
        </Link>
      ))}
    </div>
  );
};
