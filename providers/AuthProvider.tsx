'use client'

import { getAccountProfile } from '@/actions/auth.actions'
import LoadingModal from '@/components/shared/LoadingModal'
import { useUserStore } from '@/zustand'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { toast } from 'sonner'

// Routes matched as prefixes — anything under /store, /p, /s is public.
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/store', '/p', '/s']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser} = useUserStore((state) => state)

  useEffect(() => {
    const getAuth = async () => {
      // ✅ allow public routes
      if (isPublicPath(pathname)) {
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

        if(user.data) {
                setUser({
          fullName: user.data.full_name,
          phoneNumber: user.data.phone_number,
          imageUrl: user?.data.display_picture,
          storeLink: user?.data.store_link ?? "",

          bank_name: user?.data.bank_name,
          bank_account_number: user?.data.bank_account_number,
          address: user.data.address,

          business_name: user?.data.business_name
        })

        setIsLoading(false)
        }
      } catch (error: any) {
        const status = error?.response?.status;
        const data = error?.response?.data;
        if (status === 401) {
          toast.error("Your session has expired. Please log in again.");
          router.replace('/login');
          return;
        }
        // Backend returns 404 + { error: "Profile not found for this user" }
        // when the merchant hasn't completed /setup. Legacy backends returned
        // { detail: "No Profile matches the given query." } — handle both.
        const isProfileMissing =
          status === 404 ||
          data?.error === "Profile not found for this user" ||
          data?.detail === "No Profile matches the given query.";
        if (isProfileMissing) {
          toast.warning("Setup your profile to continue")
          router.push('/setup');
          setIsLoading(false)
        } else {
          toast.error(data?.detail ?? data?.error ?? data?.message ?? error?.message ?? "Could not load your profile.");
          setIsLoading(false)
        }
      }
    }

    getAuth()
  }, [pathname, router])

  if (isLoading) return <LoadingModal />

  return <>{children}</>
}

export default AuthProvider
