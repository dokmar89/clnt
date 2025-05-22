"use client"

import Link from "next/link"
import { ChevronRight, Globe, QrCode } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cs } from "date-fns/locale"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import type { Shop } from "@/lib/supabase/types"

type ShopsListProps = {
  shops: Shop[]
}

export function ShopsList({ shops }: ShopsListProps) {
  if (!shops.length) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center">
        <h3 className="font-semibold text-lg mb-2">Zatím nemáte žádné obchody</h3>
        <p className="text-muted-foreground mb-6">
          Vytvořte váš první obchod pro integraci verifikačního systému
        </p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {shops.map((shop) => (
        <Link key={shop.id} href={`/dashboard/shops/${shop.id}`}>
          <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="truncate" title={shop.name}>
                  {shop.name}
                </CardTitle>
                <Badge variant={shop.is_active ? "default" : "secondary"}>
                  {shop.is_active ? "Aktivní" : "Neaktivní"}
                </Badge>
              </div>
              <CardDescription className="line-clamp-1">
                {shop.description || "Bez popisu"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {shop.url && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate" title={shop.url}>
                      {shop.url}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Vytvořeno {formatDistanceToNow(new Date(shop.created_at), { 
                      addSuffix: true,
                      locale: cs
                    })}
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-1 mt-2">
                Spravovat
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
} 