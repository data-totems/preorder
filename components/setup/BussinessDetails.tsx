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
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "../ui/textarea"
import { useSetupStore } from "@/zustand"


const formSchema = z.object({
 email: z.string(),
 bussinessName: z.string(),
 description: z.string()
})

const BussinessDetails = ({ setCurrentStep }: { setCurrentStep: (value: number) => void}) => {
const { setStore, store } = useSetupStore((state) => state)

 const [isLoading, setIsLoading] = useState(false);
    const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
     email: "",
     bussinessName: "",
     description: ""
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setStore({
      ...store,
      email: values.email,
      description: values.description,
      businessName: values.bussinessName
    });


    setCurrentStep(3)

  }
  return (
    <div className='mt-4 '>
          <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="bussinessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#03140A80] uppercase font-bold">Business Name</FormLabel>
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

                      <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#03140A80] uppercase font-bold">business description</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="bg-[#F0F0F0] rounded-[12px] max-w-lg" 
                              placeholder="business description" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />



                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#03140A80] uppercase font-bold">Business Email</FormLabel>
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
        
        
                    <Button 
                      type="submit" 
                      className="w-full bg-[#27BA5F] hover:bg-green-400"
                      disabled={ isLoading}
                    >
                      Next
                    </Button>
                  </form>
                </Form>
    </div>
  )
}

export default BussinessDetails