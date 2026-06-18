/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * SalesChart Component
 * * Displays sales data over time using a premium smooth Area/Line canvas map.
 * Shows dual axes tracking parameters for ticket volume and total currency weight.
 * * @module SalesChart
 */

'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface DailySalesData {
  date: string
  tickets: number
  revenue: number
}

interface SalesChartProps {
  data: DailySalesData[]
  isLoading?: boolean
  title?: string
  description?: string
}

/**
 * Premium glassmorphism custom chart tooltip canvas block
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-200/80 min-w-[140px] space-y-2">
        <p className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-1.5">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-xs font-medium">
            <span className="text-indigo-600 flex items-center gap-1">● Ticket Volume:</span>
            <span className="font-bold text-slate-800">{payload[0]?.value ?? 0}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-xs font-medium">
            <span className="text-emerald-600 flex items-center gap-1">● Revenue:</span>
            <span className="font-bold text-slate-800">{formatCurrency(payload[1]?.value ?? 0)}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function SalesChart({ 
  data, 
  isLoading = false, 
  title = "Sales Overview", 
  description = "Daily ticket sales and revenue trend" 
}: SalesChartProps) {
  const [chartType, setChartType] = useState<'area' | 'line'>('area')

  if (isLoading) {
    return (
      <Card className="border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <CardHeader className="space-y-2">
          <div className="h-5 w-1/4 bg-slate-200 animate-pulse rounded-md" />
          <div className="h-4 w-1/3 bg-slate-100 animate-pulse rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center border border-dashed border-slate-200/60 rounded-xl bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              Compiling telemetry matrices...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800 tracking-tight">{title}</CardTitle>
          <CardDescription className="text-slate-500 text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center flex-col gap-2 border border-dashed border-slate-200/80 bg-slate-50/30 rounded-xl">
            <BarChart3 className="h-9 w-9 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-700">No Metrics Tracked</p>
            <p className="text-xs text-slate-400 max-w-[220px] text-center leading-relaxed">
              Sales vector curves materialize here as transactional purchasing cycles log into system records.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 pb-6">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            {title}
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs sm:text-sm">{description}</CardDescription>
        </div>
        
        <Tabs value={chartType} onValueChange={(v) => setChartType(v as 'area' | 'line')} className="bg-slate-100/80 border border-slate-200/40 p-0.5 rounded-xl shadow-sm">
          <TabsList className="bg-transparent gap-0.5 h-8">
            <TabsTrigger value="area" className="text-xs rounded-lg font-medium px-3 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Area Map</TabsTrigger>
            <TabsTrigger value="line" className="text-xs rounded-lg font-medium px-3 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Linear</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <div className="h-80 w-full pr-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#6366f1', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#10b981', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ pt: 15, fontSize: 12, fontWeight: 500, color: '#64748b' }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="tickets"
                  name="Tickets Sold"
                  stroke="#4f46e5"
                  fill="url(#colorTickets)"
                  strokeWidth={2.5}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue Stream"
                  stroke="#10b981"
                  fill="url(#colorRevenue)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            ) : (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#4f46e5', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#10b981', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ pt: 15, fontSize: 12, fontWeight: 500 }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="tickets"
                  name="Tickets Sold"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ fill: '#4f46e5', stroke: '#fff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue Stream"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', stroke: '#fff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}