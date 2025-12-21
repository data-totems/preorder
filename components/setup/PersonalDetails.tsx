"use client"

import { z } from "zod"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ImageUploader from "./ImageUploader"
import { Textarea } from "../ui/textarea"
import { useSetupStore } from "@/zustand"


const formSchema = z.object({
 fullName: z.string(),
 imageUrl: z.string(),
 username: z.string(),
 phoneNumber: z.string(),
 address: z.string()
})

const PersonalDetails = ({ setCurrentStep }: { setCurrentStep: (value: number) => void}) => {
const { setStore } = useSetupStore((state) => state)

 const [isLoading, setIsLoading] = useState(false);
    const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      imageUrl: "",
      username: "",
      phoneNumber: "",
      address: ""
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setStore({
      fullName: values.fullName,
      address: values.address,
      username: values.username,
      phoneNumber: values.phoneNumber,
      imageUrl: values.imageUrl
    });


    setCurrentStep(2)

  }
  return (
    <div className='mt-4 '>
          <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#03140A80] uppercase font-bold">Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-[#F0F0F0] rounded-[12px] max-w-lg" 
                              placeholder="Enter your full name" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#03140A80] uppercase font-bold">Display picture</FormLabel>
                            <FormControl>
                             <ImageUploader value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
        
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#03140A80] uppercase font-bold">Create Username</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-[#F0F0F0] rounded-[12px] max-w-lg" 
                              placeholder="Create your username" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                      <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#03140A80] uppercase font-bold">phone number</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-[#F0F0F0] rounded-[12px] max-w-lg" 
                              placeholder="Create your phone number" 
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
                          <FormLabel className="text-[#03140A80] uppercase font-bold">address</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="bg-[#F0F0F0] rounded-[12px] max-w-lg" 
                              placeholder="Address" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
        
        
                    <Button 
                      type="submit" 
                      className="w-full bg-[#27BA5F] hover:bg-green-400"
                      disabled={ isLoading}
                    >
                        {isLoading && (<Loader2 className="animate-spin" />)}
                      Create{isLoading && 'ing'} account
                    </Button>
                  </form>
                </Form>
    </div>
  )
}

export default PersonalDetails