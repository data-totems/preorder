"use client";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/zustand";

export function useLogout() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);

  return () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("buzzToken");
      localStorage.removeItem("lastSeenLeadsAt");
    }
    setUser(null);
    router.replace("/login");
  };
}
