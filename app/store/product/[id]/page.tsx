'use client'

import { z } from "zod"

import { getSingleProduct, getStoreDetails } from "@/actions/products.actions"
import LoadingModal from "@/components/shared/LoadingModal"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Loader2, ShoppingBag, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createOrders } from "@/actions/orders.actions"
import GooglePlacesAutocomplete from "react-google-places-autocomplete"


const formSchema = z.object({
  customerName: z.string().min(2).max(50),
  customerAddress: z.string(),
  deliveryMethod: z.string(),
  customerWhatsapp: z.string(),
  quantity:z.string()
})

const ProductDetails = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [product, setProduct] = useState<any>()
    const id = pathname.split('/')[3];
    const [currentImage, setCurrentImage] = useState()
    const [seller, setSeller] = useState<any>();
    const [openDialog, setOpenDialog] = useState(false)

    const [ordering, setOrdering] = useState(false)

    useEffect(() => {
        const getProduct = async () => {
            setIsLoading(true)
            try {
                 const response = await getSingleProduct(Number(id));
                 if(response.status === 200) {
                    setProduct(response.data)

                      const seller = await getStoreDetails(response.data.store_slug);
                      setSeller(seller.data)
                 }
            
            } catch (error: any) {
                toast.error(`${error.detail}`)
                console.log(JSON.stringify(error))
            } finally {
                setIsLoading(false)
            }
           
        }

        getProduct()
    
    }, [])


     const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerAddress: "",
      deliveryMethod: "",
      customerWhatsapp: "",
      quantity: ""
    },
  })
 
 async function onSubmit(values: z.infer<typeof formSchema>) {
   setOrdering(true)

   try {
    const response = await createOrders({
        product: Number(id),
        customer_name: values.customerName,
        customer_address: values.customerAddress,
        customer_whatsapp: values.customerWhatsapp,
        delivery_method: values.deliveryMethod,
        quantity: Number(values.quantity)
    });

   if(response.status === 200) {
    setOpenDialog(false)

    toast.success("order requested successfully")
   }
   } catch (error: any) {
    toast.error(`${error.response.data}`)
   } finally {
    setOrdering(false)
     setOpenDialog(false)
   }
  }
    

    if(isLoading) return <LoadingModal />;

    if(!product) return;

  return (
    <div>
        <Button onClick={() => {router.back()}} variant={'ghost'}>
            <ArrowLeft />
        </Button>

        <div className="flex flex-col p-5 gap-7  mt-5 ">
            <div className=" flex flex-col justify-center items-center gap-4 ">
                <Image className="w-[300px] h-[300px]" src={currentImage ? currentImage : product?.primary_image} alt={product.name} width={100} height={100} />

                <Dialog onOpenChange={setOpenDialog} open={openDialog}>
       <DialogTrigger className="flex flex-col items-end w-full pr-[40px] justify-end">
    
                {/* <div className="flex flex-col items-end w-full pr-[40px] justify-end"> */}
                    <Button className="bg-[#27BA5F] hover:bg-[#27BA5F] ">
                        <ShoppingCart />
                        Add to cart
                    </Button>
                {/* </div> */}
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Fill the details below to order for this product</DialogTitle>
      <DialogDescription>
      <div className="mt-8">
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormField
          control={form.control}
          name="customerAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adress</FormLabel>
              <FormControl>
                <GooglePlacesAutocomplete
                              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                              selectProps={{
                                // value: field.value ?? "",
                                onChange: (value: any) => {
                                  // Update react-hook-form field
                                  field.onChange(value?.label || "");
                                  
                                  // You can also get additional place details
                                  if (value) {
                                    // console.log('Selected place:', value);
                                  }
                                },
                                onBlur: field.onBlur,
                                placeholder: "Enter your address",
                                styles: {
                                  // Custom styling for the autocomplete component
                                  control: (provided) => ({
                                    ...provided,
                                    backgroundColor: '#F0F0F0',
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: 'none',
                                    minHeight: '40px',
                                    '&:hover': {
                                      borderColor: '#ccc'
                                    }
                                  }),
                                  input: (provided) => ({
                                    ...provided,
                                    color: '#03140A',
                                    padding: '8px',
                                  }),
                                  placeholder: (provided) => ({
                                    ...provided,
                                    color: '#666',
                                  }),
                                  menu: (provided) => ({
                                    ...provided,
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    zIndex: 9999,
                                  }),
                                  option: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: state.isSelected ? '#27BA5F' : state.isFocused ? '#E8F5E9' : 'white',
                                    color: state.isSelected ? 'white' : '#03140A',
                                    '&:hover': {
                                      backgroundColor: '#E8F5E9',
                                    }
                                  })
                                },
                                className: "max-w-lg", // Apply max width
                              }}
                              autocompletionRequest={{
                                // Optional: Add restrictions
                                componentRestrictions: {
                                  country: ['ng'], // restrict to US and Canada
                                },
                                types: ['address'], // restrict to addresses only
                              }}
                            />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />

         <FormField
          control={form.control}
          name="customerWhatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter your whatsapp number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormField
          control={form.control}
          name="deliveryMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Method</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select delivery method" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="pickup">Pickup</SelectItem>
  </SelectContent>
</Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input  placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full bg-grren-500 hover:bg-green-400" type="submit" disabled={ordering}>
            {ordering ? <Loader2 className="animate-spin" /> : "Create Order"}
        </Button>
      </form>
    </Form>
      </div>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>


                <div className="flex items-center justify-center gap-3 ">
                    {product.images.map((image: any, index: any) => (
                        <div
                         onClick={() => {setCurrentImage(image.image_url)}} className={
                            `${currentImage === image.url && 'border border-[#27BA5F] '}`
                         }>
                              <Image key={index} className="w-[56px] h-[56px]" src={image.image_url} alt={product.name} width={100} height={100} />
                        </div>
                       
                    ))}
                </div>

                
            </div>

            <div className="flex flex-col gap-5 ">
                <div className="bg-[#F0F0F0] w-full p-4 rounded-[12px]">
                    <div className="flex items-center justify-between">
                        <div className="">
                            <h2 className="text-[#03140A] text-[16px] font-semibold ">{product.name}</h2>
                            <h2 className="text-[#F48614] ">NGN<span className="font-bold text-[16px] ">{product.price}</span></h2>
                        </div>

                        <div className="bg-[#27BA5F1F] px-3 cursor-pointer py-2  rounded-[12px] font-bold flex flex-col items-center justify-center h-[34px] text-[#27BA5F] ">
                            Chat on Whatsapp
                        </div>
                    </div>

                    <div className="mt-10 ">
                        <h2 className="uppercase text-xl font-bold ">Product description</h2>

                        <p className="mt-6 text-[#03140A80] ">
                            {product.description}
                        </p>
                    </div>

                    <div className="mt-10 ">
                        <h2 className="uppercase text-xl font-bold ">3d view</h2>

                      <div className="w-full bg-white h-[200px] rounded-[16px] flex flex-col justify-center items-center mt-5 ">
                         <Image className="w-fit h-[150px]" src={product?.images[0]?.image_url} alt={product.name} width={100} height={100} />

                      </div>
                    </div>
                </div>


                <div onClick={() => router.push(`/store/${product.store_slug}`)} className="bg-[#F0F0F0] w-full p-5 ">
                    <h2 className="uppercase text-xl font-bold ">seller</h2>
                    <div className="flex items-center justify-between">
                        <div className="mt-6 flex items-center gap-3 ">
                            <div className="bg-[#E0D33D] w-[40px] h-[40px] rounded-[30px] ">
                                <Image src={'/avatar.png'} alt="seller img" width={40} height={40}  />
                            </div>
                            <div className="">
                                <h2 className="text-[#03140A80] text-[16px] ">{seller?.merchant?.business_name}</h2>
                                <span className="text-[12px] text-[#03140A80]">Joined 2 weeks ago</span>
                            </div>
                            
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
                </div>
            </div>
        </div>
    </div>
  )
}

export default ProductDetails