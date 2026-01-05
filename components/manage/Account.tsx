'use client'
import { Check, Laptop, Pen, Tablet, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Input } from "../ui/input"
import { useUserStore } from "@/zustand"
import { toast } from "sonner"
import { updateProfileDetails } from "@/actions/auth.actions"

const Account = () => {
    const [editId, setEditId] = useState(0);
    const { user, setUser } = useUserStore((state) => state)
    
    // Separate state for each editable field
    const [fullName, setFullName] = useState(user?.fullName || "")
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "")
    const [email, setEmail] = useState(user?.email || "")
    const [address, setAddress] = useState(user?.address || "")

    const handleUpdateDetails = async ({
        full_name,
        display_picture,
        username,
        phone_number,
        address
    }: {
        full_name?: string,
        display_picture?: string,
        username?: string,
        phone_number?: string,
        address?: string
    }) => {
        try {
            // Only send the field that's being edited
            const updateData: any = {};
            
            if (editId === 1 && full_name !== undefined) {
                updateData.full_name = full_name;
            }
            if (editId === 2 && phone_number !== undefined) {
                updateData.phone_number = phone_number;
            }
            if (editId === 3) {
                // Email might not be editable via this endpoint
                // Add if your API supports it
            }
            if (editId === 4 && address !== undefined) {
                updateData.address = address;
            }

            const response = await updateProfileDetails(updateData);

            console.log(response)

            if(response.status === 200) {
                toast.success("Profile Updated")
                
                // Update the user store with the new data
                if (response.data) {
                    const updatedUser = { ...user, ...response.data };
                    setUser(updatedUser);
                }
            }
        } catch (error) {
            toast.error(`${error}`)
        }
    }

    const handleFieldSave = async () => {
        switch(editId) {
            case 1:
                await handleUpdateDetails({ full_name: fullName });
                break;
            case 2:
                await handleUpdateDetails({ phone_number: phoneNumber });
                break;
            case 3:
                // Email update might require different endpoint or verification
                toast.info("Email update may require verification");
                break;
            case 4:
                await handleUpdateDetails({ address: address });
                break;
        }
        setEditId(0);
    }

    const handleCancelEdit = () => {
        // Reset field values to original user data when canceling
        switch(editId) {
            case 1:
                setFullName(user?.fullName || "");
                break;
            case 2:
                setPhoneNumber(user?.phoneNumber || "");
                break;
            case 3:
                setEmail(user?.email || "");
                break;
            case 4:
                setAddress(user?.address || "");
                break;
        }
        setEditId(0);
    }

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
                    className="w-[80px] h-[80px] rounded-full"
                 />
            </div>

            <div className="flex items-center bg-white p-3 h-[24px] rounded-[12px] gap-2">
                <Image
                    src={'/gem.png'}
                    alt="gem"
                    width={16}
                    height={16}
                 />
                 <h2 className="text-[12px] text-[#03140A80] font-[500]">Verified ID</h2>
            </div>
        </div>

        <div className="pt-6 flex flex-col gap-9">

            <div className="flex flex-col lg:flex-row items-center gap-[100px]">
                {/* FULL NAME */}
                 <div className="flex flex-col gap-3">
                    <h2 className="text-[#03140A80] font-[700]">FULL NAME</h2>
                    <div className="flex items-center gap-5">
                        {editId === 1 ? (
                            <div className="flex bg-white items-center p-1.5 rounded-[12px]">
                                <Input 
                                    className="border-none outline-none" 
                                    placeholder="Enter full name" 
                                    onChange={(e) => setFullName(e.target.value)} 
                                    value={fullName}
                                    autoFocus
                                />
                                <div 
                                    className="cursor-pointer p-1"
                                    onClick={handleCancelEdit}
                                >
                                    <X size={14} color="#A9AEAB" />
                                </div>
                            </div>
                        ) : (
                            <span className="text-[16px]">{fullName || user?.fullName || "Not set"}</span>
                        )}
                        
                        <div className="cursor-pointer" onClick={()=> {
                            if(editId === 1) {
                                handleFieldSave();
                            } else {
                                setEditId(1);
                            }
                        }}>
                            {editId === 1 ? (
                                <div className="flex items-center gap-3">
                                    <Check size={14} color="#27BA5F" className="text-sm" />
                                    <span className="text-[#27BA5F] text-sm font-[500]">Save</span>
                                </div>
                            ) : (
                                <Pen color="#27BA5F" fill="#27BA5F" size={13} className="cursor-pointer" />
                            )}
                        </div>
                    </div>
                </div>

                {/* PHONE NUMBER */}
                 <div className="flex flex-col gap-3">
                    <h2 className="text-[#03140A80] font-[700]">PHONE</h2>
                    <div className="flex items-center gap-5">
                        {editId === 2 ? (
                            <div className="flex bg-white items-center p-1.5 rounded-[12px]">
                                <Input 
                                    className="border-none outline-none" 
                                    placeholder="Enter phone number" 
                                    onChange={(e) => setPhoneNumber(e.target.value)} 
                                    value={phoneNumber}
                                    autoFocus
                                />
                                <div 
                                    className="cursor-pointer p-1"
                                    onClick={handleCancelEdit}
                                >
                                    <X size={14} color="#A9AEAB" />
                                </div>
                            </div>
                        ) : (
                            <span className="text-[16px]">{phoneNumber || user?.phoneNumber || "Not set"}</span>
                        )}
                        
                        <div className="cursor-pointer" onClick={()=> {
                            if(editId === 2) {
                                handleFieldSave();
                            } else {
                                setEditId(2);
                            }
                        }}>
                            {editId === 2 ? (
                                <div className="flex items-center gap-3">
                                    <Check size={14} color="#27BA5F" className="text-sm" />
                                    <span className="text-[#27BA5F] text-sm font-[500]">Save</span>
                                </div>
                            ) : (
                                <Pen color="#27BA5F" fill="#27BA5F" size={13} className="cursor-pointer" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-[100px]">
                {/* EMAIL */}
                 <div className="flex flex-col gap-3">
                    <h2 className="text-[#03140A80] font-[700]">EMAIL</h2>
                    <div className="flex items-center gap-5">
                        {editId === 3 ? (
                            <div className="flex bg-white items-center p-1.5 rounded-[12px]">
                                <Input 
                                    className="border-none outline-none" 
                                    placeholder="Enter email" 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    value={email}
                                    type="email"
                                    autoFocus
                                />
                                <div 
                                    className="cursor-pointer p-1"
                                    onClick={handleCancelEdit}
                                >
                                    <X size={14} color="#A9AEAB" />
                                </div>
                            </div>
                        ) : (
                            <span className="text-[16px]">{email || user?.email || "Not set"}</span>
                        )}
                        
                        <div className="cursor-pointer" onClick={()=> {
                            if(editId === 3) {
                                handleFieldSave();
                            } else {
                                setEditId(3);
                            }
                        }}>
                            {editId === 3 ? (
                                <div className="flex items-center gap-3">
                                    <Check size={14} color="#27BA5F" className="text-sm" />
                                    <span className="text-[#27BA5F] text-sm font-[500]">Save</span>
                                </div>
                            ) : (
                                <Pen color="#27BA5F" fill="#27BA5F" size={13} className="cursor-pointer" />
                            )}
                        </div>
                    </div>
                </div>

                {/* ADDRESS */}
                 <div className="flex flex-col gap-3">
                    <h2 className="text-[#03140A80] font-[700]">ADDRESS</h2>
                    <div className="flex items-center gap-5">
                        {editId === 4 ? (
                            <div className="flex bg-white items-center p-1.5 rounded-[12px]">
                                <Input 
                                    className="border-none outline-none" 
                                    placeholder="Enter address" 
                                    onChange={(e) => setAddress(e.target.value)} 
                                    value={address}
                                    autoFocus
                                />
                                <div 
                                    className="cursor-pointer p-1"
                                    onClick={handleCancelEdit}
                                >
                                    <X size={14} color="#A9AEAB" />
                                </div>
                            </div>
                        ) : (
                            <span className="text-[16px]">{address || user?.address || "Not set"}</span>
                        )}
                        
                        <div className="cursor-pointer" onClick={()=> {
                            if(editId === 4) {
                                handleFieldSave();
                            } else {
                                setEditId(4);
                            }
                        }}>
                            {editId === 4 ? (
                                <div className="flex items-center gap-3">
                                    <Check size={14} color="#27BA5F" className="text-sm" />
                                    <span className="text-[#27BA5F] text-sm font-[500]">Save</span>
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
                <h2 className="text-[#03140A80] font-[700]">PASSWORD</h2>
                <div className="bg-[#27BA5F1F] w-fit h-fit cursor-pointer p-2 rounded-[12px]">
                    <h2 className="text-[#27BA5F] font-[500] text-[12px]">Change password</h2>
                </div>
            </div>

            <div className="gap-3 flex flex-col">
                <h2 className="text-[#03140A80] font-[700]">2 FACTOR AUTHENTICATION</h2>
                <div className="bg-[#27BA5F1F] w-fit h-fit cursor-pointer p-2 rounded-[12px]">
                    <h2 className="text-[#27BA5F] font-[500] text-[12px]">Setup 2FA</h2>
                </div>
            </div>

            <div className="gap-5 flex flex-col">
                <h2 className="text-[#03140A80] font-[700]">SESSION MANAGEMENT</h2>

                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <Laptop color="#A9AEAB" fill="#A9AEAB" />
                        <div className="flex flex-col gap-2">
                            <h2>Windows</h2>
                            <div className="flex items-center gap-3">
                                <div className="w-[4px] h-[4px] bg-[#27BA5F] rounded-full" />
                                <span className="text-[#27BA5F] text-[13px]">Current session</span>
                            </div>
                            <h2 className="text-[13px] text-[#03140A80]">Nigeria</h2>
                            <h2 className="text-[13px] text-[#03140A80]">First sign-in: Sep 2</h2>
                        </div>
                    </div>
                    <div className="cursor-pointer text-[#ED2525] text-12 font-[500]">
                        <span>Sign out</span>
                    </div>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <Tablet color="#A9AEAB" fill="#A9AEAB" />
                        <div className="flex flex-col gap-2">
                            <h2>Tablet</h2>
                            <h2 className="text-[13px] text-[#03140A80]">2 hours ago</h2>
                            <h2 className="text-[13px] text-[#03140A80]">Nigeria</h2>
                            <h2 className="text-[13px] text-[#03140A80]">First sign-in: Sep 2</h2>
                        </div>
                    </div>
                    <div className="cursor-pointer text-[#ED2525] text-12 font-[500]">
                        <span>Sign out</span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <Tablet color="#A9AEAB" fill="#A9AEAB" />
                        <div className="flex flex-col gap-2">
                            <h2>Tablet</h2>
                            <h2 className="text-[13px] text-[#03140A80]">3 months ago</h2>
                            <h2 className="text-[13px] text-[#03140A80]">Nigeria</h2>
                            <h2 className="text-[13px] text-[#03140A80]">First sign-in: Sep 2</h2>
                        </div>
                    </div>
                    <div className="cursor-pointer text-[#ED2525] text-12 font-[500]">
                        <span>Sign out</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Account