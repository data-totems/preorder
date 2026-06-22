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
import { useState } from "react"
import { useRouter } from "next/navigation"
import ImageUploader from "./ImageUploader"
import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { useSetupStore } from "@/zustand"

import GooglePlacesAutocomplete from 'react-google-places-autocomplete';


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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <Card variant="flat" className="p-6 gap-6">
          <Eyebrow className="block">PERSONAL DETAILS</Eyebrow>

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
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
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display picture</FormLabel>
                <FormControl>
                  <ImageUploader value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Create Username</FormLabel>
                <FormControl>
                  <Input
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
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your phone number"
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
                <FormLabel>Address</FormLabel>
                <FormControl>
                  {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                  <GooglePlacesAutocomplete
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                    selectProps={{
                      onChange: (value: any) => {
                        field.onChange(value?.label || "");
                      },
                      onBlur: field.onBlur,
                      placeholder: "Enter your address",
                      styles: {
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
                      className: "max-w-lg",
                    }}
                    autocompletionRequest={{
                      componentRestrictions: {
                        country: ['ng'],
                      },
                      types: ['address'],
                    }}
                  />
                  ) : (
                    <Input
                      placeholder="Enter your address"
                      {...field}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <div className="fixed left-0 right-0 bottom-0 bg-paper/95 backdrop-blur border-t border-border py-4 px-6 z-30">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div />
            <Button type="submit" disabled={isLoading}>Continue →</Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default PersonalDetails
