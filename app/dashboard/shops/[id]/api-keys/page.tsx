import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { ChevronLeft, Store, Key } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ApiKeysList } from "@/components/shops/api-keys-list"
import { CreateApiKeyDialog } from "@/components/shops/create-api-key-dialog"
import { getShopById, getApiKeys } from "@/lib/actions/shops"

export default async function ShopApiKeysPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Získání dat e-shopu
  const { shop, error } = await getShopById(params.id)
  
  if (error || !shop) {
    notFound()
  }
  
  // Získání API klíčů
  const { apiKeys = [] } = await getApiKeys(shop.id)
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            asChild
          >
            <Link href="/dashboard/shops">
              <ChevronLeft className="h-4 w-4" />
              Zpět na seznam e-shopů
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{shop.name}</h1>
              <p className="text-muted-foreground mt-1">
                Správa API klíčů pro integraci s verifikačním systémem
              </p>
            </div>
          </div>
          
          <CreateApiKeyDialog shopId={shop.id} />
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <ApiKeysList apiKeys={apiKeys} shopId={shop.id} />
        </CardContent>
      </Card>
    </div>
  )
} 