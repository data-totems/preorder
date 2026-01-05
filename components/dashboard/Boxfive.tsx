'use client'

import { acceptOrder, declineOrder, getIncomingOrders } from "@/actions/orders.actions";
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

const Boxfive = () => {
    const [orders, setOrders] = useState<any[]>([]);
      const [accepting, setAccepting] = useState('')
       const [declining, setDeclining] = useState(false)
     const [declineMessage, setDeclineMessage] = useState('');
   const [openDecline, setOpenDecline] = useState(false);
    const [declinePay, setDeclinePay] = useState(false);

    useEffect(() => {
       const getData = async () => {
        try {
          const response = await getIncomingOrders();
          setOrders(response.data.orders);
        } catch (error) {
          toast.error(`${error}`)
        }
       }
       getData();
       }, [])

        const handleAccpetOrders = async (orderId: number) => {
           setAccepting(orderId.toString())
           try {
             const response = await acceptOrder(orderId)
       
             if(response.status === 200){
               toast.success("Order Accepted")
             }
           } catch (error) {
             toast.error(`${error}`)
           } finally {
             setAccepting('')
           }
          }
       
           const handleDeclineOrders = async (orderId: number) => {
           setDeclining(true)
           try {
             const response = await declineOrder(orderId)
       
             if(response.status === 200){
               toast.success("Order Declined")
       
                setOpenDecline(false)
                setDeclineMessage('');
                setDeclinePay(true)
             }
           } catch (error) {
             toast.error(`${error}`)
           } finally {
             setDeclining(false)
           }
          }
    
  return (
    <div className="flex flex-col gap-5 ">
          <h3 className="text-[16px] font-[700] ">
                INCOMING ORDERS
            </h3>

            <div className="flex flex-col gap-7 ">
                {orders.length > 0 ? orders.map((order) => (
                    <div className="" key={order.id}>
                        <div className="flex items-center gap-4 ">
                            <Image src={order.product_details.primary_image} alt="product image" width={45} height={48} />

                            <div className=" ">
                                <h2 className="text-[16px] text-[700] ">Payment was made for {order.product_details.name}</h2>

                                <div className=" flex items-center gap-6 ">
                                    <span className="text-[#03140A80]  ">Amount paid</span>
                                    <h2 className="font-[500]  ">NGN{order.total_price}</h2>
                                </div>

                                 <div className=" flex items-center gap-6 ">
                                    <span className="text-[#03140A80]  ">Transaction code</span>
                                    <h2 className="font-[500] ">SFJRW3000</h2>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-end justify-end  pt-5  ">
                            <div className="flex items-center gap-5 ">
                                <AlertDialog onOpenChange={setOpenDecline} open={openDecline}>
                                    <AlertDialogTrigger>
                                      <div className="cursor-pointer">
                                        <h2 className="text-[#ED2525] font-[700] text-sm">Decline</h2>
                                      </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="flex flex-col items-center justify-center">
                                          Are you sure you want to decline this payment
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="flex flex-col items-center justify-center text-[#A9AEAB]">
                                          This action is cannot be reversed
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>

                                      <div className="flex flex-col gap-4">
                                        <Label className="font-[700] text-[#03140A80]">
                                          REASON FOR DECLINING
                                        </Label>

                                        <Textarea 
                                          placeholder="A message to your customer"
                                          className="bg-[#F0F0F0]"
                                          onChange={(e) => setDeclineMessage(e.target.value)}
                                          value={declineMessage}
                                        />
                                      </div>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => {
                                            handleDeclineOrders(order.id)
                                           
                                          }}
                                          disabled={declineMessage === '' || declining}
                                          className={`${declineMessage !== ''  && 'bg-[#ED2525] hover:bg-red-400'}`}
                                        >
                                          {declining && <Loader2 className="animate-spin" />}
                                          Decline payment
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <AlertDialog onOpenChange={setDeclinePay} open={declinePay}>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center justify-center">
                                          Payment declined!
                                        </AlertDialogTitle>
                                        <AlertDialogDescription></AlertDialogDescription>
                                      </AlertDialogHeader>

                                      <div className="flex flex-col gap-4">
                                        <Label className="font-[700] text-[#03140A80]">PRODUCT IMAGE</Label>
                                        <div className="bg-[#F0F0F0] w-full h-fit flex flex-col gap-5 rounded-[15px] p-4">
                                          <h2 className="font-[700]">ORDER DETAILS</h2>
                                          <div className="flex items-center gap-4">
                                            <Image src={order.product_details.primary_image} alt="product" width={50} height={50} />
                                            <div className="">
                                              <div className="flex gap-4">
                                                <h2 className="text-[#03140A80]">Product Name: </h2>
                                                <span className="font-[700]">{order.product_details.name}</span>
                                              </div>

                                              <div className="flex gap-4">
                                                <h2 className="text-[#03140A80]">Amount paid:</h2>
                                                <span className="font-[700]"> NGN{order.total_price}</span>
                                              </div>

                                              <div className="flex text-sm gap-4">
                                                <h2 className="text-[#03140A80]">Transaction code: </h2>
                                                <span className="font-[700]">SFJRW3000</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="w-full bg-[#27BA5F] hover:bg-green-400 hover:text-white rounded-[13px] text-white">
                                          Close
                                        </AlertDialogCancel>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                              {/* <div className="cursor-pointer bg-green-500 rounded-full w-[81px] h-[30px] items-center justify-center flex flex-col  ">
                                <h1 className="text-white font-[700] ">Accept</h1>
                            </div> */}

                              <Button disabled={accepting === order.id.toString()}  onClick={() => handleAccpetOrders(order.id)} className="cursor-pointer hover:bg-[#27BA5F] bg-[#27BA5F] w-fit min-w-[65px] h-[32px] flex gap-2 justify-center rounded-full items-center">
                                                                {accepting === order.id.toString() && <Loader2 className="animate-spin" />}
                                                                <h2 className="text-sm text-white font-[700]">Accept{accepting === order.id.toString() && 'ing'}</h2>
                                                              </Button>
                            </div>
                          
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center gap-4">
                                    <Image src={'/box.png'} alt="box" width={200} height={200} />
                                    <h2 className="text-sm">
                                      You have no incoming order
                                    </h2>
                                  </div>
                )}
            </div>
    </div>
  )
}

export default Boxfive