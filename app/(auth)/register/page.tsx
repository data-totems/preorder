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
import { Eyebrow } from "@/components/ui/eyebrow"

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

        if(response.status === 201) {
            toast.success("Account Registered")


              localStorage.setItem('buzzToken', response.data.Token);

              router.push('/setup')
        }
    } catch (error: any) {
        const msg = error?.email?.[0] || error?.detail || 'Registration failed. Please try again.'
        toast.error(msg)
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
    const isLongEnough = password.length >= 8

    return {
      hasLowerCase,
      hasUpperCase,
      hasNumber,
      isLongEnough,
      isValid: hasLowerCase && hasUpperCase && hasNumber && isLongEnough
    }
  }

  const passwordValidation = validatePassword(password)

  return (
    <div className="flex-1 grid lg:grid-cols-2">
      <section className="px-6 md:px-12 py-12 md:py-20 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Eyebrow className="block mb-3">GET STARTED</Eyebrow>
          <h1 className="text-[44px] leading-[52px] font-bold tracking-[-0.02em] text-foreground">Create your store</h1>
          <p className="mt-3 text-[17px] leading-[26px] text-muted-foreground">
            Start selling in minutes.
          </p>

          <div className="mt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
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
                        <FormLabel>Create password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex flex-col gap-2">
                    <h2 className="font-semibold text-sm text-foreground">Password must contain:</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${passwordValidation.hasLowerCase ? 'bg-forest-500' : 'bg-ink-200'}`} />
                        <span className={`text-sm ${passwordValidation.hasLowerCase ? 'text-forest-500 font-medium' : 'text-ink-500'}`}>
                          At least one lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${passwordValidation.hasUpperCase ? 'bg-forest-500' : 'bg-ink-200'}`} />
                        <span className={`text-sm ${passwordValidation.hasUpperCase ? 'text-forest-500 font-medium' : 'text-ink-500'}`}>
                          At least one uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${passwordValidation.hasNumber ? 'bg-forest-500' : 'bg-ink-200'}`} />
                        <span className={`text-sm ${passwordValidation.hasNumber ? 'text-forest-500 font-medium' : 'text-ink-500'}`}>
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
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
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
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && (<Loader2 className="animate-spin" />)}
                  Create{isLoading && 'ing'} account
                </Button>
              </form>
            </Form>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[12px] text-ink-500">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <p className="mt-6 text-[14px] text-ink-500">
            Already have an account?{" "}
            <Link href="/login" className="text-forest-500 font-semibold hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      <aside className="hidden lg:flex bg-forest-700 text-forest-50 p-12 flex-col justify-end min-h-[calc(100vh-4rem)]">
        <Eyebrow tone="accent" className="block text-forest-400 mb-4">BUZZMART</Eyebrow>
        <h2 className="text-[56px] leading-[64px] font-bold tracking-[-0.02em] text-white">
          Sell more,<br />stress less.
        </h2>
        <p className="mt-6 text-[17px] leading-[26px] text-forest-50/80 max-w-md">
          Shareable storefronts, lead capture, orders via WhatsApp. Everything your store needs in one place.
        </p>
      </aside>
    </div>
  )
}

export default Register
