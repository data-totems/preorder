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
import { Eyebrow } from "@/components/ui/eyebrow"
import LoginHeroAnimation from "@/components/auth/LoginHeroAnimation"


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

              const setupComplete = response.data.user_details?.setup_complete;
              router.push(setupComplete ? '/' : '/setup');
          }
      } catch (error: any) {
        const data = error?.response?.data;
        const msg = data?.detail ?? data?.message ?? error?.message ?? "Login failed. Please try again.";
        toast.error(msg);
      }finally{
          setIsLoading(false)
      }
    }

  return (
    <div className="flex-1 grid lg:grid-cols-2">
      <section className="px-6 md:px-12 py-12 md:py-20 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Eyebrow className="block mb-3">SIGN IN</Eyebrow>
          <h1 className="text-[44px] leading-[52px] font-bold tracking-[-0.02em] text-foreground">Welcome back</h1>
          <p className="mt-3 text-[17px] leading-[26px] text-muted-foreground">
            Sign in to manage your store and respond to your customers.
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
                        <Input placeholder="Enter your email" {...field} />
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end mt-2">
                    <Link className="text-forest-500 hover:underline text-sm font-semibold" href={'/forgot-password'}>
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "Login"}
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
            New here?{" "}
            <Link href="/register" className="text-forest-500 font-semibold hover:underline underline-offset-4">
              Create account
            </Link>
          </p>
        </div>
      </section>

      <aside className="hidden lg:flex bg-forest-700 text-forest-50 p-12 flex-col justify-between gap-8 min-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <LoginHeroAnimation />
        </div>
        <div>
          <Eyebrow tone="accent" className="block text-forest-400 mb-4">BUZZMART</Eyebrow>
          <h2 className="text-[56px] leading-[64px] font-bold tracking-[-0.02em] text-white">
            Sell more,<br />stress less.
          </h2>
          <p className="mt-6 text-[17px] leading-[26px] text-forest-50/80 max-w-md">
            Shareable storefronts, lead capture, orders via WhatsApp. Everything your store needs in one place.
          </p>
        </div>
      </aside>
    </div>
  )
}

export default Login
