"use client"

import { formatDistanceToNow, format } from "date-fns"
import { cs } from "date-fns/locale"
import { Activity, AlertCircle, Clock, FileText, Search } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ShopLog {
  id: string
  shop_id: string
  action: string
  details: string
  created_at: string
}

interface ShopActivityLogsProps {
  shopId: string
  logs: ShopLog[]
}

// Pomocná funkce pro získání barvy podle typu akce
const getActionBadgeVariant = (action: string) => {
  switch (action) {
    case "create":
      return "default"
    case "update":
      return "secondary"
    case "api_key_create":
      return "success"
    case "api_key_revoke":
      return "destructive"
    case "verification_success":
      return "success"
    case "verification_fail":
      return "destructive"
    default:
      return "outline"
  }
}

// Pomocná funkce pro získání uživatelsky přívětivého názvu akce
const getActionName = (action: string) => {
  switch (action) {
    case "create":
      return "Vytvoření"
    case "update":
      return "Aktualizace"
    case "api_key_create":
      return "Nový API klíč"
    case "api_key_revoke":
      return "Zneplatnění klíče"
    case "verification_success":
      return "Úspěšná verifikace"
    case "verification_fail":
      return "Neúspěšná verifikace"
    default:
      return action
  }
}

export function ShopActivityLogs({ shopId, logs }: ShopActivityLogsProps) {
  // Parsování detailů logu (string JSON do objektu)
  const parseDetails = (details: string) => {
    try {
      return JSON.parse(details)
    } catch (error) {
      return { message: details }
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Historie aktivit</h2>
        <div className="flex gap-2">
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Hledat v historii..."
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="icon">
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {logs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Zatím žádné aktivity</h3>
            <p className="text-muted-foreground">
              Historie aktivit vašeho obchodu se zobrazí zde
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Logy aktivit</CardTitle>
            <CardDescription>
              Historie aktivit a událostí vašeho obchodu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum a čas</TableHead>
                  <TableHead>Akce</TableHead>
                  <TableHead>Detaily</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const details = parseDetails(log.details)
                  
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs font-medium">
                            {format(new Date(log.created_at), "d. MMMM yyyy", { locale: cs })}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(log.created_at), "HH:mm:ss")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {getActionName(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xl text-sm">
                          {details.message || "Žádné detaily"}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            
            {logs.length > 10 && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" className="text-sm">
                  Zobrazit více
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 