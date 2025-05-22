"use client"

import { useState } from "react"
import { CreditCard, Copy, QrCode, CheckCircle } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const PREDEFINED_AMOUNTS = [500, 1000, 2000, 5000]

interface TopUpWalletDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TopUpWalletDialog({ open, onOpenChange }: TopUpWalletDialogProps) {
  const [amount, setAmount] = useState<number | "">("")
  const [customAmount, setCustomAmount] = useState<string>("")
  const [step, setStep] = useState<"amount" | "payment">("amount")
  const [invoiceNumber, setInvoiceNumber] = useState("2025000001") // Simulace generování čísla faktury
  
  // Funkce pro generování QR kódu by měla vracet URL nebo data pro QR kód
  const generateQrCodeData = (amount: number, invoiceNumber: string) => {
    return {
      accountNumber: "123456789/0800",
      amount: amount,
      variableSymbol: invoiceNumber,
      message: `Dobití kreditu - ${invoiceNumber}`
    }
  }
  
  // Funkce pro kopírování údajů do schránky
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(message)
      })
      .catch(() => {
        toast.error("Nepodařilo se zkopírovat do schránky")
      })
  }
  
  const handlePredefinedAmount = (value: number) => {
    setAmount(value)
    setCustomAmount("")
  }
  
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value)
      setAmount(value === "" ? "" : parseInt(value, 10))
    }
  }
  
  const handleContinue = () => {
    if (amount && amount >= 100) {
      setStep("payment")
    } else {
      toast.error("Zadejte platnou částku (minimálně 100 Kč)")
    }
  }
  
  const handleReset = () => {
    setAmount("")
    setCustomAmount("")
    setStep("amount")
    onOpenChange(false)
  }
  
  const paymentInfo = amount ? generateQrCodeData(Number(amount), invoiceNumber) : null
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === "amount" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Dobití kreditu
              </DialogTitle>
              <DialogDescription>
                Zvolte částku, kterou chcete dobít na svůj účet.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {PREDEFINED_AMOUNTS.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={amount === value ? "default" : "outline"}
                    className="h-14 text-lg"
                    onClick={() => handlePredefinedAmount(value)}
                  >
                    {value.toLocaleString("cs-CZ")} Kč
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-sm">Vlastní částka</div>
                <div className="flex gap-2 items-center">
                  <Input
                    type="text"
                    placeholder="Zadejte částku"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="text-lg"
                  />
                  <span className="text-lg font-medium">Kč</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Minimální částka pro dobití je 100 Kč
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" onClick={handleReset} variant="outline">
                Zrušit
              </Button>
              <Button 
                type="button" 
                onClick={handleContinue} 
                disabled={!amount || amount < 100}
              >
                Pokračovat
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Platební informace
              </DialogTitle>
              <DialogDescription>
                Pro dobití kreditu použijte tyto platební údaje.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-5">
              <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center">
                <div className="mb-3 text-center">
                  <div className="text-xl font-bold mb-1">{amount?.toLocaleString("cs-CZ")} Kč</div>
                  <div className="text-sm text-muted-foreground">Částka k úhradě</div>
                </div>
                
                {/* Zde by byl skutečný QR kód */}
                <div className="h-44 w-44 bg-white rounded-lg border flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-primary/30" />
                </div>
              </div>
              
              <Tabs defaultValue="bank">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="bank">Bankovní převod</TabsTrigger>
                  <TabsTrigger value="qr">QR kód</TabsTrigger>
                </TabsList>
                <TabsContent value="bank" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Číslo účtu</div>
                        <div className="relative">
                          <div className="bg-muted flex items-center justify-between p-2 rounded border">
                            <span>{paymentInfo?.accountNumber}</span>
                            <Button 
                              type="button" 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8"
                              onClick={() => copyToClipboard(paymentInfo?.accountNumber || "", "Číslo účtu zkopírováno")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Variabilní symbol</div>
                        <div className="relative">
                          <div className="bg-muted flex items-center justify-between p-2 rounded border">
                            <span>{paymentInfo?.variableSymbol}</span>
                            <Button 
                              type="button" 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8"
                              onClick={() => copyToClipboard(paymentInfo?.variableSymbol || "", "Variabilní symbol zkopírován")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Částka</div>
                      <div className="relative">
                        <div className="bg-muted flex items-center justify-between p-2 rounded border">
                          <span>{amount?.toLocaleString("cs-CZ")} Kč</span>
                          <Button 
                            type="button" 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(`${amount}`, "Částka zkopírována")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="qr" className="space-y-4 mt-4">
                  <Card>
                    <CardContent className="pt-6 space-y-2">
                      <div className="text-center mb-2">
                        <p className="text-sm text-muted-foreground">
                          Naskenujte QR kód ve vaší bankovní aplikaci
                        </p>
                      </div>
                      <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-lg border">
                          <QrCode className="h-40 w-40 text-primary/30" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Platba bude zpracována automaticky</p>
                    <p className="mt-1">Po připsání platby na náš účet bude kredit automaticky přidán na váš účet a vygenerována faktura.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" onClick={handleReset} variant="outline">
                Zavřít
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
