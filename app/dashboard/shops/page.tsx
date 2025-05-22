// rework/app/dashboard/shops/page.tsx
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ShopsTable } from "@/components/shops/shops-table"
import { AddShopDialog } from "@/components/shops/add-shop-dialog"
import { getCompany } from "@/lib/actions/companies"
import { getShopsByCompanyId } from "@/lib/actions/shops"

export const metadata: Metadata = {
  title: "Správa e-shopů | PassProve",
  description: "Správa e-shopů pro verifikační systém"
}

export default async function ShopsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Získání aktivní společnosti
  const { company, error: companyError } = await getCompany()
  
  if (companyError || !company) {
    return (
      <div className="container py-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <h2 className="font-medium mb-2">Nemáte přístup k žádné aktivní společnosti</h2>
          <p>Pro správu e-shopů je nutné mít aktivní společnost.</p>
        </div>
      </div>
    )
  }
  
  // Získání e-shopů pro společnost
  const { shops, error: shopsError } = await getShopsByCompanyId(company.id)

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">E-shopy</h1>
          <p className="text-muted-foreground mt-1">
            Správa e-shopů pro integraci verifikačního systému
          </p>
        </div>
        <AddShopDialog companyId={company.id} />
      </div>

      <ShopsTable shops={shops || []} companyId={company.id} />
    </div>
  )
}