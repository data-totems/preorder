'use client'
import Tab from "@/components/orders/Tab"
import Navbar from "@/components/shared/Navbar"
import { ArrowRight, Box, Check, ChevronDown, Loader2, Plus, Truck } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Distribute from "@/components/orders/Distribute"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { acceptOrder, declineOrder, getAcceptedOrders, getIncomingOrders, getShippedOrder } from "@/actions/orders.actions"
import { formatDateWithOrdinal, formatTimestamp } from "@/lib/reuseable"
import { Button } from "@/components/ui/button"


const step = [
    {
      id: 1,
      title: "Select dispatch",
      icon: Truck
    },
     {
      id: 2,
      title: "Select product",
      icon: Box
    },
   ]
const Orders = () => {
   const [currentTab, setCurrentTab] = useState(1);
   const [open, setOpen] = useState(false)
   const [openId, setOpenId] = useState(0);
   const [declineMessage, setDeclineMessage] = useState('');
   const [openDecline, setOpenDecline] = useState(false);
   const [declinePay, setDeclinePay] = useState(false);
   const [distributeDialog, setDistributeDialog] = useState(false)
   const [distributeStep, setDistributeStep] = useState(1);
   const [openCompleted, setOpenCompleted] = useState(false);
   const [addDispatchModal, setAddDispatchModal] = useState(false)
   const [selectedride, setSelectedride] = useState(0);
   const [orders, setOrders] = useState<any[]>([])
   const [acceptedOrders, setAcceptedOrders] = useState<any[]>([]);
   const [shippedOrder, setShippedOrder] = useState<any[] | null>(null)

   const [accepting, setAccepting] = useState(false)
   const [declining, setDeclining] = useState(false)

   // Group orders by date
   const groupedOrders = orders.reduce((groups, order) => {
     const date = new Date(order.created_at).toISOString().split('T')[0];
     if (!groups[date]) {
       groups[date] = [];
     }
     groups[date].push(order);
     return groups;
   }, {} as Record<string, any[]>);

   // Sort dates from newest to oldest
   const sortedDates = Object.keys(groupedOrders).sort((a, b) => 
     new Date(b).getTime() - new Date(a).getTime()
   );

     const groupedAcceptedOrders = acceptedOrders.reduce((groups, order) => {
     const date = new Date(order.updated_at).toISOString().split('T')[0];
     if (!groups[date]) {
       groups[date] = [];
     }
     groups[date].push(order);
     return groups;
   }, {} as Record<string, any[]>);

   // Sort dates from newest to oldest
   const acceptedsortedDates = Object.keys(groupedAcceptedOrders).sort((a, b) => 
     new Date(b).getTime() - new Date(a).getTime()
   );

    const groupedShippedOrders = shippedOrder && shippedOrder.reduce((groups, order) => {
     const date = new Date(order.updated_at).toISOString().split('T')[0];
     if (!groups[date]) {
       groups[date] = [];
     }
     groups[date].push(order);
     return groups;
   }, {} as Record<string, any[]>);

   // Sort dates from newest to oldest
   const shippedsortedDates = shippedOrder &&  Object.keys(groupedShippedOrders).sort((a, b) => 
     new Date(b).getTime() - new Date(a).getTime()
   );


   useEffect(() => {
   const getData = async () => {
    try {
      const response = await getIncomingOrders();
      const accepted = await getAcceptedOrders();
      const shippedOrder = await getShippedOrder();
      setOrders(response.data.orders);
      setAcceptedOrders(accepted.data.orders)
      setShippedOrder(shippedOrder.data.order)
    } catch (error) {
      toast.error(`${error}`)
    }
   }
   getData();
   }, [])

   const handleAccpetOrders = async (orderId: number) => {
    setAccepting(true)
    try {
      const response = await acceptOrder(orderId)

      if(response.status === 200){
        toast.success("Order Accepted")
      }
    } catch (error) {
      toast.error(`${error}`)
    } finally {
      setAccepting(false)
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
      <Navbar leftType="head" title="ORDERS" primarybtn="Distribute" width="168px" height="40px"  onPress={() => setDistributeDialog(true)} />

      <div className={`flex flex-col justify-center w-full bg-[#F0F0F0] p-5 rounded-[13px]  `} >
        <Tab 
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

        <div className="p-5 ">
          {(currentTab === 2 && orders.length > 0) && (
             <span className="cursor-pointer text-sm font-[500] text-[#27BA5F]">Download order file</span>
          )}

          <div className="mt-5 ">
            {currentTab === 1 && (
              <>
               {orders.length > 0 ? (
              <div className="flex flex-col gap-6">
                {sortedDates.map((date) => (
                  <div key={date} className="flex flex-col gap-4">
                    <h2 className="text-[#03140A80] text-md">
                      {formatDateWithOrdinal(date + 'T00:00:00.000Z')}
                    </h2>
                    
                    <div className="flex flex-col gap-4">
                      {groupedOrders[date].map((order: any) => (
                        <div className="w-full bg-white rounded-[12px] p-4 flex flex-col gap-4" key={order.id}>
                          <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
                            <div className="flex flex-col lg:flex-row items-center gap-4">
                              <Image src={order.product_details?.primary_image || '/placeholder.jpg'} alt="product" width={60} height={60} />

                              <div className="">
                                <div className="flex items-center gap-1 text-sm">
                                  <h2 className="text-[#03140A80] font-[500]">Buyer name:</h2>
                                  <span className="font-[600]">{order.customer_name}</span>
                                </div>

                                <div className="flex items-center gap-1 text-sm">
                                  <h2 className="text-[#03140A80] font-[500]">Amount paid:</h2>
                                  <span className="font-[600]">{order.total_price}</span>
                                </div>

                                <div className="flex items-center gap-1 text-sm">
                                  <h2 className="text-[#03140A80] font-[500]">Transaction code:</h2>
                                  <span className="font-[600]">{order.code}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-5">
                              <div className="cursor-pointer flex items-center" onClick={() => {
                                setOpen(!open)
                                if(openId !== order.id) {
                                  setOpenId(order.id)
                                } else {
                                  setOpenId(0)
                                }
                              }}>
                                <span className="text-[#27BA5F] text-sm font-[500] hidden lg:block">
                                  {openId === order.id ? 'Less details' : 'More details'} 
                                </span>
                                <ChevronDown fill="#27BA5F" color="#27BA5F" />
                              </div>

                              {currentTab === 1 && (
                                <div className="flex items-center gap-3">
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

                                  <Button disabled={accepting}  onClick={() => handleAccpetOrders(order.id)} className="cursor-pointer hover:bg-[#27BA5F] bg-[#27BA5F] w-fit min-w-[65px] h-[32px] flex gap-2 justify-center rounded-full items-center">
                                    {accepting && <Loader2 className="animate-spin" />}
                                    <h2 className="text-sm text-white font-[700]">Accept{accepting && 'ing'}</h2>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="">
                            {(open && openId === order.id) && (
                              <div className="">
                                <hr />
                                <div className="p-4 flex flex-col gap-2">
                                  <div className="flex items-center justify-between text-[#03140A80]">
                                    <h3 className="font-[500]">Contact</h3>
                                    <span>{order.customer_whatsapp}</span>
                                  </div>

                                  <div className="flex items-center justify-between text-[#03140A80]">
                                    <h3 className="font-[500]">Timestamp</h3>
                                    <span>{formatTimestamp(order.updated_at)}</span>
                                  </div>

                                  <div className="flex items-center justify-between text-[#03140A80]">
                                    <h3 className="font-[500]">Address</h3>
                                    <span className="w-[237px] text-right">{order.customer_address}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4">
                <Image src={'/box.png'} alt="box" width={200} height={200} />
                <h2 className="text-sm">
                  You have no {currentTab === 1 ? 'incoming' : currentTab === 2 ? 'accepted' : 'shipped'} order
                </h2>
              </div>
            )}</>
            )}
           

           {/* Accepted Orders */}
                 {currentTab === 2 && (
              <>
               {acceptedOrders.length > 0 ? (
              <div className="flex flex-col gap-6">
                {acceptedsortedDates.map((date) => (
                  <div key={date} className="flex flex-col gap-4">
                    <h2 className="text-[#03140A80] text-md">
                      {formatDateWithOrdinal(date + 'T00:00:00.000Z')}
                    </h2>
                    
                    <div className="flex flex-col gap-4">
                      {groupedAcceptedOrders[date].map((order: any) => (
                        <div className="w-full bg-white rounded-[12px] p-4 flex flex-col gap-4" key={order.id}>
                          <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
                            <div className="flex flex-col lg:flex-row items-center gap-4">
                              <Image src={order.product_details?.primary_image || '/placeholder.jpg'} alt="product" width={60} height={60} />

                              <div className="">
                                <div className="flex items-center gap-1 text-sm">
                                  <h2 className="text-[#03140A80] font-[500]">Buyer name:</h2>
                                  <span className="font-[600]">{order.customer_name}</span>
                                </div>

                                <div className="flex items-center gap-1 text-sm">
                                  <h2 className="text-[#03140A80] font-[500]">Amount paid:</h2>
                                  <span className="font-[600]">{order.total_price}</span>
                                </div>

                                <div className="flex items-center gap-1 text-sm">
                                  <h2 className="text-[#03140A80] font-[500]">Transaction code:</h2>
                                  <span className="font-[600]">{order.code}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-5">
                              <div className="cursor-pointer flex items-center" onClick={() => {
                                setOpen(!open)
                                if(openId !== order.id) {
                                  setOpenId(order.id)
                                } else {
                                  setOpenId(0)
                                }
                              }}>
                                <span className="text-[#27BA5F] text-sm font-[500] hidden lg:block">
                                  {openId === order.id ? 'Less details' : 'More details'} 
                                </span>
                                <ChevronDown fill="#27BA5F" color="#27BA5F" />
                              </div>

                             
                            </div>
                          </div>

                          <div className="">
                            {(open && openId === order.id) && (
                              <div className="">
                                <hr />
                                <div className="p-4 flex flex-col gap-2">
                                  <div className="flex items-center justify-between text-[#03140A80]">
                                    <h3 className="font-[500]">Contact</h3>
                                    <span>{order.customer_whatsapp}</span>
                                  </div>

                                  <div className="flex items-center justify-between text-[#03140A80]">
                                    <h3 className="font-[500]">Timestamp</h3>
                                    <span>{formatTimestamp(order.updated_at)}</span>
                                  </div>

                                  <div className="flex items-center justify-between text-[#03140A80]">
                                    <h3 className="font-[500]">Address</h3>
                                    <span className="w-[237px] text-right">{order.customer_address}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4">
                <Image src={'/box.png'} alt="box" width={200} height={200} />
                <h2 className="text-sm">
                  You have no accepted order
                </h2>
              </div>
            )}</>
            )}

            {currentTab === 3 && (
              <>
               {shippedOrder && shippedOrder.length > 0 ? (
              <div className="flex flex-col gap-6">
                {shippedsortedDates?.map((date) => (
                  <div key={date} className="flex flex-col gap-4">
                    <h2 className="text-[#03140A80] text-md">
                      {formatDateWithOrdinal(date + 'T00:00:00.000Z')}
                    </h2>
                    
                    <div className="flex flex-col gap-4">
                      {groupedShippedOrders[date].map((order: any) => (
                        <div className="w-full bg-white rounded-[12px] p-4 flex flex-col gap-4" key={order.id}>
                          <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
                            <div className="flex flex-col lg:flex-row items-center gap-4">
                              <Image src={order.product_details?.primary_image || '/placeholder.jpg'} alt="product" width={60} height={60} />

                              <div className="">
                                <div className="flex items-center gap-1 text-sm">
                                  <h2 className="text-[#03140A80] font-[500]">Buyer name:</h2>
                                  <span className="font-[600]">{order.customer_name}</span>
                                </div>

                                <div className="flex items-center gap-1 text-sm">
                                  <h2 className="text-[#03140A80] font-[500]">Amount paid:</h2>
                                  <span className="font-[600]">{order.total_price}</span>
                                </div>

                                <div className="flex items-center gap-1 text-sm">
                                  <h2 className="text-[#03140A80] font-[500]">Transaction code:</h2>
                                  <span className="font-[600]">{order.code}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-5">
                              <div className="cursor-pointer flex items-center" onClick={() => {
                                setOpen(!open)
                                if(openId !== order.id) {
                                  setOpenId(order.id)
                                } else {
                                  setOpenId(0)
                                }
                              }}>
                                <span className="text-[#27BA5F] text-sm font-[500] hidden lg:block">
                                  {openId === order.id ? 'Less details' : 'More details'} 
                                </span>
                                <ChevronDown fill="#27BA5F" color="#27BA5F" />
                              </div>
                            </div>
                          </div>

                          <div className="">
                            {(open && openId === order.id) && (
                              <div className="">
                                <hr />
                                <div className="p-4 flex flex-col gap-2">
                                  <div className="flex items-center justify-between text-[#03140A80]">
                                    <h3 className="font-[500]">Contact</h3>
                                    <span>{order.customer_whatsapp}</span>
                                  </div>

                                  <div className="flex items-center justify-between text-[#03140A80]">
                                    <h3 className="font-[500]">Timestamp</h3>
                                    <span>{formatTimestamp(order.created_at)}</span>
                                  </div>

                                  <div className="flex items-center justify-between text-[#03140A80]">
                                    <h3 className="font-[500]">Address</h3>
                                    <span className="w-[237px] text-right">{order.customer_address}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4">
                <Image src={'/box.png'} alt="box" width={200} height={200} />
                <h2 className="text-sm">
                  You have no shipped order
                </h2>
              </div>
            )}</>
            )}
           
          </div>
        </div>
      </div>

      <Dialog onOpenChange={setDistributeDialog} open={distributeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="flex">
                {step.map((item) => (
                  <div key={item.id} className="flex gap-2">
                    <div className="flex flex-col items-center cursor-pointer">
                      <item.icon color={`${distributeStep === item.id ? '#27BA5F' : '#03140A4D'}`} fill={`${distributeStep === item.id ? '#27BA5F' : '#03140A4D'}`} />
                      <span className={`text-[10px] ${distributeStep === item.id ? 'text-[#27BA5F]' : 'text-[#03140A4D]'}`}>
                        {item.title}
                      </span>
                    </div>

                    <div className="pt-5">
                      <div className="h-[0px] w-[41px] border border-[#03140A33]" />
                    </div>
                  </div>
                ))}
              </div>
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <div className="">
            <Distribute 
              currentStep={distributeStep}
              setCurrentStep={setDistributeStep}
              setOpen={setDistributeDialog}
              openCompleted={openCompleted}
              setOpenCompleted={setOpenCompleted}
              setDispatchModal={setAddDispatchModal}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog onOpenChange={setOpenCompleted} open={openCompleted}>
        <AlertDialogContent>
          <AlertDialogTitle></AlertDialogTitle>
          <div className="">
            <div className="flex flex-col items-center justify-center">
              <div className="bg-[#27BA5F29] w-[85px] h-[85px] rounded-full flex flex-col items-center justify-center">
                <div className="bg-[#27BA5F29] w-[69px] h-[69px] rounded-full flex items-center justify-center flex-col">
                  <div className="bg-[#27BA5F] w-[54px] h-[54px] rounded-full flex flex-col items-center justify-center">
                    <Check color="white" size={20} />
                  </div>
                </div>
              </div>

              <h3 className="text-[20px] font-[700]">Successful</h3>
              <span className="text-[#03140A80] text-sm w-[200px] text-center">
                Your product distribution has been initiated
              </span>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel className="w-full bg-[#27BA5F] text-white hover:bg-green-400 hover:text-white rounded-[12px]">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog onOpenChange={setAddDispatchModal} open={addDispatchModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add one-time dispatch</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <div className="">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4">
                <Label className="font-[700] text-[#03140A80]">DISPATCH NAME</Label>
                <Input placeholder="Dispatch IV" className="bg-[#F0F0F0]" />
              </div>

              <div className="flex flex-col gap-4">
                <Label className="font-[700] text-[#03140A80]">PHONE NUMBER</Label>
                <Input placeholder="+2349023....." className="bg-[#F0F0F0]" />
              </div>

              <div className="flex flex-col gap-4">
                <Label className="font-[700] text-[#03140A80]">VEHICLE</Label>
                <div className="flex items-center gap-4">
                  {["Motorcycle", "Car"].map((item, index) => (
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedride(index)} key={index}>
                      <div className={`border h-[16px] w-[16px] rounded-full flex flex-col items-center justify-center ${selectedride === index ? "border-[#27BA5F]" : "border-[#D9D9D9]"}`}>
                        {selectedride === index && (
                          <div className="bg-[#27BA5F] h-[12px] w-[12px] rounded-full" />
                        )}
                      </div>
                      <h2 className={`${selectedride === index ? 'text-[#27BA5F] font-[500]' : 'text-[#03140A80]'} text-sm`}>
                        {item}
                      </h2>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Label className="font-[700] text-[#03140A80]">PLATE NUMBER</Label>
                <Input placeholder="BNDJOWEF" className="bg-[#F0F0F0]" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-5 p-2">
              <div className="text-[#27BA5F] w-full text-[16px] font-[700] flex items-center gap-2 cursor-pointer">
                <Plus />
                <span>Register dispatch</span>
              </div>

              <div
                onClick={() => {
                  setDistributeStep(2)
                  setDistributeDialog(true)
                  setAddDispatchModal(false)
                }}
                className="bg-[#27BA5F] w-full text-white p-2 justify-center rounded-full text-[16px] font-[700] flex items-center gap-2 cursor-pointer"
              >
                <span className="">Use dispatch</span>
                <ArrowRight className="text-end" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Orders