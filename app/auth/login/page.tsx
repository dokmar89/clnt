import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

import { LoginForm } from "@/components/auth/login-form"
import type { Database } from "@/lib/supabase/types"

export default async function LoginPage() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    redirect("/dashboard")
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-background">
      <div className="w-full max-w-md mx-auto px-8">
        <div className="flex flex-col space-y-2 text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Přihlášení
          </h1>
          <p className="text-sm text-muted-foreground">
            Zadejte své přihlašovací údaje
          </p>
        </div>
        <LoginForm />
        <div className="mt-4 text-center text-sm">
          Nemáte účet?{" "}
          <Link href="/auth/register" className="underline underline-offset-4 hover:text-primary">
            Registrace
          </Link>
        </div>
      </div>
    </div>
  )
} 