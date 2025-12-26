"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Permission, Role } from 'appwrite'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronRight, ImagePlus, Loader2, Plus, SearchIcon, X } from "lucide-react"
import { Textarea } from "../ui/textarea"
import { useState } from "react"
import { storage } from "@/actions/storage.actions"
import { toast } from "sonner"
import { createProduct } from "@/actions/products.actions"

// FIXED: Properly validate file input
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  productName: z.string().min(2).max(50),
  tags: z.array(z.string()),
  productImage: z
    .any()
    .refine((file) => file instanceof File, {
      message: "Image is required",
    })
    .refine((file) => file && file.size <= MAX_FILE_SIZE, {
      message: "Max file size is 2MB",
    })
    .refine(
      (file) => file && ACCEPTED_IMAGE_TYPES.includes(file.type),
      {
        message: "Only .jpg, .jpeg, .png and .webp formats are supported",
      }
    ),
  description: z.string(),
  price: z.string()
});

const tagss = [
  "Mobile Devices",
  "Notebooks",
  "E-Readers",
  "Gadgets",
  "Smart Devices",
  "Tech Innovations"
]

const CreateProduct = ({ open, setOpen }: { open: boolean, setOpen: (value: boolean) => void }) => {
  const [preview, setPreview] = useState<string | null>(null)
  const [openTagModal, setOpenTagModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      tags: [],
      description: "",
      price: "",
      productImage: undefined,
    },
  });

  const addTag = (tag: string) => {
    const currentTags = form.getValues("tags") || []

    if (!currentTags.includes(tag)) {
      form.setValue("tags", [...currentTags, tag], {
        shouldValidate: true,
      })
    }
  }

  // FIXED: Handle file upload properly
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true);
    
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      // Set the file in the form
      form.setValue("productImage", file, { shouldValidate: true });
      
      toast.success('Image selected successfully');
    } catch (error) {
      toast.error('Error selecting image');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

const onSubmit = async (values: z.infer<typeof formSchema>) => {
  setIsSubmitting(true);
  
  try {
    // Create FormData to send file
    const formData = new FormData();
    formData.append("name", values.productName);
    formData.append("price", values.price);
    formData.append("description", values.description);
    
    // Append tags as JSON string
    if (values.tags && values.tags.length > 0) {
      formData.append("tags", JSON.stringify(values.tags));
    }
    
    // Append the file - ensure it's a File object
    if (values.productImage && values.productImage instanceof File) {
      formData.append("front_image", values.productImage);
    }

    // Call your backend API with FormData
    const response = await createProduct(formData);

    if (response.status === 201) {
      setOpen(false);
      toast.success("Product created successfully");
      
      // Reset form
      form.reset({
        productName: "",
        tags: [],
        description: "",
        price: "",
        productImage: undefined,
      });
      setPreview(null);
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || error.response?.data || "Error creating product");
    console.error("Error:", error);
  } finally {
    setIsSubmitting(false);
  }
}

  return (
    <div>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Product</DialogTitle>
            <DialogDescription>
              <div className="mt-7">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="productImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#03140A80] uppercase font-bold">
                            product image
                          </FormLabel>
                          <FormControl>
                            <label className="bg-[#F0F0F0] cursor-pointer gap-4 text-[#27BA5F] font-bold rounded-[12px] max-w-lg h-[88px] flex flex-col items-center justify-center border border-dashed border-[#27BA5F]">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange} // FIXED: Use separate handler
                              />
                              {preview ? (
                                <div className="relative w-full h-full">
                                  <img 
                                    src={preview} 
                                    alt="Preview" 
                                    className="h-full w-full object-contain rounded-md" 
                                  />
                                  <button
                                    type="button"
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setPreview(null);
                                      form.setValue("productImage", undefined);
                                    }}
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    {isLoading ? (
                                      <Loader2 className="animate-spin" />
                                    ) : (
                                      <>
                                        <ImagePlus />
                                        Upload Image
                                      </>
                                    )}
                                  </div>
                                  <span className="text-[#03140A80] text-sm">
                                    Image should be 2MB max
                                  </span>
                                </>
                              )}
                            </label>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Rest of your form fields remain the same */}
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#03140A80] uppercase font-bold ">product Name</FormLabel>
                          <FormControl>
                            <Input className="bg-[#F0F0F0] rounded-[12px] max-w-lg" placeholder="Enter product name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#03140A80] uppercase font-bold ">price</FormLabel>
                          <FormControl>
                            <div className="bg-[#F0F0F0] rounded-[12px] max-w-lg flex items-center gap-2 p-2">
                              <div className="w-[49px] text-[#27BA5F] rounded-[8px] bg-[#27BA5F1F] h-[28px] flex flex-col items-center justify-center text-sm  ">NGN</div>
                              <Input placeholder="0.00" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#03140A80] uppercase font-bold ">product description</FormLabel>
                          <FormControl>
                            <Textarea className="bg-[#F0F0F0] rounded-[12px] max-w-lg" placeholder="Enter product description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tags field remains the same */}
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#03140A80] uppercase font-bold">
                            product tag
                          </FormLabel>
                          <FormControl>
                            <div
                              onClick={() => setOpenTagModal(!openTagModal)}
                              className="bg-[#F0F0F0] cursor-pointer rounded-[12px] min-h-[50px] max-w-lg p-2 flex justify-between"
                            >
                              {field.value.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                  {field.value.map((tag) => (
                                    <div
                                      key={tag}
                                      className="bg-white p-2 rounded-sm flex items-center gap-2 text-sm"
                                    >
                                      <span>{tag}</span>
                                      <X
                                        size={14}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          field.onChange(field.value.filter((t) => t !== tag))
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span>Select a product tag</span>
                              )}
                              <ChevronRight className="text-[#A9AEAB]" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {openTagModal && (
                      <div className="w-fit min-w-[200px] rounded-sm flex flex-col gap-2 h-auto p-3 absolute z-[999] bottom-4 left-[110%] bg-white shadow-lg border">
                        <h3 className="uppercase text-black font-bold">select product tag</h3>
                        <div className="w-[200px] bg-[#F0F0F0] h-[30px] flex items-center gap-2 pl-2 rounded-[12px]">
                          <SearchIcon color="#A9AEAB" size={16} />
                          <Input className="h-fit" placeholder="Search tag" />
                        </div>
                        <div className="flex flex-col gap-3">
                          {tagss.map((tag) => (
                            <div
                              key={tag}
                              onClick={() => addTag(tag)}
                              className={`cursor-pointer ${form.getValues("tags").includes(tag) ? 'text-green-400' : 'text-black'} font-semibold`}
                            >
                              {tag}
                            </div>
                          ))}
                        </div>
                        <div>
                          <h2>Didn't find the right tag? <span className="font-bold text-green-500 cursor-pointer">Add tag</span></h2>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full bg-green-500 hover:bg-green-400"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <>
                          <Plus />
                          Create Product
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateProduct