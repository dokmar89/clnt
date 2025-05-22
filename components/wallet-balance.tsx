"use client"

import { CreditCard, PlusCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TopUpWalletDialog } from "@/components/billing/top-up-wallet-dialog"
import { useState } from "react"

type WalletBalanceProps = {
  balance: number
}

export function WalletBalance({ balance }: WalletBalanceProps) {
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Kredit
          </CardTitle>
          <CardDescription>Dostupný zůstatek na vašem účtu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center pt-2 pb-4">
            <div className="text-3xl font-bold">{balance.toFixed(2)} Kč</div>
            <div className="text-sm text-muted-foreground mt-1">
              pro verifikace
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full gap-1"
            onClick={() => setIsTopUpOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            Dobít kredit
          </Button>
        </CardContent>
      </Card>
      
      <TopUpWalletDialog 
        open={isTopUpOpen} 
        onOpenChange={setIsTopUpOpen} 
      />
    </>
  )
} 