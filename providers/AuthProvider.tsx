'use client'

import { getAccountProfile } from '@/actions/auth.actions'
import LoadingModal from '@/components/shared/LoadingModal'
import { useUserStore } from '@/zustand'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { toast } from 'sonner'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password']

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser} = useUserStore((state) => state)

  useEffect(() => {
    const getAuth = async () => {
      // ✅ allow public routes
      if (PUBLIC_ROUTES.includes(pathname)) {
        setIsLoading(false)
        return
      }

      const token = localStorage.getItem('buzzToken')

      if (!token) {
        setIsLoading(false)
        router.replace('/login')
        return
      }

      try {
        const user = await getAccountProfile();
        console.log("This is user", user.data)

        if(user.data) {
                setUser({
          fullName: user.data.full_name,
          phoneNumber: user.data.phone_number,
          imageUrl: user?.data.display_picture,
          storeLink: user?.data.store_link ?? "",

          bank_name: user?.data.bank_name,
          bank_account_number: user?.data.bank_account_number
        })
        console.log('User data:', user.data)

        setIsLoading(false)
        }
      } catch (error: any) {
        toast.error(`${error}`);
        console.log(error)
        if(error.response.data.detail === "No Profile matches the given query.") {
          toast.warning("Setup your profile to continue")
          router.push('/setup');

          setIsLoading(false)
        } else {
          setIsLoading(false)
        }
        // localStorage.removeItem('buzzToken')
        // router.replace('/login')
      }
    }

    getAuth()
  }, [pathname, router])

  if (isLoading) return <LoadingModal />

  return <>{children}</>
}

export default AuthProvider
