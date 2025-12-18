import Image from "next/image"
import { ReactNode } from "react"


const SetupLayout = ({ children }: {children: ReactNode}) => {
  return (
    <div className=" flex flex-col justify-center items-center mt-5 w-full ">
         <div className="flex items-center gap-1">
                    <Image src={'/logo.svg'} alt="Buzzmart" width={100} height={100} className="w-16 h-16" />
                    <h2 className="font-bold text-2xl ">BuzzMart</h2>
                </div>


        <main>{children}</main>
        
    </div>
  )
}

export default SetupLayout