"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { cs } from "date-fns/locale"
import { toast } from "sonner"
import { Copy, Key, RefreshCw, ShieldAlert, Eye, EyeOff, Calendar, Clock, MoreHorizontal, PencilLine, Trash, XCircle } from "lucide-react"
import { format } from "date-fns"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { revokeApiKey } from "@/lib/actions/shops"
import type { ApiKey } from "@/lib/supabase/types"

type ApiKeysListProps = {
  apiKeys: ApiKey[]
  shopId: string
}

export function ApiKeysList({ apiKeys, shopId }: ApiKeysListProps) {
  const [isRevoking, setIsRevoking] = useState<boolean>(false)
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null)
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState<boolean>(false)
  const router = useRouter()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("API klíč byl zkopírován do schránky")
  }

  const handleRevokeKey = (key: ApiKey) => {
    setKeyToRevoke(key)
    setIsRevokeDialogOpen(true)
  }
  
  const confirmRevokeKey = async () => {
    if (!keyToRevoke) return
    
    setIsRevoking(true)
    
    try {
      const result = await revokeApiKey(keyToRevoke.id)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success("API klíč byl úspěšně zneplatněn")
      setIsRevokeDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Došlo k chybě při zneplatnění API klíče")
    } finally {
      setIsRevoking(false)
    }
  }
  
  // Funkce pro maskování API klíče
  const maskApiKey = (prefix: string) => {
    if (!prefix) return ""
    // Maskujeme pouze část klíče
    return `${prefix.substring(0, 4)}...${prefix.substring(prefix.length - 4)}`
  }

  if (!apiKeys || !apiKeys.length) {
    return (
      <div className="text-center py-6">
        <div className="bg-muted inline-flex p-3 rounded-full mb-4">
          <Key className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg mb-2">Žádné API klíče</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Pro tento e-shop zatím nebyly vygenerovány žádné API klíče. 
          Vygenerujte nový klíč pro integraci s verifikačním systémem.
        </p>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prefix</TableHead>
            <TableHead>Popis</TableHead>
            <TableHead>Vytvořeno</TableHead>
            <TableHead>Expirace</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Akce</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((key) => (
            <TableRow key={key.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                    {key.key_prefix}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(key.key_prefix)}
                    disabled={key.status !== 'active'}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {key.description || "Bez popisu"}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(key.created_at), "d.M.yyyy", { locale: cs })}
                </div>
              </TableCell>
              <TableCell>
                {key.expires_at ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(key.expires_at), "d.M.yyyy", { locale: cs })}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Bez expirace</span>
                )}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={key.status === 'active' ? "success" : "destructive"}
                  className="capitalize"
                >
                  {key.status === 'active' ? "Aktivní" : "Zneplatněný"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={key.status !== 'active'}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Akce</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleRevokeKey(key)}
                      className="text-destructive flex items-center gap-2"
                      disabled={key.status !== 'active'}
                    >
                      <Trash className="h-4 w-4" />
                      <span>Zneplatnit klíč</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Dialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zneplatnit API klíč</DialogTitle>
            <DialogDescription>
              Tato akce je nevratná. Zneplatněný API klíč již nebude možné používat.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-sm">
              <div className="flex gap-2">
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-destructive mb-1">Upozornění</h3>
                  <p className="text-sm text-destructive/90 mb-2">
                    Zneplatnění klíče může způsobit výpadek služeb vašeho e-shopu, 
                    které používají tento klíč pro verifikaci.
                  </p>
                  <p className="text-sm font-medium">
                    Klíč: <code className="bg-muted px-1.5 py-0.5 rounded">{keyToRevoke?.key_prefix || ""}</code>
                  </p>
                  {keyToRevoke?.description && (
                    <p className="text-sm">
                      Popis: {keyToRevoke.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRevokeDialogOpen(false)}
              disabled={isRevoking}
            >
              Zrušit
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRevokeKey}
              disabled={isRevoking}
              className="gap-1"
            >
              {isRevoking ? (
                "Zneplatňuji..."
              ) : (
                <>
                  <Trash className="h-4 w-4" />
                  Zneplatnit klíč
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
