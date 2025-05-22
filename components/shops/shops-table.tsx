"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Store, Globe, Calendar, MoreHorizontal, 
  Pencil, Key, ToggleLeft, ToggleRight, Trash
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cs } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EditShopDialog } from "@/components/shops/edit-shop-dialog"
import { DeleteShopDialog } from "@/components/shops/delete-shop-dialog"
import { updateShopStatus } from "@/lib/actions/shops"
import { toast } from "sonner"

import type { Shop } from "@/lib/supabase/types"

interface ShopsTableProps {
  shops: Shop[]
  companyId: string
}

export function ShopsTable({ shops, companyId }: ShopsTableProps) {
  const router = useRouter()
  const [editShopId, setEditShopId] = useState<string | null>(null)
  const [shopToEdit, setShopToEdit] = useState<Shop | null>(null)
  const [deleteShopId, setDeleteShopId] = useState<string | null>(null)
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null)
  
  const handleEditShop = (shop: Shop) => {
    setShopToEdit(shop)
    setEditShopId(shop.id)
  }
  
  const handleDeleteShop = (shop: Shop) => {
    setShopToDelete(shop)
    setDeleteShopId(shop.id)
  }
  
  const handleManageApiKeys = (shopId: string) => {
    router.push(`/dashboard/shops/${shopId}/api-keys`)
  }
  
  const handleToggleShopStatus = async (shop: Shop) => {
    try {
      const result = await updateShopStatus({
        shopId: shop.id, 
        isActive: !shop.is_active
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success(
        shop.is_active
          ? `E-shop "${shop.name}" byl deaktivován`
          : `E-shop "${shop.name}" byl aktivován`
      )
      
      router.refresh()
    } catch (error) {
      toast.error("Došlo k chybě při aktualizaci stavu e-shopu")
    }
  }
  
  if (shops.length === 0) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center">
        <Store className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-lg mb-2">Zatím nemáte žádné e-shopy</h3>
        <p className="text-muted-foreground mb-6">
          Vytvořte váš první e-shop pro integraci verifikačního systému
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Název</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Vytvořeno</TableHead>
              <TableHead>Stav</TableHead>
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.map((shop) => (
              <TableRow key={shop.id}>
                <TableCell>
                  <div className="font-medium">{shop.name}</div>
                  {shop.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {shop.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {shop.url ? (
                    <a 
                      href={shop.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span className="text-sm truncate max-w-[200px] inline-block">
                        {shop.url}
                      </span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDistanceToNow(new Date(shop.created_at), { 
                      addSuffix: true,
                      locale: cs
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={shop.is_active ? "default" : "secondary"}>
                    {shop.is_active ? "Aktivní" : "Neaktivní"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Akce</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleEditShop(shop)}
                        className="flex items-center gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        <span>Upravit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleManageApiKeys(shop.id)}
                        className="flex items-center gap-2"
                      >
                        <Key className="h-4 w-4" />
                        <span>Spravovat API klíče</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleToggleShopStatus(shop)}
                        className="flex items-center gap-2"
                      >
                        {shop.is_active ? (
                          <>
                            <ToggleRight className="h-4 w-4" />
                            <span>Deaktivovat</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4" />
                            <span>Aktivovat</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteShop(shop)}
                        className="text-destructive flex items-center gap-2"
                      >
                        <Trash className="h-4 w-4" />
                        <span>Smazat</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {shopToEdit && (
        <EditShopDialog 
          shop={shopToEdit} 
          isOpen={!!editShopId} 
          onClose={() => {
            setEditShopId(null)
            setShopToEdit(null)
          }}
        />
      )}
      
      {shopToDelete && (
        <DeleteShopDialog 
          shop={shopToDelete} 
          isOpen={!!deleteShopId} 
          onClose={() => {
            setDeleteShopId(null)
            setShopToDelete(null)
          }}
        />
      )}
    </div>
  )
} 