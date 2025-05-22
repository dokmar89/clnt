"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { ArrowUp, ArrowDown, Filter, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopUpWalletDialog } from "@/components/billing/top-up-wallet-dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { checkAllPayments } from "@/lib/actions/wallet"
import type { Database } from "@/lib/supabase/types"

interface StatusOption {
  value: string
  label: string
}

interface Transaction {
  id: string
  created_at: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  transaction_type: 'credit' | 'debit'
  description: string
}

interface BillingPageClientProps {
  initialInvoices: Transaction[]
  pendingCount: number
  paymentStatusOptions: StatusOption[]
  transactionTypeOptions: StatusOption[]
}

export function BillingPageClient({ 
  initialInvoices, 
  pendingCount, 
  paymentStatusOptions,
  transactionTypeOptions 
}: BillingPageClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [invoices, setInvoices] = useState<Transaction[]>(initialInvoices)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const supabase = createClientComponentClient<Database>()

  // Filtrování transakcí podle vybraných filtrů
  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesType = typeFilter === "all" || invoice.transaction_type === typeFilter
    return matchesStatus && matchesType
  })

  const handleCheckPayments = async () => {
    try {
      setIsLoading(true)
      const result = await checkAllPayments()
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success(`Stav plateb byl aktualizován`)
      
      // Znovu načíst transakce
      const { data: refreshedInvoices } = await supabase
        .from("wallet_transactions")
        .select("*")
      
      if (refreshedInvoices) {
        setInvoices(refreshedInvoices)
      }
    } catch (error) {
      toast.error("Došlo k chybě při kontrole plateb")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Fakturace a platby</h1>
            <p className="text-muted-foreground mt-1">
              Správa kreditu a přehled transakcí
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Button
                variant="outline"
                onClick={handleCheckPayments}
                disabled={isLoading}
                className="gap-1"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Kontrola...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Zkontrolovat platby ({pendingCount})
                  </>
                )}
              </Button>
            )}
            <TopUpWalletDialog />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Dostupný kredit</CardDescription>
              <CardTitle className="text-2xl">0,00 Kč</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Celkem dobito</CardDescription>
              <CardTitle className="text-2xl">0,00 Kč</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Celkem spotřebováno</CardDescription>
              <CardTitle className="text-2xl">0,00 Kč</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cena za verifikaci</CardDescription>
              <CardTitle className="text-2xl">5,00 Kč</CardTitle>
            </CardHeader>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Historie transakcí</CardTitle>
                  <CardDescription>Přehled všech transakcí na vašem účtu</CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Stav platby" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentStatusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Typ transakce" />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Žádné transakce k zobrazení</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Popis</TableHead>
                      <TableHead>Částka</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Stav</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          {new Date(invoice.created_at).toLocaleDateString('cs-CZ')}
                        </TableCell>
                        <TableCell>{invoice.description || "Transakce"}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            {invoice.transaction_type === "credit" ? (
                              <ArrowUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDown className="h-4 w-4 text-red-500" />
                            )}
                            {invoice.amount.toFixed(2)} Kč
                          </div>
                        </TableCell>
                        <TableCell>
                          {invoice.transaction_type === "credit" ? "Dobití" : "Odečtení"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "completed"
                                ? "default"
                                : invoice.status === "pending"
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {invoice.status === "completed"
                              ? "Zaplaceno"
                              : invoice.status === "pending"
                              ? "Čeká se"
                              : "Nezaplaceno"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
