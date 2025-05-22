"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { deleteShop } from "@/lib/actions/shops"
import type { Shop } from "@/lib/supabase/types"

interface DeleteShopDialogProps {
  shop: Shop
  isOpen: boolean
  onClose: () => void
}

export function DeleteShopDialog({ shop, isOpen, onClose }: DeleteShopDialogProps) {
  const [confirmValue, setConfirmValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (confirmValue !== shop.name) {
      toast.error("Zadaný název e-shopu neodpovídá")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await deleteShop(shop.id)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success("E-shop byl úspěšně smazán")
      onClose()
      router.refresh()
    } catch (error) {
      toast.error("Došlo k chybě při mazání e-shopu")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Smazat e-shop</DialogTitle>
          <DialogDescription>
            Tato akce je nevratná. E-shop bude trvale odstraněn včetně všech API klíčů.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="mb-4 text-sm">
            Pro potvrzení zadejte název e-shopu: <strong>{shop.name}</strong>
          </p>
          <Input 
            value={confirmValue}
            onChange={(e) => setConfirmValue(e.target.value)}
            placeholder="Zadejte název e-shopu"
          />
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Zrušit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting || confirmValue !== shop.name}
          >
            {isSubmitting ? "Mazání..." : "Smazat e-shop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 