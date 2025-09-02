'use client'
import Navbar from "@/components/shared/Navbar"
import { Switch } from "@/components/ui/switch"
import { ArchiveRestore, ImagePlus, LinkIcon, PenIcon, PlusIcon, Trash } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const ProductDetails = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0)
  const categories = [
    "Phones", "Tablets", "Laptops"
  ]
  const router = useRouter();
  return (
    <div>
        <Navbar leftType='arrow' showIcon  primarybtn="Create Product"  width="168px" height="40px"  />
        
        <div className="mt-10 flex lg:flex-row flex-col  justify-between gap-5  ">
          <div className="w-full">

            <Image src={'/product1.jpg'} alt="product1" width={350} height={350} />

            <div className="flex items-center justify-between" >
              <div className="flex items-center gap-4 justify-center pt-4 cursor-pointer">
                   {[1,2,3].map((_, index) => (
                <div key={index} onClick={() => setCurrentIndex(index)} className={`${currentIndex === index && 'border-2 rounded-[6px] border-green-400'}`}>
                  <Image src={'/product1.jpg'} alt="product1" width={56} height={56} />
                </div>
              ))}
              </div>
           
              <div className="flex items-center gap-3 mt-6 mr-15">
                <span className="text-[16px]">In stock</span>
                <Switch />
              </div>
            </div>

            <div className="bg-[#F0F0F0] w-full h-[200px] p-5 mt-4 rounded-[13px] gap-3 flex flex-col ">
              <Dialog>
  <DialogTrigger>
     <div className="cursor-pointer flex items-center gap-7 ">
                <PenIcon color="#03140A66" fill="#03140A66" />
                <span className="text-[16px] ">Edit product details</span>
              </div>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Product Details</DialogTitle>
      <DialogDescription>
      </DialogDescription>
    </DialogHeader>

    <div className="flex flex-col gap-6 ">
      <div className="flex flex-col gap-3">
        <Label className="font-[700] text-[#03140A80] ">PRODUCT NAME</Label>

        <Input  className="bg-[#F0F0F0] rounded-[12px] " placeholder="Enter product name" defaultValue={'XIAOMI Redmi 14C'} />
      </div>

        <div className="flex flex-col gap-3">
        <Label className="font-[700] text-[#03140A80] ">PRICE</Label>
        <div className="bg-[#F0F0F0] h-[40px] flex items-center gap-1.5  rounded-[12px] ">
          <div className="pl-2">
             <div className="w-[42px] h-[34px] bg-[#27BA5F1F] flex flex-col rounded-[8px] items-center justify-center">
            <span className="text-[12px] text-[#27BA5F] ">NGN</span>
          </div>
          </div>
         
          <Input   placeholder="Enter product name" defaultValue={'157,000.00'} />
        </div>
        
      </div>

      <div className="flex flex-col gap-3">
        <Label className="font-[700] text-[#03140A80] ">PRODUCT DESCRIPTION</Label>

        <Textarea  className="bg-[#F0F0F0] rounded-[12px] text-[#03140A80] " placeholder="Enter product name" defaultValue={`XIAOMI Redmi 14c combines performance and style with a large 6.88" HD display and smooth 120Hz refresh rate for an immersive viewing experience. Built with Corning Gorilla Glass 3 and a splash-resistant body, it's durable enough for everyday life.`} />
      </div>

        <div className="flex flex-col gap-3">
        <Label className="font-[700] text-[#03140A80] ">CATEGORY</Label>

        <div className="flex items-center gap-6 ">
          {categories.map((category, index) => (
            <div onClick={() => setActiveCategory(index)} key={index} className="flex items-center gap-4 ">
              <div className={ `border h-[16px] w-[16px] rounded-full ${activeCategory === index ? 'border-[#27BA5F]' : 'border-[#D9D9D9] '} flex flex-col items-center justify-center  `} >
                {activeCategory === index && (
                  <div className="bg-[#27BA5F] h-[12px] w-[12px] rounded-full " />
                )}
              </div>
              <span>{category}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-5 text-[#27BA5F] font-semibold  ">
          <PlusIcon />
          Add Category
        </div>
      </div>


      <Button className="bg-green-500 hover:bg-green-400">
        Save
      </Button>
    </div>
  </DialogContent>
</Dialog>
             
              <hr />

                 <Dialog>
  <DialogTrigger>
      <div className="cursor-pointer flex items-center gap-7 ">
                <ImagePlus color="#03140A66" fill="#03140A66" />
                <span className="text-[16px] ">Edit product Image</span>
              </div>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Product Image</DialogTitle>
      <DialogDescription>
      </DialogDescription>
    </DialogHeader>

    <div className="flex flex-col gap-4 ">
      <Label className="font-[700] text-[#03140A80] " >PRODUCT IMAGE</Label>

      <div className="bg-[#F0F0F0] w-full h-[88px] flex items-center justify-between rounded-[15px] p-4  ">
        <div className="flex items-center gap-4 ">
           <Image src={'/product1.jpg'} alt="product" width={50} height={50} />
        <span className="text-[#03140A80] ">Whatsappimage99435.jpg</span>
        </div>

        <Button variant={'ghost'}>
          <Trash fill="#ED2525" color="#ED2525" />
        </Button>
       
      </div>

      <div className="text-green-500 flex gap-5 items-center justify-center cursor-pointer  ">
        <PlusIcon />
        Add Image
      </div>
    </div>
  </DialogContent>
</Dialog>
              <hr />
              
              
               <div className="cursor-pointer flex items-center gap-7 ">
                <ArchiveRestore color="#03140A66" fill="#03140A66" />
                <span className="text-[16px] ">Archive product</span>
              </div>
              <hr />
              <AlertDialog>
  <AlertDialogTrigger>
     <div className="cursor-pointer flex items-center gap-7 ">
                <Trash color="#ED2525" fill="#ED2525" />
                <span className="text-[16px] text-[#ED2525] ">Delete product</span>
              </div>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle className="font-[700] text-center ">Are you sure you want to delete this product</AlertDialogTitle>
      <AlertDialogDescription className="text-[#A9AEAB] text-center">
        This action is permanent and cannot be reversed
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="flex justify-center items-center ">
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={() => {router.push('/marketplace')}} className="bg-[#ED2525] hover:bg-red-400">Delete product</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
              
              <hr />
            </div>
          </div>
          <div className="w-full bg-[#F0F0F0] h-fit rounded-[12px] p-5  ">
            <h2 className="text-[20px] font-[500] ">XIAOMI Redmi 14C</h2>

            <div className="flex items- justify-between">
                <div className="text-[#F48614] flex gap-0.5 ">
                <span className="text-[15px] ">NGN</span>
            <h2 className="text-[16px] font-[600] ">134,320</h2>
            </div>

            <Link className="bg-[#27BA5F1F] flex p-2 items-center gap-3  h-[31px] rounded-[15px] " href='/'>
                        <LinkIcon  color="#27BA5F" width={15} />
                        <span className="text-[#27BA5F] text-[12px] font-[700] ">Copy Link</span>
                        </Link>
            </div>

            <h3 className="font-extrabold mt-9 ">PRODUCT DESCRIPTION</h3>

            <p className="pt-4 text-[#03140A80] ">
              XIAOMI Redmi 14c combines performance and style with a large 6.88" HD display and smooth 120Hz refresh rate for an immersive viewing experience. Built with Corning Gorilla Glass 3 and a splash-resistant body, it's durable enough for everyday life.

              <br />
              <br />
Powered by a MediaTek Helio G81 Ultra processor and up to 8GB of RAM, it handles multitasking and apps effortlessly. Store everything you need with up to 256GB of storage, expandable via microSD card.

<br />

<br />
Capture life in sharp detail with a 50MP dual rear camera and a 13MP front camera, both supporting 1080p HD video. Enjoy your favorite tunes with a 3.5mm headphone jack, loudspeaker, and FM radio.

<br/>
<br />
Stay connected with dual SIM, Wi-Fi 5, Bluetooth 5.4, GPS, and USB-C with OTG. The 5160mAh battery gives you all-day power, and when it runs low, 18W fast charging gets you back up quickly.
            </p>
          </div>
        </div>
        </div>
  )
}

export default ProductDetails