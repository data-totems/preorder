"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import type { FlutterwaveBank } from "@/types/api"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { useSetupStore } from "@/zustand"
import { getAccountDetails } from "@/actions/storage.actions"
import { toast } from "sonner"
import { setupAccount } from "@/actions/auth.actions"


const formSchema = z.object({
 bankName: z.string(),
 accountNumber: z.string(),
})
const BankDetails = ({ isLoading, setIsLoading, banks, setCurrentStep }: { isLoading: boolean, setIsLoading: (value: boolean) => void, banks: FlutterwaveBank[], setCurrentStep: (value: number) => void }) => {
const { setStore, store } = useSetupStore((state) => state);
const [verified, setVerified] = useState(false);

const [verifying, setVerfying] = useState(false);
const [accountName, setAccountName] = useState("")


    const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
     bankName: "",
     accountNumber: ""
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setStore({
      ...store,
      bankName: values.bankName,
      accountNumber: values.accountNumber
    });

    setIsLoading(true);

    try {
      const response = await setupAccount({
        fullName: store?.fullName ?? "",
        username: store?.username ?? "",
        phone_number: store?.phoneNumber ?? "",
        address: store?.address ?? "",
        display_picture: store?.imageUrl ?? "",
        business_description: store?.description ?? "",
        business_email: store?.email ?? "",
        business_name: store?.businessName ?? "",
        bank_name: values.bankName ?? "",
        account_number: values.accountNumber ?? "",
        store_slug: store?.storeSlug

      });

      if(response.status === 200) {
        router.refresh();


        router.replace('/')
      }
    } catch (error: any) {
      const data = error?.response?.data;
      const msg = data?.detail ?? data?.message ?? (typeof data === "string" ? data : null) ?? error?.message ?? "Account setup failed.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }

  }

  const handleVerifyAccount = async () => {
    setVerfying(true)
    try {
      const selectedBank = form.getValues("bankName")
      const accountNumber = form.getValues("accountNumber");

      const bankCode = banks?.find(bank => bank.name === selectedBank)?.code;
      if (!bankCode) {
        toast.error("Please select a bank.")
        return
      }

      const response = await getAccountDetails({
        bankCode,
        accountNumber: accountNumber
      });

      setVerified(true)
      setAccountName(response.data.account_name)
    } catch (error: any) {
      const data = error?.response?.data;
      const msg = data?.detail ?? data?.message ?? error?.message ?? "Could not verify account.";
      toast.error(msg)
    } finally {
      setVerfying(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <Card variant="flat" className="p-6 gap-6">
          <Eyebrow className="block">BANK DETAILS</Eyebrow>

          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Bank" />
                    </SelectTrigger>
                    <SelectContent className="h-60">
                      {banks.length > 0 ? banks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.name}>{bank.name}</SelectItem>
                      )) : (
                        <h2>No bank found.</h2>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your account number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {accountName && !verifying && verified && (
            <div className="bg-forest-100 text-forest-700 rounded-md px-3 py-2 w-fit text-sm font-medium">
              {accountName}
            </div>
          )}

          {!verified && (
            <Button
              type="button"
              variant="outline"
              disabled={verifying}
              onClick={handleVerifyAccount}
            >
              {verifying && <Loader2 className='animate-spin' />}
              Verify{verifying && 'ing'} account
            </Button>
          )}
        </Card>

        <div className="fixed left-0 right-0 bottom-0 bg-paper/95 backdrop-blur border-t border-border py-4 px-6 z-30">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <Button type="button" variant="ghost" onClick={() => setCurrentStep(2)}>Back</Button>
            <Button type="submit" disabled={isLoading || !verified}>Finish setup</Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default BankDetails
