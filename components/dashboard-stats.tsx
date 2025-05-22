"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type StatsProps = {
  stats: {
    total: number
    success: number
    failed: number
    byMethod: Array<{
      method_code: string
      count: number
    }>
  } | null
}

export function DashboardStats({ stats }: StatsProps) {
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistiky verifikací</CardTitle>
          <CardDescription>Přehled úspěšnosti verifikací</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">Zatím nemáte žádné verifikace</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const successPercentage = stats.total > 0 
    ? Math.round((stats.success / stats.total) * 100) 
    : 0

  // Výpočet ostatních stavů s bezpečnostní kontrolou na NaN
  const otherStates = stats.total - stats.success - stats.failed
  const safeOtherStates = isNaN(otherStates) ? 0 : Math.max(0, otherStates)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiky verifikací</CardTitle>
        <CardDescription>Přehled úspěšnosti verifikací</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Úspěšnost verifikací</span>
              <span className="text-sm font-medium">{successPercentage}%</span>
            </div>
            <Progress value={successPercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Celkem verifikací</div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="text-2xl font-bold text-green-500">{stats.success}</div>
              <div className="text-xs text-muted-foreground">Úspěšných</div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
              <div className="text-xs text-muted-foreground">Neúspěšných</div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="text-2xl font-bold text-amber-500">
                {safeOtherStates}
              </div>
              <div className="text-xs text-muted-foreground">Ostatní stavy</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 