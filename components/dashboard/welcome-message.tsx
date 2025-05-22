"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, LayoutDashboard, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type WelcomeMessageProps = {
  name: string
  stats: {
    total: number
    success: number
    failed: number
  } | null
}

export function WelcomeMessage({ name, stats }: WelcomeMessageProps) {
  const [greeting, setGreeting] = useState("Dobrý den")
  
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting("Dobré ráno")
    } else if (hour < 18) {
      setGreeting("Dobré odpoledne")
    } else {
      setGreeting("Dobrý večer")
    }
  }, [])
  
  const getTrend = () => {
    // Toto by mělo být nahrazeno skutečnými daty
    const trend = 12 // percentuální nárůst
    
    if (trend > 0) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">
          <TrendingUp className="h-3 w-3" />
          <span>+{trend}% oproti předchozímu týdnu</span>
        </div>
      )
    } else if (trend < 0) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">
          <TrendingUp className="h-3 w-3" />
          <span>{trend}% oproti předchozímu týdnu</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 rounded text-xs font-medium">
          <span>Beze změny oproti předchozímu týdnu</span>
        </div>
      )
    }
  }
  
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{greeting}, {name}</h1>
            <p className="text-muted-foreground mt-1 max-w-md">
              Zde vidíte přehled vašich verifikací, statistik a stavu vašeho účtu.
            </p>
            
            <div className="mt-4 flex items-center gap-3">
              {getTrend()}
              <Button size="sm" variant="outline" className="gap-1">
                Zobrazit podrobné statistiky
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col gap-4 justify-end">
            <div className="text-right">
              <div className="text-muted-foreground text-sm">Dnes</div>
              <div className="text-2xl font-bold">{new Date().toLocaleDateString('cs-CZ')}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 