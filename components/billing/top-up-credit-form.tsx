"use client"

import { useState } from "react"
import { CreditCard, Copy, QrCode, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { topUpWallet } from "@/lib/actions/wallet"

const PREDEFINED_AMOUNTS = [500, 1000, 2000, 5000]

interface TopUpCreditFormProps {
  currentBalance: number
}

export function TopUpCreditForm({ currentBalance }: TopUpCreditFormProps) {
  const router = useRouter()
  const [isCustomAmountDialogOpen, setIsCustomAmountDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [amount, setAmount] = useState<number>(0)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  
  const handlePredefinedAmount = async (value: number) => {
    setAmount(value)
    await processPayment(value)
  }
  
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value)
    }
  }
  
  const handleCustomAmountSubmit = async () => {
    const parsedAmount = parseInt(customAmount, 10)
    if (parsedAmount && parsedAmount >= 100) {
      setAmount(parsedAmount)
      setIsCustomAmountDialogOpen(false)
      await processPayment(parsedAmount)
    } else {
      toast.error("Zadejte platnou částku (minimálně 100 Kč)")
    }
  }
  
  const processPayment = async (amount: number) => {
    setIsProcessing(true)
    
    try {
      const result = await topUpWallet(amount)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      if (result.success) {
        // Simulace platebních údajů - v reálné implementaci by toto přišlo z API
        setPaymentInfo({
          accountNumber: "123456789/0800",
          amount: amount,
          variableSymbol: result.transactionId.substring(0, 8),
          message: `Dobití kreditu - ${result.transactionId.substring(0, 8)}`
        })
        
        setIsPaymentDialogOpen(true)
        
        // V reálné implementaci bychom přesměrovali na platební bránu
        // window.location.href = result.redirectUrl
      }
    } catch (error) {
      toast.error("Došlo k chybě při zpracování platby")
    } finally {
      setIsProcessing(false)
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
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PREDEFINED_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            className="h-20 flex flex-col gap-1"
            onClick={() => handlePredefinedAmount(amount)}
          >
            <span className="text-lg font-bold">{amount.toLocaleString('cs-CZ')} Kč</span>
            <span className="text-xs text-muted-foreground">Dobít kredit</span>
          </Button>
        ))}
      </div>
      
      <div className="flex justify-center">
        <Button
          variant="outline"
          className="gap-1"
          onClick={() => setIsCustomAmountDialogOpen(true)}
        >
          <CreditCard className="h-4 w-4" />
          Vlastní částka
        </Button>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <h3 className="font-medium mb-2">Jak dobití kreditu funguje?</h3>
        <ol className="space-y-2 list-decimal pl-4">
          <li>Zvolte částku, kterou chcete dobít na svůj účet</li>
          <li>Proveďte platbu pomocí bankovního převodu na náš účet (QR kód pro snazší platbu)</li>
          <li>Po připsání platby na náš účet bude kredit automaticky přidán na váš účet</li>
          <li>Faktura bude vygenerována a dostupná ke stažení v sekci Faktury</li>
        </ol>
      </div>
      
      {/* Dialog pro zadání vlastní částky */}
      <Dialog open={isCustomAmountDialogOpen} onOpenChange={setIsCustomAmountDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Vlastní částka</DialogTitle>
            <DialogDescription>
              Zadejte částku, kterou chcete dobít na svůj účet
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <Input
                  type="text"
                  placeholder="Zadejte částku"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="text-lg"
                  autoFocus
                />
                <span className="text-lg font-medium">Kč</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Minimální částka pro dobití je 100 Kč
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCustomAmountDialogOpen(false)}
            >
              Zrušit
            </Button>
            <Button 
              onClick={handleCustomAmountSubmit}
              disabled={!customAmount || parseInt(customAmount, 10) < 100}
            >
              Pokračovat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog s platebními informacemi */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
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
                <div className="text-xl font-bold mb-1">{amount.toLocaleString("cs-CZ")} Kč</div>
                <div className="text-sm text-muted-foreground">Částka k úhradě</div>
              </div>
              
              {/* QR kód se zobrazí vždy nahoře */}
              <div className="h-44 w-44 bg-white rounded-lg border flex items-center justify-center">
                <QrCode className="h-32 w-32 text-primary/30" />
              </div>
            </div>
            
            {/* Platební údaje jsou zobrazeny bez zbytečných záložek */}
            <div className="space-y-4 mt-2">
              <h3 className="text-sm font-medium">Bankovní převod</h3>
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
                      <span>{amount.toLocaleString("cs-CZ")} Kč</span>
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
            </div>
            
            <div className="mt-2 text-center text-sm text-muted-foreground">
              <p>Naskenujte QR kód ve vaší bankovní aplikaci</p>
              <p>nebo použijte údaje pro ruční zadání platby</p>
            </div>
            
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
            <Button type="button" onClick={() => setIsPaymentDialogOpen(false)} variant="outline">
              Zavřít
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 