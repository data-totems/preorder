import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/providers/AuthProvider";



export const metadata: Metadata = {
  title: "Preorder",
  description: "preorder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <html lang="en">
      <body
        className={ `antialiased`}
      >
        <AuthProvider>
        {children}
        <Toaster  />
         </AuthProvider>
      </body>
    </html>
   
  );
}
