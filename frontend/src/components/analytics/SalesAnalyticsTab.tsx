'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Ticket, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface DailySales {
  date: string
  tickets: number
  revenue: number
}

interface SalesAnalyticsTabProps {
  dailySales: DailySales[]
}

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <p className="text-blue-600">
            Tickets Sold: <span className="font-semibold">{payload[0]?.value || 0}</span>
          </p>
          <p className="text-green-600">
            Revenue: <span className="font-semibold">{formatCurrency(payload[1]?.value || 0)}</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

export function SalesAnalyticsTab({ dailySales }: SalesAnalyticsTabProps) {
  return (
    <Card className="border-l-4 border-l-blue-500 border-border/80 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Sales Over Time
        </CardTitle>
        <CardDescription>
          Daily ticket sales and revenue trend
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dailySales.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Ticket className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p>No sales data available yet</p>
              <p className="text-sm mt-1">Sales will appear once tickets are purchased</p>
            </div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  label={{ value: 'Tickets Sold', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6B7280' } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
                  label={{ value: 'Revenue (XAF)', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: '#6B7280' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="tickets"
                  name="Tickets Sold"
                  stroke="#2563EB"
                  fill="#2563EB"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
