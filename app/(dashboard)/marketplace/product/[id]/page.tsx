'use client'
import Navbar from "@/components/shared/Navbar"
import { Switch } from "@/components/ui/switch"
import { ArchiveRestore, ImagePlus, LinkIcon, PenIcon, PlusIcon, Trash, Upload } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
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
import { usePathname, useRouter } from "next/navigation"
import { deleteProduct, getProductbyId, togglearchiveProduct, updateProductImage } from "@/actions/products.actions"
import { toast } from "sonner"
import LoadingModal from "@/components/shared/LoadingModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface ProductImageState {
  front_image: File | string | null;
  back_image: File | string | null;
  left_image: File | string | null;
  right_image: File | string | null;
}

const ProductDetails = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const [product, setProduct] = useState<ProductProps | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<'front' | 'back' | 'left' | 'right'>('front');
  const pathname = usePathname();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [currentImag, setCurrentImag] = useState('')
  const productId = pathname.split('/')[3]
  const categories = [
    "Phones", "Tablets", "Laptops"
  ]
  const router = useRouter();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await getProductbyId(Number(productId));

        setProduct(response.data)
      } catch (error) {
        toast.error(`${error}`)
      }
    }


    getProducts();
  }, []);

  const handleDelete = async  () => {
    try {
      const response = await deleteProduct(Number(productId));

      if(response.status === 200) {
        toast.success("Product deleted!")
        setProduct(null)
        router.back();
      }
    } catch (error) {
      toast.error(`${error}`)
    }
  }




   const toggleArchive = async  () => {
    try {
      const response = await togglearchiveProduct(Number(productId));

      if(response.status === 200) {
        toast.success("Product Archived!")
        setProduct(null)
        router.back();
      }
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  const handleUpdateImage = async () => {
    if (!selectedFile || !productId) {
      toast.error("Please select an image first");
      return;
    }

    setIsUploading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('productId', productId);
      
      // Only append the selected image type to avoid null values for others
      // The API should handle preserving existing values for other image fields
      switch (selectedImageType) {
        case 'front':
          formData.append('front_image', selectedFile);
          break;
        case 'back':
          formData.append('back_image', selectedFile);
          break;
        case 'left':
          formData.append('left_image', selectedFile);
          break;
        case 'right':
          formData.append('right_image', selectedFile);
          break;
      }

      const response = await updateProductImage({
        productId,
        // Send FormData instead of individual fields
        formData
      });

      if(response.status === 200) {
        toast.success(`${selectedImageType.replace('_', ' ')} image updated successfully!`);
        
        // Update local state with the new image
        if (product && previewImage) {
          const updatedProduct = { ...product };
        
          setProduct(updatedProduct);
        }
        
        // Reset states
        setSelectedFile(null);
        setPreviewImage(null);
      }
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  if(!product) return <LoadingModal />
  return (
    <div>
        <Navbar leftType='arrow' showIcon  primarybtn="Create Product"  width="168px" height="40px"  />
        
        <div className="mt-10 flex lg:flex-row flex-col  justify-between gap-5  ">
          <div className="w-full">

            <Image src={currentImag ? currentImag : product?.images[0]?.image_url} alt="product1" width={350} height={350} />

            <div className="flex items-center justify-between" >
              <div className="flex items-center gap-4 justify-center pt-4 cursor-pointer">
                   {product?.images?.map((image, index) => (
                <div key={index} onClick={() => {setCurrentIndex(index)
                  setCurrentImag(image.image_url)
                }} className={`${currentIndex === index && 'border-2 rounded-[6px] border-green-400'}`}>
                  <Image src={image.image_url} alt="product1" width={56} height={56} />
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

        <Input  className="bg-[#F0F0F0] rounded-[12px] " placeholder="Enter product name" defaultValue={product?.name} />
      </div>

        <div className="flex flex-col gap-3">
        <Label className="font-[700] text-[#03140A80] ">PRICE</Label>
        <div className="bg-[#F0F0F0] h-[40px] flex items-center gap-1.5  rounded-[12px] ">
          <div className="pl-2">
             <div className="w-[42px] h-[34px] bg-[#27BA5F1F] flex flex-col rounded-[8px] items-center justify-center">
            <span className="text-[12px] text-[#27BA5F] ">NGN</span>
          </div>
          </div>
         
          <Input   placeholder="Enter product name" defaultValue={product?.price} />
        </div>
        
      </div>

      <div className="flex flex-col gap-3">
        <Label className="font-[700] text-[#03140A80] ">PRODUCT DESCRIPTION</Label>

        <Textarea  className="bg-[#F0F0F0] rounded-[12px] text-[#03140A80] " placeholder="Enter product name" defaultValue={`${product?.description}`} />
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
                <div className="cursor-pointer flex items-center gap-7">
                  <ImagePlus color="#03140A66" fill="#03140A66" />
                  <span className="text-[16px]">Edit product Image</span>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Update Product Image</DialogTitle>
                  <DialogDescription>
                    Select which view you want to update and upload a new image
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                  {/* Image type selector */}
                  <div className="flex flex-col gap-3">
                    <Label className="font-[700] text-[#03140A80]">SELECT IMAGE TYPE</Label>
                    <Select 
                      value={selectedImageType} 
                      onValueChange={(value: 'front' | 'back' | 'left' | 'right') => setSelectedImageType(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select image type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="front">Front View</SelectItem>
                        <SelectItem value="back">Back View</SelectItem>
                        <SelectItem value="left">Left Side</SelectItem>
                        <SelectItem value="right">Right Side</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* File upload section */}
                  <div className="flex flex-col gap-3">
                    <Label className="font-[700] text-[#03140A80]">UPLOAD NEW IMAGE</Label>
                    <div className="border-2 border-dashed border-[#D9D9D9] rounded-[15px] p-6 text-center">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Label 
                        htmlFor="image-upload" 
                        className="cursor-pointer flex flex-col items-center gap-3"
                      >
                        <Upload className="w-8 h-8 text-[#03140A80]" />
                        <span className="text-[#03140A80]">
                          {selectedFile ? selectedFile.name : 'Click to upload image'}
                        </span>
                        <span className="text-sm text-gray-500">
                          JPG, PNG up to 5MB
                        </span>
                      </Label>
                    </div>

                    {/* Preview of selected file */}
                    {previewImage && (
                      <div className="mt-4">
                        <Label className="font-[700] text-[#03140A80] mb-2 block">PREVIEW</Label>
                        <div className="bg-[#F0F0F0] w-full h-[120px] flex items-center justify-center rounded-[15px] overflow-hidden">
                          <Image 
                            src={previewImage} 
                            alt="Preview" 
                            width={100} 
                            height={100} 
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewImage(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 bg-green-500 hover:bg-green-400"
                      onClick={handleUpdateImage}
                      disabled={!selectedFile || isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Update Image'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
              <hr />
              
                 <AlertDialog>
  <AlertDialogTrigger>
      <div className="cursor-pointer flex items-center gap-7 ">
                <ArchiveRestore color="#03140A66" fill="#03140A66" />
                <span className="text-[16px] ">Archive product</span>
              </div>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle className="font-[700] text-center ">Are you sure you want to archive this product?</AlertDialogTitle>
      <AlertDialogDescription className="text-[#A9AEAB] text-center">
        Buyers won’t be able to see it, you can always unarchive it in marketplace
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="flex justify-center items-center ">
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={toggleArchive} className="bg-[#27BA5F] hover:bg-green-400">Archive product</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
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
      <AlertDialogAction onClick={handleDelete} className="bg-[#ED2525] hover:bg-red-400">Delete product</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
              
              <hr />
            </div>
          </div>
          <div className="w-full bg-[#F0F0F0] h-fit rounded-[12px] p-5  ">
            <h2 className="text-[20px] font-[500] ">{product?.name}</h2>
            

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
             {product?.description}
            </p>
          </div>
        </div>
        </div>
  )
}

export default ProductDetails