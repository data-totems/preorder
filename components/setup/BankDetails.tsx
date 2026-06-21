import { z } from "zod"
import Link from "next/link"
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
import {Select,SelectContent,SelectItem, SelectTrigger,SelectValue,} from "@/components/ui/select"
import { useSetupStore } from "@/zustand"
import {  getAccountDetails, getAllbanks } from "@/actions/storage.actions"
import { toast } from "sonner"
import LoadingModal from "../shared/LoadingModal"
import { setupAccount } from "@/actions/auth.actions"


const formSchema = z.object({
 bankName: z.string(),
 accountNumber: z.string(),
})
const BankDetails = ({ isLoading, setIsLoading, banks}: {isLoading: boolean, setIsLoading: (value: boolean) => void, banks: FlutterwaveBank[]}) => {
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
        account_number: values.accountNumber ?? ""

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
    <div className='mt-4 '>
          <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#03140A80] uppercase font-bold">bank Name</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
     <SelectTrigger className="w-full bg-[#F0F0F0] rounded-[12px] max-w-lg">
    <SelectValue placeholder="Select Bank"  />
        </SelectTrigger>
  <SelectContent className="bg-[#F0F0F0] rounded-[12px] h-50 max-w-lg">
    {banks.length > 0 ? banks.map((bank, index) => (
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
                          <FormLabel className="text-[#03140A80] uppercase font-bold">account number</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-[#F0F0F0] rounded-[12px] max-w-lg" 
                              placeholder="Enter your account number" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {accountName && !verifying && verified && (
                      <div className="bg-[#27BA5F1F] w-fit h-fit text-[#27BA5F] rounded-[8px] p-1">
                      {accountName}
                    </div>
                    )}


                    {verified ?  
                     <Button 
                      type="submit" 
                      className="w-full bg-[#27BA5F] hover:bg-green-400"
                      disabled={ isLoading}
                    >
                      Next
                    </Button> : 
                      <Button 
                      type="button" 
                      className="w-full bg-[#27BA5F] hover:bg-green-400"
                      disabled={verifying}
                      onClick={handleVerifyAccount}
                    >
                      {verifying && <Loader2 className='animate-spin' />}
                      Verify{verifying && 'ing'} account
                    </Button>
                     }
                  </form>
                </Form>
    </div>
  )
}

export default BankDetails