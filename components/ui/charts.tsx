"use client"

import {
  LineChart as TremorLineChart,
  BarChart as TremorBarChart,
  DonutChart as TremorDonutChart,
} from "@tremor/react"

interface ChartProps {
  data: any[]
  categories: string[]
  index: string
  colors?: string[]
  valueFormatter?: (value: number) => string
}

interface PieChartProps {
  data: any[]
  category: string
  index: string
  colors?: string[]
  valueFormatter?: (value: number) => string
}

export function LineChart({
  data,
  categories,
  index,
  colors,
  valueFormatter,
}: ChartProps) {
  return (
    <TremorLineChart
      data={data}
      index={index}
      categories={categories}
      colors={colors}
      valueFormatter={valueFormatter}
      showLegend={true}
      showGridLines={true}
      showYAxis={true}
      showXAxis={true}
      className="h-full"
    />
  )
}

export function BarChart({
  data,
  categories,
  index,
  colors,
  valueFormatter,
}: ChartProps) {
  return (
    <TremorBarChart
      data={data}
      index={index}
      categories={categories}
      colors={colors}
      valueFormatter={valueFormatter}
      showLegend={true}
      showGridLines={true}
      showYAxis={true}
      showXAxis={true}
      className="h-full"
    />
  )
}

export function PieChart({
  data,
  category,
  index,
  colors,
  valueFormatter,
}: PieChartProps) {
  return (
    <TremorDonutChart
      data={data}
      category={category}
      index={index}
      colors={colors}
      valueFormatter={valueFormatter}
      showLabel={true}
      showAnimation={true}
      className="h-full"
    />
  )
} 