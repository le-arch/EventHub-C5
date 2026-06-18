/**
 * RevenueSummary Component
 * * Displays premium revenue metrics in summary cards.
 * Shows total revenue, average ticket price, and dynamic revenue trends.
 * * @module RevenueSummary
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Ticket, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface RevenueSummaryProps {
  totalRevenue: number
  totalTickets: number
  previousRevenue?: number
  averageTicketPrice?: number
  isLoading?: boolean
}

export function RevenueSummary({
  totalRevenue,
  totalTickets,
  previousRevenue,
  averageTicketPrice,
  isLoading = false,
}: RevenueSummaryProps) {
  // Calculate revenue change percentage
  const revenueChange = previousRevenue 
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
    : null
  
  const isPositiveChange = revenueChange && revenueChange > 0
  const averagePrice = averageTicketPrice || (totalTickets > 0 ? totalRevenue / totalTickets : 0)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-slate-200/70 animate-pulse rounded-md" />
                <div className="h-9 w-9 bg-slate-200/50 animate-pulse rounded-xl" />
              </div>
              <div className="h-8 w-36 bg-slate-200 animate-pulse rounded-lg" />
              <div className="h-3 w-28 bg-slate-100 animate-pulse rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      
      {/* Total Revenue Card */}
      <Card className="border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 group">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Total Revenue</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight transition-colors group-hover:text-emerald-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 shadow-sm rounded-xl transition-transform group-hover:scale-105">
              <DollarSign className="h-5 w-5 text-emerald-600 stroke-[2.5]" />
            </div>
          </div>
          
          {revenueChange !== null ? (
            <div className="mt-4 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md ${
                isPositiveChange 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/10' 
                  : 'bg-rose-50 text-rose-600 border border-rose-500/10'
              }`}>
                {isPositiveChange ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(revenueChange).toFixed(1)}%
              </span>
              <span className="text-xs font-medium text-slate-400">from previous period</span>
            </div>
          ) : (
            <div className="mt-4 text-xs font-medium text-slate-400 flex items-center gap-1">
              <span>⚡ Live update pipeline active</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tickets Sold Card */}
      <Card className="border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 group">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Tickets Sold</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight transition-colors group-hover:text-indigo-600">
                {totalTickets.toLocaleString()}
              </p>
            </div>
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 shadow-sm rounded-xl transition-transform group-hover:scale-105">
              <Ticket className="h-5 w-5 text-indigo-600 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-5 flex items-center gap-1">
            <span>🎟️ Verified total platform sales</span>
          </p>
        </CardContent>
      </Card>

      {/* Average Ticket Price Card */}
      <Card className="border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 group">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Average Ticket Value</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight transition-colors group-hover:text-violet-600">
                {formatCurrency(averagePrice)}
              </p>
            </div>
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 shadow-sm rounded-xl transition-transform group-hover:scale-105">
              <CreditCard className="h-5 w-5 text-violet-600 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-5">
            Based on <span className="font-semibold text-slate-600">{totalTickets}</span> seat{totalTickets !== 1 ? 's' : ''} reserved
          </p>
        </CardContent>
      </Card>

    </div>
  )
}