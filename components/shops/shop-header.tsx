"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Globe, Calendar, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cs } from "date-fns/locale"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { updateShop } from "@/lib/actions/shops"
import type { Shop } from "@/lib/supabase/types"

type ShopHeaderProps = {
  shop: Shop
}

export function ShopHeader({ shop }: ShopHeaderProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleStatusChange = async () => {
    try {
      setIsUpdating(true)
      const result = await updateShop(shop.id, {
        is_active: !shop.is_active
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success(`Obchod byl ${shop.is_active ? "deaktivován" : "aktivován"}`)
      router.refresh()
    } catch (error) {
      toast.error("Došlo k chybě při změně stavu obchodu")
    } finally {
      setIsUpdating(false)
    }
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{shop.name}</CardTitle>
          </div>
          <Badge variant={shop.is_active ? "default" : "secondary"} className="mt-1">
            {shop.is_active ? "Aktivní" : "Neaktivní"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground font-medium">
                Informace
              </div>
              {shop.url && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={shop.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {shop.url}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Vytvořeno {formatDistanceToNow(new Date(shop.created_at), { 
                    addSuffix: true,
                    locale: cs
                  })}
                </span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground font-medium mb-2">
                Popis
              </div>
              <p className="text-sm">
                {shop.description || "Bez popisu"}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant={shop.is_active ? "outline" : "default"}
                  className={`gap-1 ${!shop.is_active && "bg-green-600 hover:bg-green-700"}`}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Aktualizuji...
                    </>
                  ) : shop.is_active ? (
                    <>
                      <ToggleLeft className="h-4 w-4" />
                      Deaktivovat
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-4 w-4" />
                      Aktivovat
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {shop.is_active ? "Deaktivovat" : "Aktivovat"} obchod
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {shop.is_active 
                      ? "Deaktivací obchodu dojde k zablokování všech verifikací. Všechny API klíče přestanou fungovat."
                      : "Aktivací obchodu opět povolíte používání verifikačního API pro tento obchod."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Zrušit</AlertDialogCancel>
                  <AlertDialogAction onClick={handleStatusChange}>
                    {shop.is_active ? "Deaktivovat" : "Aktivovat"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
