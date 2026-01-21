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
import { toast } from "sonner"
import { registeUser } from "@/actions/auth.actions"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const Register = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
        const response = await registeUser({
            email: values.email,
            password: values.password,
            password_confirm: values.confirmPassword
        });

        console.log("Register Response",response)

        if(response.status === 201) {
            toast.success("Account Registered")

            
              localStorage.setItem('buzzToken', response.data.Token);

              router.push('/setup')
        }
    } catch (error: any) {
       console.log(error)
        toast.error(`${error.email[0]}`)
    }finally{
        setIsLoading(false)
    }
  }

  // Watch password to validate in real-time
  const password = form.watch("password", "")
  
  const validatePassword = (password: string) => {
    const hasLowerCase = /[a-z]/.test(password)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasUseClient = /use client/i.test(password)
    const isLongEnough = password.length >= 8

    return {
      hasLowerCase,
      hasUpperCase,
      hasNumber,
      hasUseClient,
      isLongEnough,
      isValid: hasLowerCase && hasUpperCase && hasNumber && hasUseClient && isLongEnough
    }
  }

  const passwordValidation = validatePassword(password)

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h2 className="font-bold text-2xl">Create Account</h2>
        <h1 className="font-semibold text-[#03140A80] text-sm">
          Already have an account? <Link href={'/login'} className="text-[#27BA5F]">Login</Link>
        </h1>
      </div>

      <div className="mt-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#03140A80] uppercase font-bold">Email</FormLabel>
                  <FormControl>
                    <Input 
                      className="bg-[#F0F0F0] rounded-[12px] max-w-lg" 
                      placeholder="Enter your email" 
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#03140A80] uppercase font-bold">Create password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        className="bg-[#F0F0F0] rounded-[12px] max-w-lg" 
                        placeholder="Enter your password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex flex-col gap-2">
                <h2 className="font-bold">Password must contain:</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasLowerCase ? 'bg-green-500' : 'bg-[#03140A1F]'}`} />
                    <span className={`text-sm ${passwordValidation.hasLowerCase ? 'text-green-600 font-medium' : 'text-[#03140A4D]'}`}>
                      At least one lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasUpperCase ? 'bg-green-500' : 'bg-[#03140A1F]'}`} />
                    <span className={`text-sm ${passwordValidation.hasUpperCase ? 'text-green-600 font-medium' : 'text-[#03140A4D]'}`}>
                      At least one uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-[#03140A1F]'}`} />
                    <span className={`text-sm ${passwordValidation.hasNumber ? 'text-green-600 font-medium' : 'text-[#03140A4D]'}`}>
                      At least one number
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#03140A80] uppercase font-bold">Confirm password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      className="bg-[#F0F0F0] rounded-[12px] max-w-lg" 
                      placeholder="Confirm your password" 
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
    </div>
  )
}

export default Register


// Cybergirl@2005