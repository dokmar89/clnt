import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import Image from "next/image"

import { ThemeProvider } from "@/components/theme-provider"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: 'PassProve - Ověření věku pro váš e-shop',
  description: 'Jednoduché a spolehlivé řešení pro ověření věku vašich zákazníků.',
  generator: 'PassProve'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <head>
        <title>PassProve</title>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Image 
            src="/Logo_PassProve_cerna.svg" 
            alt="PassProve Logo" 
            width={200} 
            height={50} 
            priority={true}
            className="hidden dark:hidden"
          />
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
