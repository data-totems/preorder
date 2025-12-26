'use client'

import { ArrowUp, ArrowUpRight, XIcon } from "lucide-react"
import { Button } from "../ui/button"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { getNotifications } from "@/actions/notifications.actions"
import { ScrollArea } from "../ui/scroll-area" // If you have a ScrollArea component

const NotificationModal = ({open, setOpen}: {open: boolean, setOpen: (value: boolean) => void}) => {
    const [notifications, setNotifications] = useState<any[]| null>(null);

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await getNotifications();
                setNotifications(response.data.notifications)
            } catch (error) {
                toast.error(`${error}`)
            }
        }

        if (open) {
            getData();
        }
    }, [open])
    
    return (
        <div className="absolute w-[380px] bg-white p-6 top-[50px] z-50 left-[60%] rounded-[12px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] text-[#03140A] font-bold">Notifications</h2>
                <Button 
                    variant={'ghost'} 
                    size="icon"
                    onClick={() => setOpen(false)} 
                    className="h-8 w-8"
                >
                    <XIcon size={18} />
                </Button>
            </div>

            {/* Fixed height scrollable container */}
            <div className="max-h-[200px] h-[200px] overflow-y-auto pr-2">
                <div className="flex flex-col gap-6">
                    {notifications && notifications.length > 0 ? (
                        notifications.map((noti, index) => (
                            <div 
                                key={index} 
                                className="cursor-pointer flex flex-col gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                            >
                                <h2 className="text-sm text-[#03140A80]">{noti.time}</h2>

                                <div className="flex items-start justify-between gap-2">
                                    <h2 className="text-[#03140A] font-semibold text-sm flex-1">
                                        {noti.message}
                                    </h2>
                                    <span className="text-xs text-[#03140A80] whitespace-nowrap mt-1">
                                        {noti.timestamp || '12:34 AM'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 font-semibold text-[#27BA5F]">
                                    <ArrowUpRight color="#27BA5F" size={16} />
                                    <span className="text-sm">Go to Orders</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                            No recent notifications.
                        </div>
                    )}
                </div>
            </div>

            {/* Custom scrollbar styling */}
            <style jsx>{`
                div::-webkit-scrollbar {
                    width: 4px;
                }
                div::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </div>
    )
}

export default NotificationModal