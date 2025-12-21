"use client"

import { z } from "zod"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { loginUser } from "@/actions/auth.actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"


const formSchema = z.object({
  email: z.string().email(),
  password: z.string()
})
const Login = () => {
const [isLoading, setIsLoading] = useState(false)
const router = useRouter();
     const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  })
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
      setIsLoading(true)
      try {
          const response = await loginUser({
              email: values.email,
              password: values.password,
          });  
          if(response.status === 200) {
              toast.success("Logged In")
              localStorage.setItem('buzzToken', response.data.tokens.access);

              router.push('/')
          }
      } catch (error) {
          toast.error(`${error}`)
      }finally{
          setIsLoading(false)
      }
    }
  
  return (
    <div>

        <div className=" flex flex-col gap-1 ">
            <h2 className="font-bold text-2xl ">Login to your account</h2>
            <h1 className="font-semibold text-[#03140A80] text-sm ">
                Don&apos;t have an account?  <Link href={'/register'} className="text-[#27BA5F]">Create account</Link>
            </h1>
        </div>

        <div className="mt-12 ">
              <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#03140A80] uppercase font-bold ">Email</FormLabel>
              <FormControl>
                <Input className="bg-[#F0F0F0] rounded-[12px] max-w-lg  " placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="">
             <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#03140A80] uppercase font-bold ">Password</FormLabel>
              <FormControl>
                <Input className="bg-[#F0F0F0] rounded-[12px] max-w-lg" placeholder="Enter your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Link className="text-[#27BA5F] hover:underline text-sm font-semibold flex flex-col justify-end items-end max-w-lg mt-3 " href={'/forgot-password'}>Forgot password?</Link>
        </div>

          
        <Button type="submit" className="w-full bg-[#27BA5F] hover:bg-green-400 " disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Login"}
        </Button>
      </form>
    </Form>
        </div>
    </div>
  )
}

export default Login