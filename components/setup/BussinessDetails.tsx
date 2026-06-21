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
import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "../ui/textarea"
import { useSetupStore } from "@/zustand"
import SlugInput from "@/components/slug/SlugInput"


const formSchema = z.object({
 email: z.string(),
 bussinessName: z.string(),
 description: z.string()
})

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const BussinessDetails = ({ setCurrentStep }: { setCurrentStep: (value: number) => void}) => {
const { setStore, store } = useSetupStore((state) => state)

 const [isLoading, setIsLoading] = useState(false);
 const [slug, setSlug] = useState<string>(store?.storeSlug ?? "");
 const [slugManuallyEdited, setSlugManuallyEdited] = useState<boolean>(
   Boolean(store?.storeSlug)
 );
 const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
     email: "",
     bussinessName: "",
     description: ""
    },
  })

  const handleBusinessNameChange = (val: string, onFieldChange: (v: string) => void) => {
    onFieldChange(val);
    if (!slugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (s: string) => {
    setSlug(s);
    setSlugManuallyEdited(true);
  };

  const handleAvailability = useCallback((available: boolean | null) => {
    setSlugAvailable(available);
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setStore({
      ...store,
      email: values.email,
      description: values.description,
      businessName: values.bussinessName,
      storeSlug: slug,
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
                              onChange={(e) =>
                                handleBusinessNameChange(e.target.value, field.onChange)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <label className="text-[#03140A80] uppercase font-bold text-sm">
                        Your store link
                      </label>
                      <div className="mt-2">
                        <SlugInput
                          value={slug}
                          onChange={handleSlugChange}
                          onAvailability={handleAvailability}
                        />
                      </div>
                    </div>

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
                      disabled={isLoading || slugAvailable !== true}
                    >
                      Next
                    </Button>
                  </form>
                </Form>
    </div>
  )
}

export default BussinessDetails
