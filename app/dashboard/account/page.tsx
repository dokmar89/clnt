import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { Building2, Users, FileText, CreditCard } from "lucide-react"

import { AccountForm } from "@/components/account/account-form"
import { UserAccessManagement } from "@/components/account/user-access-management"
import { CompanyBilling } from "@/components/account/company-billing"
import { CompanyDocuments } from "@/components/account/company-documents"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Database } from "@/lib/supabase/types"

export default async function AccountPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch company data
  const { data: { user } } = await supabase.auth.getUser()
  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user?.id)
    .maybeSingle()

  if (!company) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Účet nenalezen</h2>
          <p className="text-muted-foreground">Nemáte přístup k firemnímu účtu</p>
        </div>
      </div>
    )
  }

  // Fetch price list for the company
  const { data: pricingInfo } = await supabase
    .from("price_list")
    .select("*")
    .eq("pricing_tier", company.pricing_tier)
    .single()

  // Fetch company documents
  const { data: documents } = await supabase
    .from("company_documents")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <Tabs defaultValue="company" className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Účet a nastavení</h1>
            <p className="text-muted-foreground mt-1">
              Správa účtu, společnosti, uživatelů a dokumentů
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Údaje o společnosti
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Cenový tarif
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dokumenty
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Správa oprávnění
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="company">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Údaje o společnosti</CardTitle>
                <CardDescription>
                  Základní informace o vaší společnosti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccountForm company={company} readOnly={true} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Cenový tarif a nastavení</CardTitle>
              <CardDescription>
                Informace o vašem aktuálním cenovém tarifu a cenách služeb
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyBilling company={company} pricingInfo={pricingInfo} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Dokumenty a smlouvy</CardTitle>
              <CardDescription>
                Smluvní dokumentace a podmínky používání
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyDocuments company={company} documents={documents || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="pt-6">
              <UserAccessManagement companyId={company.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
