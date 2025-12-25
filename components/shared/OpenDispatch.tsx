"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"
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
import { getAllbanks, storage } from "@/actions/storage.actions"
import { Permission, Role } from "appwrite"
import { toast } from "sonner"
import { ImagePlus, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Label } from "../ui/label"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address is required"),
  nextKin: z.string().min(2, "Next of kin is required"),
  
  nin: z.string().min(11, "NIN must be at least 11 characters").max(11, "NIN must be 11 characters"),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits"),
  bankName: z.string().min(1, "Bank name is required"),
  utility: z.string().min(1, "Utility bill is required"),
  
  plateNumber: z.string().min(5, "Plate number is required"),
  location: z.string().min(1, "Location is required"),
  vehicle: z.string().min(1, "Vehicle type is required"),
  transportArea: z.string().min(1, "Transport area is required")
})

const OpenDispatch = ({ open, setOpen }: { open: boolean, setOpen: (value: boolean) => void }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [banks, setBanks] = useState<any[]>([])
  const [fileId, setFileId] = useState<string | null>(null)

  const locations = [
    "Lagos", "Abuja", "Kwara", "Oyo", "Kano", "Rivers", "Delta", "Edo", "Kaduna",
    "Ogun", "Enugu", "Anambra", "Imo", "Bauchi", "Plateau", "Benue", "Sokoto",
    "Katsina", "Jigawa", "Borno", "Yobe", "Adamawa", "Taraba", "Niger", "Zamfara",
    "Gombe", "Kebbi", "Nasarawa", "Ekiti", "Bayelsa", "Osun", "Cross River", "Akwa Ibom",
    "Ebonyi", "Kogi", "Abia", "Ondo"
  ]

  const vehicleTypes = [
    { value: "motorcycle", label: "Motorcycle" },
    { value: "car", label: "Car" },
    { value: "van", label: "Van" },
    { value: "truck", label: "Truck" }
  ]

  const transportAreas = [
    { value: "within", label: "Within located area only" },
    { value: "outside", label: "Outside located area only" },
    { value: "anywhere", label: "Anywhere is fine" }
  ]

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      nextKin: "",
      nin: "",
      accountNumber: "",
      bankName: "",
      utility: "",
      plateNumber: "",
      location: "",
      vehicle: "",
      transportArea: ""
    },
    mode: "onChange"
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      console.log("Form submitted:", values)
      // TODO: Add your submission logic here
      toast.success("Dispatch created successfully!")
      setOpen(false)
      form.reset()
      setCurrentStep(1)
    } catch (error) {
      toast.error("Failed to create dispatch")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const getData = async () => {
      const response = await getAllbanks()
      if (response.status === 'success') {
        setBanks(response.data)
      }
    }

    getData()
  }, [])

  const handleNextStep = async () => {
    let isValid = false
    
    // Validate current step fields
    if (currentStep === 1) {
      isValid = await form.trigger(["name", "phone", "address", "nextKin"])
    } else if (currentStep === 2) {
      isValid = await form.trigger(["nin", "utility", "bankName", "accountNumber"])
    } else if (currentStep === 3) {
      isValid = await form.trigger(["vehicle", "plateNumber", "location", "transportArea"])
    }

    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
      }
    } else {
      toast.error("Please fill in all required fields correctly")
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true)
      const uploadImage = await storage.createFile({
        bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
        fileId: Date.now().toString(),
        file: file,
        permissions: [Permission.read(Role.any())]
      })
      
      const imageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_BASE_URI}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${uploadImage.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
      setPreview(imageUrl)
      form.setValue("utility", imageUrl)
      setFileId(uploadImage.$id)
      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error('Error uploading image')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-[22px] font-bold flex items-center justify-center rounded-full w-[22px] ${
                      currentStep === i ? 'bg-[#27BA5F]' : 'bg-[#B3B9B6]'
                    } text-white`}
                  >
                    {i}
                  </div>
                ))}
              </div>
              <h2>Add Dispatch</h2>
            </div>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {currentStep === 1 && (
                    <div className="flex flex-col gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#03140A80] uppercase font-bold">
                              Dispatch Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="bg-[#F0F0F0] rounded-[12px]"
                                placeholder="Enter dispatch name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#03140A80] uppercase font-bold">
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="bg-[#F0F0F0] rounded-[12px]"
                                placeholder="Enter phone number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#03140A80] uppercase font-bold">
                              Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="bg-[#F0F0F0] rounded-[12px]"
                                placeholder="Enter dispatch address"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nextKin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#03140A80] uppercase font-bold">
                              Next of Kin
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="bg-[#F0F0F0] rounded-[12px]"
                                placeholder="Enter next of kin"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="flex flex-col gap-6">
                      <FormField
                        control={form.control}
                        name="nin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#03140A80] uppercase font-bold">
                              NIN
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="bg-[#F0F0F0] rounded-[12px]"
                                placeholder="Enter NIN"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="utility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#03140A80] uppercase font-bold">
                              Utility Bill
                            </FormLabel>
                            <FormControl>
                              <label className="bg-[#F0F0F0] cursor-pointer gap-4 text-[#27BA5F] font-bold rounded-[12px] h-[88px] flex flex-col items-center justify-center border border-dashed border-[#27BA5F]">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return

                                    if (file.size > 2 * 1024 * 1024) {
                                      toast.error("Image must be 2MB or less")
                                      return
                                    }

                                    await handleFileUpload(file)
                                  }}
                                />

                                {preview ? (
                                  <img
                                    src={preview}
                                    alt="Preview"
                                    className="h-[60px] w-full object-cover rounded-md"
                                  />
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

                      <div className="flex flex-col gap-4">
                        <h2 className="text-[#03140A80] uppercase font-bold">
                          Payment Information
                        </h2>

                        <FormField
                          control={form.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Name</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-[#F0F0F0] rounded-[12px]">
                                    <SelectValue placeholder="Select Bank" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-[#F0F0F0] rounded-[12px]">
                                  {banks.length > 0 ? (
                                    banks.map((bank) => (
                                      <SelectItem key={bank.id} value={bank.name}>
                                        {bank.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className="p-2 text-center">
                                      No banks found
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="accountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Number</FormLabel>
                              <FormControl>
                                <Input
                                  className="bg-[#F0F0F0] rounded-[12px]"
                                  placeholder="Enter account number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="flex flex-col gap-6">
                      <FormField
                        control={form.control}
                        name="vehicle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#03140A80] uppercase font-bold">
                              Vehicle Type
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex flex-col space-y-1"
                              >
                                {vehicleTypes.map((type) => (
                                  <div
                                    key={type.value}
                                    className="flex items-center space-x-2"
                                  >
                                    <RadioGroupItem
                                      value={type.value}
                                      id={`vehicle-${type.value}`}
                                    />
                                    <Label htmlFor={`vehicle-${type.value}`}>
                                      {type.label}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="plateNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#03140A80] uppercase font-bold">
                              Plate Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="bg-[#F0F0F0] rounded-[12px]"
                                placeholder="Enter plate number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#03140A80] uppercase font-bold">
                              Location
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-[#F0F0F0] w-full rounded-[12px]">
                                  <SelectValue placeholder="Select Location" className="w-full" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#F0F0F0] rounded-[12px] w-full max-h-60">
                                {locations.map((location) => (
                                  <SelectItem key={location} value={location}>
                                    {location}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="transportArea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#03140A80] uppercase font-bold">
                              Preferred Transport Area
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-1 gap-2"
                              >
                                {transportAreas.map((area) => (
                                  <div
                                    key={area.value}
                                    className="flex items-center space-x-2"
                                  >
                                    <RadioGroupItem
                                      value={area.value}
                                      id={`area-${area.value}`}
                                    />
                                    <Label htmlFor={`area-${area.value}`}>
                                      {area.label}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePreviousStep}
                        className="flex-1"
                      >
                        Previous
                      </Button>
                    )}

                    <Button
                      type={currentStep === 3 ? "submit" : "button"}
                      onClick={currentStep === 3 ? undefined : handleNextStep}
                      className={`flex-1 ${currentStep === 3 ? 'bg-[#27BA5F] hover:bg-[#1EA14B]' : ''}`}
                      disabled={isLoading}
                    >
                      {isLoading && currentStep === 3 ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {currentStep === 3
                        ? "Save Dispatch"
                        : "Next"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default OpenDispatch