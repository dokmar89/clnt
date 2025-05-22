"use client"

import { useState } from "react"
import { toast } from "sonner"
import { 
  RefreshCw, Copy, EyeOff, Eye, Settings, Trash, 
  Check, AlertCircle, Clock
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cs } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createApiKey, revokeApiKey } from "@/lib/actions/shops"

interface ApiKey {
  id: string
  shop_id: string
  api_key: string
  description: string
  is_active: boolean
  created_at: string
  last_used_at?: string
}

interface ApiKeysManagerProps {
  shopId: string
  apiKeys: ApiKey[]
}

export function ApiKeysManager({ shopId, apiKeys }: ApiKeysManagerProps) {
  const [description, setDescription] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  
  const toggleShowKey = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("API klíč byl zkopírován do schránky")
      })
      .catch(() => {
        toast.error("Nepodařilo se zkopírovat API klíč")
      })
  }
  
  const handleCreateKey = async () => {
    if (!description.trim()) {
      toast.error("Zadejte popis API klíče")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await createApiKey({
        shop_id: shopId,
        description: description
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success("Nový API klíč byl úspěšně vygenerován")
      setIsDialogOpen(false)
      setDescription("")
      
    } catch (error) {
      toast.error("Došlo k chybě při generování API klíče")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleRevokeKey = async (keyId: string) => {
    if (!confirm("Opravdu chcete zneplatnit tento API klíč? Tato akce je nevratná a může způsobit výpadek funkčnosti vašeho e-shopu.")) {
      return
    }
    
    try {
      const result = await revokeApiKey(keyId)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success("API klíč byl úspěšně zneplatněn")
    } catch (error) {
      toast.error("Došlo k chybě při zneplatnění API klíče")
    }
  }
  
  // Funkce pro maskování API klíče
  const maskApiKey = (key: string) => {
    const prefix = key.substring(0, 3)
    const suffix = key.substring(key.length - 4)
    return `${prefix}...${suffix}`
  }
  
  const hasActiveKeys = apiKeys.some(key => key.is_active)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">API klíče</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <RefreshCw className="h-4 w-4" />
              Vygenerovat nový klíč
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vygenerovat nový API klíč</DialogTitle>
              <DialogDescription>
                Nový klíč bude okamžitě aktivní. Po vygenerování si jej uložte, protože později jej už neuvidíte v plném znění.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="description">Popis klíče</Label>
              <Input
                id="description"
                placeholder="Např. Produkční klíč, Testovací klíč, apod."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Zrušit
              </Button>
              <Button onClick={handleCreateKey} disabled={isSubmitting || !description.trim()}>
                {isSubmitting ? "Generuji..." : "Vygenerovat klíč"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {apiKeys.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Zatím nemáte žádné API klíče</h3>
            <p className="text-muted-foreground mb-4">
              API klíče slouží k autentizaci vašeho e-shopu při komunikaci s naším verifikačním systémem
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-1">
              <RefreshCw className="h-4 w-4" />
              Vygenerovat API klíč
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Seznam API klíčů</CardTitle>
            <CardDescription>
              Spravujte API klíče pro přístup vašeho e-shopu k verifikačnímu systému
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasActiveKeys && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4 rounded-sm">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-700">Upozornění: Nemáte aktivní API klíč</h3>
                    <p className="text-sm text-yellow-600 mt-1">
                      Bez aktivního API klíče nebude možné provádět verifikaci věku zákazníků.
                      Vygenerujte si nový klíč pro obnovení funkčnosti.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Popis</TableHead>
                  <TableHead>API klíč</TableHead>
                  <TableHead>Vytvořeno</TableHead>
                  <TableHead>Stav</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="bg-muted px-1 py-0.5 rounded text-xs">
                          {showKeys[key.id] ? key.api_key : maskApiKey(key.api_key)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleShowKey(key.id)}
                          disabled={!key.is_active}
                        >
                          {showKeys[key.id] ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(key.api_key)}
                          disabled={!key.is_active}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(key.created_at), { 
                          addSuffix: true,
                          locale: cs
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={key.is_active ? "default" : "destructive"}>
                        {key.is_active ? "Aktivní" : "Zneplatněný"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {key.is_active && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRevokeKey(key.id)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 