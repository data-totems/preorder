import { Copy, LinkIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "../ui/button"
import { useUserStore } from "@/zustand"

const BoxOne = () => {
    const { user } = useUserStore((state) => state)
  return (
    <div className="flex flex-col gap-5 ">
        <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-[700] ">
                Account Details
            </h3>

            <Link className="bg-[#27BA5F1F] flex p-4 items-center gap-3  h-[32px] rounded-[15px] " href='/'>
            <LinkIcon  color="#27BA5F" width={15} />
            <span className="text-[#27BA5F] text-[12px] font-[700] ">Link Whatsapp</span>
            </Link>
        </div>

        <div className="">
            <h3 className="text-[#03140A80] font-[700] ">ACCOUNT NAME</h3>
            <span className="font-[500] text-[20px] ">{user?.fullName}</span>
        </div>  <div className="">
            <h3 className="text-[#03140A80] font-[700] ">BANK NAME</h3>
            <span className="font-[500] text-[20px] ">{user?.bank_name}</span>
        </div>

        

        <div className="">
            <h3 className="text-[#03140A80] font-[700] ">ACCOUNT NUMBER</h3>
            <div className="flex justify-between items-center   ">
                <span className="font-[500] text-[20px] ">{user?.bank_account_number}</span>
                <div className='flex text-[#27BA5F] items-center gap-2 font-bold cursor-pointer '>
                    <Copy color="#27BA5F" fill="#27BA5F" />
                    Copy
                </div>
            </div>
            
        </div>
    </div>
  )
}

export default BoxOne