/**
 * CheckinProgress Component
 * * Displays check-in progress with a premium visual progress bar.
 * Shows percentage, counts, and recent activity metrics.
 * * @module CheckinProgress
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Users, ArrowUpRight, Loader2, Sparkles } from 'lucide-react'

interface CheckinProgressProps {
  checkedInCount: number
  totalTickets: number
  percentage: number
  isLoading?: boolean
  title?: string
  description?: string
  showDetails?: boolean
  lastCheckinName?: string
  lastCheckinTime?: string
}

export function CheckinProgress({
  checkedInCount,
  totalTickets,
  percentage,
  isLoading = false,
  title = "Check-in Progress",
  description = "Real-time attendance tracking",
  showDetails = true,
  lastCheckinName,
  lastCheckinTime,
}: CheckinProgressProps) {
  const remainingCount = totalTickets - checkedInCount
  const isComplete = checkedInCount === totalTickets && totalTickets > 0

  if (isLoading) {
    return (
      <Card className="shadow-[0_8px_32px_rgba(0,0,0,0.02)] border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl">
        <CardHeader className="space-y-2">
          <div className="h-5 w-1/3 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-4 w-1/2 bg-slate-100 animate-pulse rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-3 w-full bg-slate-100 animate-pulse rounded-full" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-slate-100 animate-pulse rounded-xl" />
            <div className="h-16 bg-slate-100 animate-pulse rounded-xl" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-[0_8px_32px_rgba(0,0,0,0.02)] border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="flex items-center justify-between text-lg font-bold text-slate-800">
          <span className="tracking-tight">{title}</span>
          {isComplete && (
            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 border-emerald-500/20 px-2.5 py-1 rounded-lg gap-1 shadow-sm font-semibold text-xs transition-colors">
              <Sparkles className="h-3 w-3 animate-spin duration-[4s]" />
              Fully Complete
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-slate-500 text-sm">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Modernized Progress Area */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-slate-500 font-medium text-xs tracking-wide uppercase">Check-in Rate</span>
            <span className="font-bold text-lg text-indigo-600">{percentage}%</span>
          </div>
          <div className="relative">
            <Progress 
              value={percentage} 
              className="h-3 bg-slate-100 rounded-full overflow-hidden [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-violet-500" 
            />
          </div>
        </div>

        {/* Dynamic Highlight Metrics Grid */}
        {showDetails && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-b from-emerald-50/60 to-emerald-50/10 border border-emerald-500/10 shadow-[0_2px_8px_rgba(16,185,129,0.02)]">
              <p className="text-[11px] font-bold text-emerald-600 tracking-wider uppercase mb-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Checked In
              </p>
              <p className="text-2xl font-black text-slate-800 tracking-tight">{checkedInCount}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-b from-slate-50/80 to-slate-50/10 border border-slate-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1">
                Remaining
              </p>
              <p className="text-2xl font-black text-slate-700 tracking-tight">{remainingCount}</p>
            </div>
          </div>
        )}

        {/* Live Active Record Footer Segment */}
        {(lastCheckinName || lastCheckinTime) && (
          <div className="pt-3.5 border-t border-slate-200/50">
            <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-white/40 p-2.5 rounded-xl border border-slate-100">
              <Users className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1 leading-normal">
                <span className="text-slate-400 font-medium">Last Check-in:</span>{' '}
                <span className="font-semibold text-slate-800 truncate inline-block max-w-full align-bottom">
                  {lastCheckinName || '—'}
                </span>
                {lastCheckinTime && (
                  <span className="text-slate-400 block mt-0.5 font-medium">
                    🕒 {lastCheckinTime}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* System Informative Notices */}
        {!isComplete && totalTickets > 0 && (
          <div className="pt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-500/5 border border-amber-500/10 py-2 px-3 rounded-xl">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
            <span>{remainingCount} more attendee{remainingCount !== 1 ? 's' : ''} expected</span>
          </div>
        )}

        {totalTickets === 0 && (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-xs font-medium text-slate-400 max-w-[200px] mx-auto leading-relaxed">
              No active tickets issued. Metrics initialization waiting for purchases.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}