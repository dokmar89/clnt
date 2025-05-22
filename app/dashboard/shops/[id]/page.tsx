import type { Metadata } from "next"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Store, Globe, CalendarClock, PackageOpen, ShoppingCart, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ApiKeysManager } from "@/components/shops/api-keys-manager"
import { ShopActivityLogs } from "@/components/shops/shop-activity-logs"
import { ShopStatusToggle } from "@/components/shops/shop-status-toggle"
import { ShopSettingsForm } from "@/components/shops/shop-settings-form"
import { getShopById, getApiKeys } from "@/lib/actions/shops"
import { formatDistanceToNow, format } from "date-fns"
import { cs } from "date-fns/locale"

// Mapování sektorů na uživatelsky přívětivé názvy
const SECTOR_LABELS: Record<string, string> = {
  "pyrotechnika": "Pyrotechnika",
  "alkohol": "Alkohol",
  "tabak": "Tabák a tabákové výrobky",
  "chemie": "Chemie a chemické látky",
  "zbrane": "Zbraně a střelivo",
  "erotika": "Erotika",
  "gambling": "Sázky a gambling",
  "ostatni": "Ostatní věkem omezené zboží"
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { shop } = await getShopById(params.id)
  
  return {
    title: shop?.name ? `${shop.name} | PassProve` : "Detail obchodu | PassProve",
    description: "Správa obchodu pro verifikační systém"
  }
}

export default async function ShopDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  const { shop, error } = await getShopById(params.id)

  if (error || !shop) {
    notFound()
  }

  const { apiKeys = [] } = await getApiKeys(shop.id)
  
  const { data: logs = [] } = await supabase
    .from("shop_logs")
    .select("*")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false })
    .limit(50)
  
  const { count: verificationsCount } = await supabase
    .from("verifications")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shop.id)

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
              Zpět na seznam
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
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={shop.is_active ? "default" : "secondary"}>
                  {shop.is_active ? "Aktivní" : "Pozastaven"}
                </Badge>
                {shop.sector && (
                  <Badge variant="outline" className="text-xs">
                    {SECTOR_LABELS[shop.sector] || shop.sector}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <ShopStatusToggle 
            shopId={shop.id} 
            isActive={shop.is_active} 
            shopName={shop.name} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Informace o obchodu</CardTitle>
            <CardDescription>Základní informace o vašem obchodu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shop.description && (
                <div className="text-muted-foreground">
                  {shop.description}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shop.url && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={shop.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm hover:underline text-primary"
                    >
                      {shop.url}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Vytvořeno {format(new Date(shop.created_at), "d. MMMM yyyy", { locale: cs })}
                  </span>
                </div>
                {shop.sector && (
                  <div className="flex items-center gap-2">
                    <PackageOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Sektor: {SECTOR_LABELS[shop.sector] || shop.sector}
                    </span>
                  </div>
                )}
                {verificationsCount !== null && (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Celkem verifikací: {verificationsCount || 0}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>API přehled</CardTitle>
            <CardDescription>Stav API klíčů a připojení</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {apiKeys.filter(key => key.is_active).length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Aktivní klíče</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {verificationsCount || 0}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Verifikací celkem</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Poslední aktivita</h3>
                {logs.length > 0 ? (
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(logs[0].created_at), { 
                      addSuffix: true,
                      locale: cs
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Zatím žádná aktivita
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="api-keys" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            API klíče
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1">
            <CalendarClock className="h-4 w-4" />
            Historie aktivit
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Nastavení
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-keys">
          <ApiKeysManager shopId={shop.id} apiKeys={apiKeys} />
        </TabsContent>
        
        <TabsContent value="activity">
          <ShopActivityLogs shopId={shop.id} logs={logs} />
        </TabsContent>
        
        <TabsContent value="settings">
          <ShopSettingsForm shop={shop} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
