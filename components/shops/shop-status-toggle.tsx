"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Play, Pause, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateShop } from "@/lib/actions/shops"

interface ShopStatusToggleProps {
  shopId: string
  isActive: boolean
  shopName: string
}

export function ShopStatusToggle({ shopId, isActive, shopName }: ShopStatusToggleProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  
  const toggleStatus = async () => {
    setIsPending(true)
    
    try {
      const result = await updateShop(shopId, {
        is_active: !isActive
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success(
        isActive 
          ? `Obchod "${shopName}" byl pozastaven` 
          : `Obchod "${shopName}" byl znovu aktivován`
      )
      setIsDialogOpen(false)
    } catch (error) {
      toast.error("Došlo k chybě při aktualizaci stavu obchodu")
    } finally {
      setIsPending(false)
    }
  }
  
  return (
    <>
      <Button
        variant={isActive ? "destructive" : "default"}
        size="sm"
        className="gap-1"
        onClick={() => setIsDialogOpen(true)}
      >
        {isActive ? (
          <>
            <Pause className="h-4 w-4" />
            Pozastavit
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Aktivovat
          </>
        )}
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isActive ? (
                <>
                  <Pause className="h-5 w-5 text-destructive" />
                  Pozastavit obchod
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 text-green-600" />
                  Aktivovat obchod
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isActive 
                ? "Tímto dočasně pozastavíte verifikační funkce pro tento obchod."
                : "Tímto znovu aktivujete verifikační funkce pro tento obchod."}
            </DialogDescription>
          </DialogHeader>
          
          {isActive && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-2 rounded-sm">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <h3 className="font-medium text-yellow-700">Upozornění</h3>
                  <p className="text-sm text-yellow-600 mt-1">
                    Pozastavení obchodu způsobí, že všechny API klíče budou dočasně nefunkční 
                    a verifikace věku nebude možná. To může ovlivnit fungování vašeho e-shopu.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isPending}
            >
              Zrušit
            </Button>
            <Button 
              variant={isActive ? "destructive" : "default"}
              onClick={toggleStatus}
              disabled={isPending}
            >
              {isPending 
                ? (isActive ? "Pozastavuji..." : "Aktivuji...") 
                : (isActive ? "Pozastavit obchod" : "Aktivovat obchod")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}