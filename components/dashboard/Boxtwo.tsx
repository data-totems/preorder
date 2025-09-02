import { Plus } from "lucide-react"
import Link from "next/link"

const Boxtwo = () => {
  return (
    <div className='flex flex-col gap-3 '>
            <div className="flex items-center justify-between">
                    <h3 className="text-[16px] font-[700] ">
                        AVAILABLE DISPATCH
                    </h3>
        
                    <Link className=" flex p-4 items-center gap-3  h-[32px] rounded-[15px] " href='/'>
                    <Plus  color="#27BA5F" width={15} />
                    <span className="text-[#27BA5F] text-[12px] font-[700] ">Add dispatch</span>
                    </Link>
                </div>


                <div className="flex items-center gap-5  ">
                    {[1,2].map((i) => (
                        <div key={i} className="flex flex-col gap-2 ">
                            <div className="bg-[#27BA5F1F] h-[40px] w-[40px] rounded-2xl font-[700] text-[#27BA5F] flex flex-col items-center justify-center ">
                                D
                            </div>

                            <div className="flex flex-col gap-1 ">
                                <h2 className="">Dispatch rider I</h2>
                                <h3 className="text-[#03140A80] font-[400] ">090235623....</h3>
                            </div>
                        </div>
                    ))}
                </div>
    </div>
  )
}

export default Boxtwo