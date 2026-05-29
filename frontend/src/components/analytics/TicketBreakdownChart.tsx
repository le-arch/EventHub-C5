/**
 * TicketBreakdownChart Component
 * 
 * Displays ticket type distribution using a pie/donut chart.
 * Shows percentage breakdown and can be clicked to filter.
 * 
 * @module TicketBreakdownChart
 */

'use client'

import { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { formatCurrency } from '@/src/lib/utils'

// Types
interface TicketTypeData {
  name: string
  sold: number
  revenue: number
  percentage: number
  color?: string
}

interface TicketBreakdownChartProps {
  data: TicketTypeData[]
  isLoading?: boolean
  title?: string
  description?: string
  onTicketClick?: (ticketName: string) => void
}

// Default colors for chart segments
const DEFAULT_COLORS = [
  '#2563EB', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
]

/**
 * Custom active shape for pie chart (adds hover effect)
 */
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill="#374151" className="text-sm font-semibold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 5} dy={8} textAnchor="middle" fill="#6B7280" className="text-xs">
        {`${value} tickets (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  )
}

/**
 * Custom tooltip for pie chart
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-600">
            Tickets Sold: <span className="font-semibold">{data.sold}</span>
          </p>
          <p className="text-gray-600">
            Revenue: <span className="font-semibold">{formatCurrency(data.revenue)}</span>
          </p>
          <p className="text-gray-600">
            Percentage: <span className="font-semibold">{data.percentage}%</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

export function TicketBreakdownChart({
  data,
  isLoading = false,
  title = "Ticket Breakdown",
  description = "Distribution of tickets sold by type",
  onTicketClick,
}: TicketBreakdownChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  // Assign colors to data if not provided
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }))

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(undefined)
  }

  const handleClick = (data: any, index: number) => {
    if (onTicketClick) {
      onTicketClick(data.name)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center flex-col gap-2">
            <p className="text-gray-400">No ticket data available</p>
            <p className="text-sm text-gray-400">Add ticket types to see breakdown</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="sold"
                nameKey="name"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                onClick={handleClick}
                cursor="pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                formatter={(value, entry: any, index) => (
                  <span className="text-sm text-gray-700">
                    {value}: {chartData[index]?.percentage}%
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed breakdown table for mobile */}
        <div className="mt-6 block md:hidden">
          <div className="space-y-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm">{item.sold} tickets</p>
                  <p className="text-xs text-gray-500">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}