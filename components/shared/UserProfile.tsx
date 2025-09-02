import Image from "next/image"


const UserProfile = () => {
  return (
    <div className="p-5 flex flex-col justify-center items-center cursor-pointer "
    >
        <div className="bg-[#FFFFFF] h-[40px] w-[140px] rounded-[25px] flex items-center justify-center gap-5  ">
            {/* IMAGE */}
            <div className="bg-[#E0D33D] h-[32px] w-[32px] rounded-full items-center justify-center">
                <Image src={'/avatar.png'} width={50} height={50} alt="avatar" />
            </div>
            <h2 className="text-[#03140A] text-[14px] font-[500] ">Akinsanmi</h2>
        </div>
    </div>
  )
}

export default UserProfile