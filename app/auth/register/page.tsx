import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

import { RegistrationSteps } from "@/components/auth/registration-steps"
import type { Database } from "@/lib/supabase/types"

export const metadata: Metadata = {
  title: "Registrace",
  description: "Registrace nové společnosti",
}

export default async function RegisterPage() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    redirect("/dashboard")
  }
  
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Registrace do platformy PassProve</h1>
          <p className="text-sm text-muted-foreground">Jdete do toho s námi? Výborně. Stačí vyplnit podstatné informace a do 24 hodin váš účet aktivujeme.</p>
        </div>
        <RegistrationSteps />
      </div>
    </div>
  )
}
