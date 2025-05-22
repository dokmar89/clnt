import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { CreditCard, Download, FileText, Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TopUpCreditForm } from "@/components/billing/top-up-credit-form"
import PricingPlanChange from "@/components/billing/PricingPlanChange" // <-- Import komponenty
import { getWalletBalance, getWalletTransactions } from "@/lib/actions/wallet"
import type { Database } from "@/lib/supabase/types"

export default async function BillingPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Načtení informací o společnosti
  const { data: company } = await supabase
    .from("companies")
    .select("*, pricing_tier") // Ujistěte se, že načítáte i pricing_tier
    .eq("owner_id", session.user.id)
    .maybeSingle()

  // Načtení transakcí
  const { transactions = [], error: transactionsError } = await getWalletTransactions(10)
  
  // Načtení aktuálního zůstatku
  const { balance = 0, error: balanceError } = await getWalletBalance()
  
  // Načtení faktur (pokud existují v databázi)
  // Faktury by měly být propojeny s transakcemi
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("company_id", company?.id || "")
    .order("created_at", { ascending: false })
    
  // Použijeme skutečná data, a pokud nejsou k dispozici, použijeme prázdné pole
  const companyInvoices = invoices || []

  // Určení aktuálního tarifu pro PricingPlanChange komponentu
  const currentPricingTier = company?.pricing_tier === 'contract' ? 'contract' : 'no_contract';
  
  // Po načtení session:
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("user_id", session.user.id)
    .single();

  const userEmail = session.user.email;

  const { data: existingContract } = await supabase
    .from("contracts")
    .select("id")
    .eq("user_email", userEmail)
    .maybeSingle();

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Kredit a platby</h1>
          <p className="text-muted-foreground mt-1">
            Správa kreditu, dobíjení a přehled faktur
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Dobití kreditu</CardTitle>
                <CardDescription>Dobijte kredit pro použití služeb</CardDescription>
              </CardHeader>
              <CardContent>
                <TopUpCreditForm currentBalance={company?.wallet_balance || 0} />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Aktuální kredit
                </CardTitle>
                <CardDescription>
                  Dostupný zůstatek na vašem účtu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="text-4xl font-bold">
                    {new Intl.NumberFormat('cs-CZ', {
                      style: 'currency',
                      currency: 'CZK',
                      maximumFractionDigits: 0
                    }).format(company?.wallet_balance || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    K dispozici pro služby
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div>
          <Tabs defaultValue="invoices">
            <TabsList>
              <TabsTrigger value="invoices" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Faktury
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Transakce
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="invoices" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Faktury</CardTitle>
                  <CardDescription>
                    Historie vašich faktur a plateb
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {companyInvoices.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium mb-1">Zatím nemáte žádné faktury</h3>
                      <p className="text-sm text-muted-foreground">
                        Po úspěšném dobití kreditu se zde zobrazí vaše faktury
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Číslo faktury</TableHead>
                          <TableHead>Datum</TableHead>
                          <TableHead>Částka</TableHead>
                          <TableHead>Stav</TableHead>
                          <TableHead className="text-right">Akce</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companyInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              {invoice.invoice_number}
                            </TableCell>
                            <TableCell>
                              {new Date(invoice.created_at).toLocaleDateString('cs-CZ')}
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('cs-CZ', {
                                style: 'currency',
                                currency: 'CZK'
                              }).format(invoice.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'}>
                                {invoice.status === 'paid' ? 'Zaplaceno' : 'Čeká na platbu'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Download className="h-4 w-4" />
                                Stáhnout PDF
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historie transakcí</CardTitle>
                  <CardDescription>
                    Přehled všech pohybů na vašem účtu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium mb-1">Zatím nemáte žádné transakce</h3>
                      <p className="text-sm text-muted-foreground">
                        Historie vašich transakcí se zobrazí zde
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Datum</TableHead>
                          <TableHead>Popis</TableHead>
                          <TableHead>Typ</TableHead>
                          <TableHead>Částka</TableHead>
                          <TableHead>Stav</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {new Date(transaction.created_at).toLocaleDateString('cs-CZ')}
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>
                              <Badge variant={transaction.type === 'credit' ? 'default' : 'destructive'}>
                                {transaction.type === 'credit' ? 'Příjem' : 'Výdaj'}
                              </Badge>
                            </TableCell>
                            <TableCell className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                              {transaction.type === 'credit' ? '+' : '-'}
                              {new Intl.NumberFormat('cs-CZ', {
                                style: 'currency',
                                currency: 'CZK'
                              }).format(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={transaction.status === 'completed' ? 'outline' : 'secondary'}>
                                {transaction.status === 'completed' ? 'Dokončeno' : 'Zpracovává se'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Změna tarifu</CardTitle>
              <CardDescription>Změňte si svůj aktuální cenový tarif.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Vložení komponenty pro změnu tarifu */}
              <PricingPlanChange currentTier={currentPricingTier} userEmail={userEmail} hasContract={!!existingContract} />
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
  )
}
