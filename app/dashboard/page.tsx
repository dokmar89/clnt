import type { Metadata } from "next"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Store,
  ShieldCheck,
  PlusCircle,
  FileText,
  Key,
  Settings,
  HelpCircle,
  LayoutDashboard
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentVerifications } from "@/components/recent-verifications"
import { WelcomeMessage } from "@/components/dashboard/welcome-message"
import { ActivityChart } from "@/components/dashboard/activity-chart"
import { TopUpWalletDialog } from "@/components/billing/top-up-wallet-dialog"
import { Badge } from "@/components/ui/badge"

import { getVerificationStats, getRecentVerifications } from "@/lib/actions/verification"
import { getWalletBalance } from "@/lib/actions/wallet"
import type { Database } from "@/lib/supabase/types"

export const metadata: Metadata = {
  title: "Dashboard | PassProve",
  description: "Přehled verifikačního systému"
}

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect("/auth/login")
  }
  
  // Načtení společnosti uživatele
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", session.user.id)
    .maybeSingle()
  
  if (companyError) {
    console.error("Error fetching company:", companyError)
  }
  
  // Načtení profilu uživatele
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single()
  
  if (profileError) {
    console.error("Error fetching profile:", profileError)
  }

  // Načtení e-shopů
  const { data: shops, error: shopsError } = await supabase
    .from("shops")
    .select("id, name, is_active")
    .eq("company_id", company?.id)
    .order("created_at", { ascending: false })
  
  if (shopsError) {
    console.error("Error fetching shops:", shopsError)
  }

  // Získat data pro dashboard
  const { stats } = await getVerificationStats()
  const { logs } = await getRecentVerifications(8)
  const { balance } = await getWalletBalance()

  // Výpočet statistik
  const successPercentage = stats?.total ? Math.round((stats.success / stats.total) * 100) : 0
  const failPercentage = stats?.total ? Math.round((stats.failed / stats.total) * 100) : 0
  const pendingCount = stats?.total ? (stats.total - stats.success - stats.failed) : 0

  // Data pro aktivitu (mock data)
  const activityData = [
    { date: "Po", value: 10 },
    { date: "Út", value: 15 },
    { date: "St", value: 20 },
    { date: "Čt", value: 25 },
    { date: "Pá", value: 18 },
    { date: "So", value: 8 },
    { date: "Ne", value: 5 },
  ]

  const pricingTier = company?.pricing_tier || "no_contract";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/billing/method-costs?pricing_tier=${pricingTier}`);
  const methodCosts = res.ok ? await res.json() : [];

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-8">
        {/* Horní sekce */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-primary">Dashboard</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      Vítejte, {profile?.full_name || company?.name || "uživateli"}
                    </h1>
                    <p className="text-muted-foreground mt-1 max-w-md">
                      Zde vidíte přehled vašich verifikací, statistik a stavu vašeho účtu.
                    </p>
                    
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">
                        <TrendingUp className="h-3 w-3" />
                        <span>+12% oproti předchozímu týdnu</span>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Statistiky
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col gap-4 justify-end">
                    <div className="text-right">
                      <div className="text-muted-foreground text-sm">Dnes</div>
                      <div className="text-2xl font-bold">{new Date().toLocaleDateString('cs-CZ')}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Kredit
              </CardTitle>
              <CardDescription>Dostupný zůstatek na vašem účtu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-2">
                <div className="text-4xl font-bold">
                  {new Intl.NumberFormat('cs-CZ', { 
                    style: 'currency', 
                    currency: 'CZK',
                    maximumFractionDigits: 0 
                  }).format(balance || 0)}
                </div>
                <div className="text-sm text-muted-foreground mt-1 mb-2">
                  pro verifikace
                </div>
                <div className="w-full mt-2">
                  <Link href="/dashboard/billing">
                    <Button variant="outline" className="w-full gap-1">
                      <CreditCard className="h-4 w-4" />
                      Dobít kredit
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metriky rychlý přehled */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Celkem verifikací</span>
                  <div className="text-3xl font-bold">{stats?.total || 0}</div>
                  <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>+12% tento týden</span>
                  </div>
                </div>
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Úspěšných</span>
                  <div className="text-3xl font-bold">{stats?.success || 0}</div>
                  <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>{successPercentage}% úspěšnost</span>
                  </div>
                </div>
                <div className="bg-green-500/10 p-2 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Neúspěšných</span>
                  <div className="text-3xl font-bold">{stats?.failed || 0}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span>{failPercentage}% neúspěšnost</span>
                  </div>
                </div>
                <div className="bg-red-500/10 p-2 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Čekajících</span>
                  <div className="text-3xl font-bold">{pendingCount}</div>
                  <div className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                    <Clock className="h-4 w-4" />
                    <span>Čeká na dokončení</span>
                  </div>
                </div>
                <div className="bg-amber-500/10 p-2 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hlavní obsah Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Levý sloupec (2/3 šířky na velkých obrazovkách) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Poslední verifikace */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Poslední aktivity
                    </CardTitle>
                    <CardDescription>
                      Přehled nedávných aktivit v systému
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RecentVerifications logs={logs || []} />
              </CardContent>
            </Card>
          </div>

          {/* Pravý sloupec (1/3 šířky) */}
          <div className="space-y-6">
            {/* E-shopy */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Vaše e-shopy
                  </CardTitle>
                  <Link href="/dashboard/shops">
                    <Button variant="ghost" size="sm">
                      Spravovat
                    </Button>
                  </Link>
                </div>
                <CardDescription>Napojené e-shopy a jejich stav</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {shops && shops.length > 0 ? (
                  <div className="space-y-3">
                    {shops.slice(0, 3).map((shop) => (
                      <div key={shop.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded">
                            <Store className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{shop.name}</div>
                            <div className="text-xs text-muted-foreground">ID: {shop.id.slice(0, 8)}</div>
                          </div>
                        </div>
                        <Badge variant={shop.is_active ? "default" : "secondary"}>
                          {shop.is_active ? "Aktivní" : "Neaktivní"}
                        </Badge>
                      </div>
                    ))}
                    {shops.length > 3 && (
                      <div className="text-center pt-2">
                        <Link href="/dashboard/shops">
                          <Button variant="ghost" size="sm">
                            Zobrazit všech {shops.length} e-shopů
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Store className="h-12 w-12 text-muted-foreground mb-3 mx-auto" />
                    <h3 className="font-medium mb-1">Zatím nemáte žádné e-shopy</h3>
                    <p className="text-sm text-muted-foreground mb-4">Přidejte svůj první e-shop pro zahájení verifikace</p>
                    <Link href="/dashboard/shops/new">
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Přidat e-shop
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rychlé odkazy */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Rychlé odkazy
                </CardTitle>
                <CardDescription>Přímý přístup k častým funkcím</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/dashboard/shops/new">
                    <Button variant="outline" className="w-full justify-start">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Nový e-shop
                    </Button>
                  </Link>
                  <Link href="/dashboard/api-keys">
                    <Button variant="outline" className="w-full justify-start">
                      <Key className="h-4 w-4 mr-2" />
                      API klíče
                    </Button>
                  </Link>
                  <Link href="/dashboard/billing">
                    <Button variant="outline" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Dobít kredit
                    </Button>
                  </Link>
                  <Link href="/dashboard/account">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Nastavení
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Aktuální ceny za ověření</CardTitle>
            <CardDescription>
              Ceny platné pro váš tarif: <b>{pricingTier}</b>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {methodCosts.length === 0 ? (
              <div className="text-muted-foreground">Ceník není k dispozici.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2">Metoda</th>
                    <th className="text-right py-2">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  {methodCosts.map((c: any) => (
                    <tr key={c.method_code}>
                      <td className="py-1">{c.method_code}</td>
                      <td className="py-1 text-right">{Number(c.cost).toLocaleString("cs-CZ")} Kč</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}