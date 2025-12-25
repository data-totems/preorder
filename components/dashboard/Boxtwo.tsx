"use client"

import { listDispatch } from "@/actions/products.actions"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import OpenDispatch from "../shared/OpenDispatch"

const Boxtwo = () => {
    const [dispatcher, setDispatcher] = useState<[] | null>(null);
    const [openDispatch, setOpenDispatch] = useState(false)

    useEffect(() => {
    const getDispatch = async () => {
        try {
            const response = await listDispatch();


            console.log("Dispatch:", response.data);

            setDispatcher(response.data)
        } catch (error) {
            toast.error(`${error}`)
        }
    }

    getDispatch();
    }, [])
    
  return (
    <div className='flex flex-col gap-3 '>
            <div className="flex items-center justify-between">
                    <h3 className="text-[16px] font-[700] ">
                        AVAILABLE DISPATCH
                    </h3>
        
                    <div className="cursor-pointer flex p-4 items-center gap-3  h-[32px] rounded-[15px] "
                    onClick={() => setOpenDispatch(!openDispatch)}
                    >
                    <Plus  color="#27BA5F" width={15} />
                    <span className="text-[#27BA5F] text-[12px] font-[700] ">Add dispatch</span>
                    </div>
                </div>


                <div className="flex items-center gap-5  ">
                    {dispatcher && dispatcher.length > 0 ? dispatcher.map((i) => (
                        <div key={i} className="flex flex-col gap-2 ">
                            <div className="bg-[#27BA5F1F] h-[40px] w-[40px] rounded-2xl font-[700] text-[#27BA5F] flex flex-col items-center justify-center ">
                                D
                            </div>

                            <div className="flex flex-col gap-1 ">
                                <h2 className="">Dispatch rider I</h2>
                                <h3 className="text-[#03140A80] font-[400] ">090235623....</h3>
                            </div>
                        </div>
                    )): (
                        <div className="flex flex-col justify-center items-center w-full top-5 relative">
                            <span className="text-sm font-semibold">No available dispatch</span>
                        </div>
                    )}
                </div>

                {openDispatch && (
                    <OpenDispatch open={openDispatch} setOpen={setOpenDispatch} />
                )}
    </div>
  )
}

export default Boxtwo