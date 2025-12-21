'use client'
import { ArrowLeft, BellIcon, MenuIcon, Plus } from "lucide-react"
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const Navbar = ({ title,  primarybtn, showIcon, width, height, leftType, onPress}: {
    title?: string,
    primarybtn: string;
    showIcon?:boolean;
    width?: string;
    height?: string;
    onPress?: (value: any) => void,
    leftType?: 'arrow' | 'head'
}) => {

    const router = useRouter();
  return (
    <div className="w-full">

        <div className="flex items-center justify-between">
            {leftType === 'head' ? (
                   <h3 className="font-[700] text-[#03140A] text-[24px] ">
                {title}
            </h3>
            ) : (
                <Button onClick={() => router.back()} variant={'ghost'}>
                    <ArrowLeft />
                </Button>
            )}
         

            <div className="lg:flex hidden items-center gap-4 ">
                <div className="bg-[#ED25251F] w-[82px] cursor-pointer h-[40px] rounded-[24px] flex items-center justify-center gap-2  ">
                    <span className="text-[#ED2525] font-[600] text-[12px] ">1 new</span>
                    <BellIcon color="#ED2525" size={20} fill="#ED2525" />
                </div>

                <div onClick={onPress} className={`bg-[#27BA5F] w-[${width}] h-[${height}] p-6 rounded-[15px] flex items-center cursor-pointer justify-center gap-2  ` }>
                    {showIcon && <Plus color="white" />}
                    <span className="text-white text-[16px] ">{primarybtn}</span>
                </div>
            </div>

            <div className="flex lg:hidden">
                <Button variant={"ghost"}>
                    <MenuIcon />
                </Button>
            </div>
        </div>
    </div>
  )
}

export default Navbar