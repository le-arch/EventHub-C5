/**
 * RecentCheckins Component
 * * Displays an elegant, structured stream list of recent check-in events.
 * Shows responsive identifier tags, custom avatars, and live confirmation metrics.
 * * @module RecentCheckins
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock, CheckCircle2, Users, ArrowUpRight } from 'lucide-react'
import { formatTime, cn } from '@/lib/utils'

interface CheckinRecord {
  id: string
  attendeeName: string
  ticketType: string
  checkedInAt: string
  avatarColor?: string
}

interface RecentCheckinsProps {
  checkins: CheckinRecord[]
  isLoading?: boolean
  title?: string
  description?: string
  maxItems?: number
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'bg-violet-500/10 text-violet-600 border-violet-500/20',
    'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'bg-rose-500/10 text-rose-600 border-rose-500/20',
    'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  ]
  const index = name.length % colors.length
  return colors[index]
}

export function RecentCheckins({
  checkins,
  isLoading = false,
  title = "Recent Check-ins",
  description = "Latest attendees checked in",
  maxItems = 10,
}: RecentCheckinsProps) {
  const displayCheckins = checkins.slice(0, maxItems)

  if (isLoading) {
    return (
      <Card className="shadow-[0_8px_32px_rgba(0,0,0,0.02)] border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl">
        <CardHeader className="space-y-2">
          <div className="h-5 w-1/3 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-4 w-1/2 bg-slate-100 animate-pulse rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-slate-100 animate-pulse rounded" />
                <div className="h-3 w-1/4 bg-slate-50 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (displayCheckins.length === 0) {
    return (
      <Card className="shadow-[0_8px_32px_rgba(0,0,0,0.02)] border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800 tracking-tight">{title}</CardTitle>
          <CardDescription className="text-slate-500 text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 border border-dashed border-slate-200/80 bg-slate-50/30 rounded-xl">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-2.5 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-700">No Check-ins Recorded</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
              Real-time attendance feeds activate automatically as ticket confirmations process live.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-[0_8px_32px_rgba(0,0,0,0.02)] border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-slate-800 tracking-tight">{title}</CardTitle>
          <CardDescription className="text-slate-500 text-sm">{description}</CardDescription>
        </div>
        <Badge variant="outline" className="bg-slate-100/60 text-slate-600 border-slate-200/60 rounded-lg text-xs font-medium py-0.5 px-2">
          Live stream
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="divide-y divide-slate-100">
          {displayCheckins.map((checkin) => (
            <div 
              key={checkin.id} 
              className="flex items-center gap-3.5 py-3 first:pt-1 last:pb-1 transition-all group rounded-xl hover:bg-white/40 px-2 -mx-2"
            >
              <Avatar className="h-10 w-10 border shadow-sm rounded-xl">
                <AvatarFallback className={cn("rounded-xl text-xs font-bold border", getAvatarColor(checkin.attendeeName))}>
                  {getInitials(checkin.attendeeName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm text-slate-800 truncate tracking-tight">
                    {checkin.attendeeName}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className="text-[10px] font-bold tracking-wide uppercase px-1.5 py-0 bg-slate-100 text-slate-600 border border-slate-200/40 rounded-md"
                  >
                    {checkin.ticketType}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <p className="text-[11px] font-medium text-slate-400">
                    Checked in {formatTime(checkin.checkedInAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity pl-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 stroke-[2.5]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {checkins.length > maxItems && (
          <div className="text-center mt-3 pt-3 border-t border-slate-100">
            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 transition-colors group focus:outline-none">
              View all +{checkins.length - maxItems} additional records
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}