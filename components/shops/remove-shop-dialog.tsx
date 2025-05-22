"use client"

import { useState } from "react"
import { deleteShop } from "@/lib/actions/shops"
import { useToast } from "@/hooks/use-toast"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Shop } from "@/lib/supabase/types"

interface RemoveShopDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shop: Shop
}

export function RemoveShopDialog({ open, onOpenChange, shop }: RemoveShopDialogProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const result = await deleteShop(shop.id)
      
      if (result.error) {
        toast({
          title: "Nastala chyba",
          description: result.error,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Obchod byl odstraněn",
          description: "Obchod byl úspěšně odstraněn",
        })
      }
    } catch (error) {
      toast({
        title: "Nastala chyba",
        description: "Neočekávaná chyba při odstraňování obchodu",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      onOpenChange(false)
    }
  }
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Opravdu chcete odstranit tento obchod?</AlertDialogTitle>
          <AlertDialogDescription>
            Budou odstraněny všechny záznamy o verifikacích a API klíče spojené s tímto obchodem.
            Tato akce je nevratná.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Zrušit</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Odstraňování..." : "Odstranit"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 