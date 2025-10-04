import { Check, Laptop, Pen, Tablet, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Input } from "../ui/input"

const Account = () => {
    const [editId, setEditId] = useState(0)
    // name - 1 
  return (
    <div className="flex flex-col gap-8 ">
        <div className="">
            <h2 className="font-bold text-md">ACCOUNT DETAILS</h2>

        <div className=" flex items-center justify-between">
            <div className="w-[80px] h-[80px] bg-[#E0D33D] rounded-full justify-center flex flex-col items-center">
                 <Image
            src={'/avatar.png'}
            alt="User"
            width={100}
            height={100}
            className="w-[80xp] h-[80px] rounded-full"
             />
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

        <div className="pt-6 flex flex-col gap-9  ">

            <div className="flex flex-col lg:flex-row  items-center gap-[100px] ">
                {/* FULL NAME */}
                 <div className="flex flex-col gap-3 ">
                <h2 className="text-[#03140A80] font-[700] ">FULL NAME</h2>
                <div className="flex items-center gap-5 ">
                    {editId === 1 ? (
                        <div className="flex bg-white items-center p-1.5 rounded-[12px]  ">
                            <Input className="border-none outline-none" placeholder="Enter full name" value={"Akinsanmi Adeleke"} />
                            <div className="">
                                <X size={14} color="#A9AEAB" />
                            </div>
                        </div>
                        
                    ) : (
                        <span className="text-[16px]">Akinsanmi Adeleke</span>
                    )}
                    
                    <div className="cursor-pointer" onClick={()=> {
                    if(editId === 1 ) {
                        setEditId(0)
                    } else {
                        setEditId(1)
                    }
                    }}>
                        {editId === 1 ? (
                            <div className=" flex items-center gap-3 ">
                                <Check size={14} color="#27BA5F" className="text-sm" />
                                <span className="text-[#27BA5F] text-sm font-[500] ">Save</span>
                            </div>
                        ) : (
                            <Pen color="#27BA5F" fill="#27BA5F" size={13} className="cursor-pointer" />
                        )}
                        
                    </div>
                    
                </div>
            </div>

            {/* PHONE NUMBER  */}
             <div className="flex flex-col gap-3 ">
                <h2 className="text-[#03140A80] font-[700] ">PHONE</h2>
                <div className="flex items-center gap-5 ">
                    {editId === 2 ? (
                        <div className="flex bg-white items-center p-1.5 rounded-[12px]  ">
                            <Input className="border-none outline-none" placeholder="Enter full name" value={"090235623...."} />
                            <div className="">
                                <X size={14} color="#A9AEAB" />
                            </div>
                        </div>
                        
                    ) : (
                        <span className="text-[16px]">090235623....</span>
                    )}
                    
                    <div className="cursor-pointer" onClick={()=> {
                    if(editId === 2 ) {
                        setEditId(0)
                    } else {
                        setEditId(2)
                    }
                    }}>
                        {editId === 2 ? (
                            <div className=" flex items-center gap-3 ">
                                <Check size={14} color="#27BA5F" className="text-sm" />
                                <span className="text-[#27BA5F] text-sm font-[500] ">Save</span>
                            </div>
                        ) : (
                            <Pen color="#27BA5F" fill="#27BA5F" size={13} className="cursor-pointer" />
                        )}
                        
                    </div>
                    
                </div>
            </div>
            </div>

             <div className="flex flex-col lg:flex-row  items-center gap-[100px] ">
                {/* EMAIL */}
                 <div className="flex flex-col gap-3 ">
                <h2 className="text-[#03140A80] font-[700] ">EMAIL</h2>
                <div className="flex items-center gap-5 ">
                    {editId === 3 ? (
                        <div className="flex bg-white items-center p-1.5 rounded-[12px]  ">
                            <Input className="border-none outline-none" placeholder="Enter full name" value={"AkinsanmiAdeleke@gmail.com"} />
                            <div className="">
                                <X size={14} color="#A9AEAB" />
                            </div>
                        </div>
                        
                    ) : (
                        <span className="text-[16px]">AkinsanmiAdeleke@gmail.com</span>
                    )}
                    
                    <div className="cursor-pointer" onClick={()=> {
                    if(editId === 3 ) {
                        setEditId(0)
                    } else {
                        setEditId(3)
                    }
                    }}>
                        {editId === 3 ? (
                            <div className=" flex items-center gap-3 ">
                                <Check size={14} color="#27BA5F" className="text-sm" />
                                <span className="text-[#27BA5F] text-sm font-[500] ">Save</span>
                            </div>
                        ) : (
                            <Pen color="#27BA5F" fill="#27BA5F" size={13} className="cursor-pointer" />
                        )}
                        
                    </div>
                    
                </div>
            </div>

            {/* PHONE NUMBER  */}
             <div className="flex flex-col gap-3 ">
                <h2 className="text-[#03140A80] font-[700] ">ADDRESS</h2>
                <div className="flex items-center gap-5 ">
                    {editId === 4 ? (
                        <div className="flex bg-white items-center p-1.5 rounded-[12px]  ">
                            <Input className="border-none outline-none" placeholder="Enter full name" value={"30 Ogunsiji Cl, Off Adebayo Solake street, Allen Avenue, Ikeja, Lagos"} />
                            <div className="">
                                <X size={14} color="#A9AEAB" />
                            </div>
                        </div>
                        
                    ) : (
                        <span className="text-[16px]">30 Ogunsiji Cl, Off Adebayo Solake street, Allen Avenue, Ikeja, Lagos</span>
                    )}
                    
                    <div className="cursor-pointer" onClick={()=> {
                    if(editId === 4 ) {
                        setEditId(0)
                    } else {
                        setEditId(4)
                    }
                    }}>
                        {editId === 4 ? (
                            <div className=" flex items-center gap-3 ">
                                <Check size={14} color="#27BA5F" className="text-sm" />
                                <span className="text-[#27BA5F] text-sm font-[500] ">Save</span>
                            </div>
                        ) : (
                            <Pen color="#27BA5F" fill="#27BA5F" size={13} className="cursor-pointer" />
                        )}
                        
                    </div>
                    
                </div>
            </div>
            </div>
        </div>
        </div>
        <div className="flex flex-col gap-5">
              <h2 className="font-bold text-md">ACCOUNT SECURITY</h2>

              <div className="gap-3 flex flex-col">
                <h2 className="text-[#03140A80] font-[700] ">PASSWORD</h2>
                <div className="bg-[#27BA5F1F] w-fit h-fit cursor-pointer p-2 rounded-[12px]  ">
                    <h2 className="text-[#27BA5F] font-[500] text-[12px] ">Change password</h2>
                </div>
              </div>

              <div className="gap-3 flex flex-col">
                <h2 className="text-[#03140A80] font-[700] ">2 FACTOR AUTHENTICATION</h2>
                <div className="bg-[#27BA5F1F] w-fit h-fit cursor-pointer p-2 rounded-[12px]  ">
                    <h2 className="text-[#27BA5F] font-[500] text-[12px] ">Setup 2FA</h2>
                </div>
              </div>

                <div className="gap-5 flex flex-col ">
                <h2 className="text-[#03140A80] font-[700] ">SESSION MANAGEMENT</h2>


                <div className="flex justify-between items-center">
               <div className="flex  gap-4 ">
                <Laptop color="#A9AEAB" fill="#A9AEAB" />
                <div className="flex flex-col gap-2 ">
                    <h2>Windows</h2>
                    <div className="flex  items-center gap-3">
                        <div className="w-[4px] h-[4px] bg-[#27BA5F] rounded-full" />
                        <span className="text-[#27BA5F] text-[13px]">Current session</span>
                    </div>

                    <h2 className="text-[13px] text-[#03140A80] ">Nigeria</h2>
                    <h2 className="text-[13px] text-[#03140A80] ">First sign-in: Sep 2</h2>
                </div>
               </div>
                 <div className="cursor-pointer text-[#ED2525] text-12 font-[500] ">
                <span>Sign out</span>
               </div>

               </div>
               <div className="flex justify-between items-center">

                 <div className="flex  gap-4 ">
                <Tablet color="#A9AEAB" fill="#A9AEAB" />
                <div className="flex flex-col gap-2 ">
                    <h2>Tablet</h2>
                    <h2 className="text-[13px] text-[#03140A80] ">2 hours ago</h2>
                    <h2 className="text-[13px] text-[#03140A80] ">Nigeria</h2>
                    <h2 className="text-[13px] text-[#03140A80] ">First sign-in: Sep 2</h2>
                </div>
               </div>

               <div className="cursor-pointer text-[#ED2525] text-12 font-[500] ">
                <span>Sign out</span>
               </div>
               </div>

               <div className="flex justify-between items-center">
                   <div className="flex  gap-4 ">
                <Tablet color="#A9AEAB" fill="#A9AEAB" />
                <div className="flex flex-col gap-2 ">
                    <h2>Tablet</h2>
                    <h2 className="text-[13px] text-[#03140A80] ">3 months ago</h2>
                    <h2 className="text-[13px] text-[#03140A80] ">Nigeria</h2>
                    <h2 className="text-[13px] text-[#03140A80] ">First sign-in: Sep 2</h2>
                </div>
               </div>

               <div className="cursor-pointer text-[#ED2525] text-12 font-[500] ">
                <span>Sign out</span>
               </div>
               </div>

             
              </div>
        </div>
    </div>
  )
}

export default Account