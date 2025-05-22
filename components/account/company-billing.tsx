"use client"

import { useState } from "react"
import { CreditCard, Package, Info } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Company } from "@/lib/supabase/types"

interface PricingInfo {
  id: string
  pricing_tier: string
  tier_name: string
  tier_description: string
  monthly_fee: number
  verification_price: number
  sms_verification_price?: number
  email_verification_price?: number
  document_verification_price?: number
  minimum_deposit?: number
}

interface CompanyBillingProps {
  company: Company
  pricingInfo: PricingInfo | null
}

export function CompanyBilling({ company, pricingInfo }: CompanyBillingProps) {
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)
  const supabase = createClientComponentClient()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
    }).format(price)
  }

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'no_contract':
        return 'Bez smlouvy (předplatné)'
      case 'monthly':
        return 'Měsíční platba'
      case 'yearly':
        return 'Roční platba'
      case 'enterprise':
        return 'Enterprise'
      default:
        return tier
    }
  }

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'no_contract':
        return 'outline'
      case 'monthly':
        return 'default'
      case 'yearly':
        return 'secondary'
      case 'enterprise':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (!pricingInfo) {
    return (
      <div className="py-4">
        <p className="text-center text-muted-foreground">Informace o cenovém tarifu nejsou dostupné</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aktuální tarif</CardTitle>
            <CardDescription>Váš aktuální cenový model a stav účtu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Aktuální tarif:</span>
                <Badge variant={getTierBadgeVariant(company.pricing_tier)}>
                  {getTierLabel(company.pricing_tier)}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Kredit na účtu:</span>
                <span className="font-bold">{formatPrice(company.wallet_balance || 0)}</span>
              </div>
              {pricingInfo.monthly_fee > 0 && (
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Měsíční poplatek:</span>
                  <span>{formatPrice(pricingInfo.monthly_fee)}</span>
                </div>
              )}
              {pricingInfo.minimum_deposit && (
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Minimální vklad:</span>
                  <span>{formatPrice(pricingInfo.minimum_deposit)}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Dobít kredit</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popis tarifu</CardTitle>
            <CardDescription>Detailní informace o vašem tarifu</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{pricingInfo.tier_description || "Bez popisu"}</p>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline">Stáhnout ceník</Button>
            <Button variant="outline">Změnit tarif</Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktuální ceny ověřování</CardTitle>
          <CardDescription>
            Ceny za jednotlivé typy ověření v rámci vašeho tarifu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Typ ověření</TableHead>
                <TableHead className="text-right">Cena bez DPH</TableHead>
                <TableHead className="text-right">Cena s DPH</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <span>Standardní ověření</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Základní ověření identity</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatPrice(pricingInfo.verification_price)}</TableCell>
                <TableCell className="text-right">{formatPrice(pricingInfo.verification_price * 1.21)}</TableCell>
              </TableRow>
              {pricingInfo.sms_verification_price && (
                <TableRow>
                  <TableCell className="font-medium">Ověření SMS kódem</TableCell>
                  <TableCell className="text-right">{formatPrice(pricingInfo.sms_verification_price)}</TableCell>
                  <TableCell className="text-right">{formatPrice(pricingInfo.sms_verification_price * 1.21)}</TableCell>
                </TableRow>
              )}
              {pricingInfo.email_verification_price && (
                <TableRow>
                  <TableCell className="font-medium">Ověření emailem</TableCell>
                  <TableCell className="text-right">{formatPrice(pricingInfo.email_verification_price)}</TableCell>
                  <TableCell className="text-right">{formatPrice(pricingInfo.email_verification_price * 1.21)}</TableCell>
                </TableRow>
              )}
              {pricingInfo.document_verification_price && (
                <TableRow>
                  <TableCell className="font-medium">Ověření dokumentů</TableCell>
                  <TableCell className="text-right">{formatPrice(pricingInfo.document_verification_price)}</TableCell>
                  <TableCell className="text-right">{formatPrice(pricingInfo.document_verification_price * 1.21)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
