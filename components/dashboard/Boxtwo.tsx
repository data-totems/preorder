"use client"

import { listDispatch } from "@/actions/products.actions"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import OpenDispatch from "../shared/OpenDispatch"

const Boxtwo = () => {
    const [dispatcher, setDispatcher] = useState<any[] | null>(null);
    const [openDispatch, setOpenDispatch] = useState(false)

    useEffect(() => {
        const getDispatch = async () => {
            try {
                const response = await listDispatch();
                setDispatcher(response.data)
            } catch (error) {
                toast.error(`${error}`)
            }
        }

        getDispatch();
    }, [])
    
    // Function to extract initials (can handle multiple words)
    const getInitial = (name: string) => {
        if (!name || typeof name !== 'string') return 'D';
        
        const trimmedName = name.trim();
        if (trimmedName.length === 0) return 'D';
        
        // Get first letter of the first word
        return trimmedName.charAt(0).toUpperCase();
    }

    // Enhanced phone number formatting
    const formatPhoneNumber = (phone: string) => {
        if (!phone) return 'No phone...';
        
        // Handle different phone formats
        const cleanPhone = phone.toString().replace(/\D/g, '');
        
        if (cleanPhone.length === 0) return 'Invalid phone...';
        
        // For Nigerian numbers (starting with 0 or 234)
        if (cleanPhone.startsWith('234') && cleanPhone.length > 12) {
            // Remove country code (234) and show first 6 digits + ...
            const withoutCountryCode = cleanPhone.substring(3);
            return `${withoutCountryCode.substring(0, 6)}...`;
        } 
        else if (cleanPhone.startsWith('0') && cleanPhone.length > 10) {
            // Show first 9 digits + ...
            return `${cleanPhone.substring(0, 9)}...`;
        }
        else if (cleanPhone.length > 10) {
            // General case: show first 9 digits + ...
            return `${cleanPhone.substring(0, 9)}...`;
        }
        
        // If phone is short, show as is
        return phone;
    }

    return (
        <div className='flex flex-col gap-3'>
            <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-[700]">
                    AVAILABLE DISPATCH
                </h3>
    
                <div 
                    className="cursor-pointer flex items-center gap-2 p-2 h-[32px] rounded-[15px] hover:bg-gray-50 transition-colors"
                    onClick={() => setOpenDispatch(!openDispatch)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setOpenDispatch(!openDispatch)}
                >
                    <Plus color="#27BA5F" size={15} />
                    <span className="text-[#27BA5F] text-[12px] font-[700]">Add dispatch</span>
                </div>
            </div>

            <div className="flex items-center gap-5 flex-wrap">
                {dispatcher && dispatcher.length > 0 ? dispatcher.map((item, index) => (
                    <div 
                        key={item.id || `dispatcher-${index}`} 
                        className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        {/* Avatar with first letter */}
                        <div className="bg-[#27BA5F1F] h-[40px] w-[40px] rounded-full font-[700] text-[#27BA5F] flex items-center justify-center text-lg shadow-sm">
                            {getInitial(item.name)}
                        </div>

                        {/* Name and Phone */}
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h2 className="font-medium text-sm max-w-[100px] truncate">
                                {item.name || 'Unnamed Dispatcher'}
                            </h2>
                            <h3 className="text-[#03140A80] text-xs">
                                {formatPhoneNumber(item.phone || item.phone_number || item.contact || '')}
                            </h3>
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col justify-center items-center w-full py-8">
                        <div className="text-center">
                            <div className="bg-gray-100 h-[40px] w-[40px] rounded-full flex items-center justify-center mx-auto mb-2">
                                <span className="text-gray-400">D</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-500">No available dispatch</span>
                            <p className="text-xs text-gray-400 mt-1">Add a dispatcher to get started</p>
                        </div>
                    </div>
                )}
            </div>

            {openDispatch && (
                <OpenDispatch open={openDispatch} setOpen={setOpenDispatch} />
            )}
        </div>
    )
}

export default Boxtwo;