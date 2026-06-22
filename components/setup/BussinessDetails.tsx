"use client"

import { z } from "zod"
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
import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Label } from "@/components/ui/label"
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <Card variant="flat" className="p-6 gap-6">
          <Eyebrow className="block">STORE IDENTITY</Eyebrow>

          <FormField
            control={form.control}
            name="bussinessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your business name"
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

          <div className="flex flex-col gap-2">
            <Label>Your store link</Label>
            <SlugInput
              value={slug}
              onChange={handleSlugChange}
              onAvailability={handleAvailability}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Business description"
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
                <FormLabel>Business Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your business email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <div className="fixed left-0 right-0 bottom-0 bg-paper/95 backdrop-blur border-t border-border py-4 px-6 z-30">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <Button type="button" variant="ghost" onClick={() => setCurrentStep(1)}>Back</Button>
            <Button type="submit" disabled={isLoading || slugAvailable !== true}>Continue →</Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default BussinessDetails
