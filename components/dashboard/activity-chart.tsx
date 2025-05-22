"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"

type ActivityChartProps = {
  data: {
    date: string
    value: number
  }[]
}

export function ActivityChart({ data }: ActivityChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={true}
            vertical={false}
            stroke={isDark ? "#333" : "#eee"}
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            stroke={isDark ? "#666" : "#888"}
            fontSize={12}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            stroke={isDark ? "#666" : "#888"}
            fontSize={12}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <Card className="p-2 shadow-lg border bg-background text-sm">
                    <div className="font-medium">{label}</div>
                    <div className="text-muted-foreground">
                      Verifikace: {payload[0].value}
                    </div>
                  </Card>
                )
              }
              return null
            }}
          />
          <Bar
            dataKey="value"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 