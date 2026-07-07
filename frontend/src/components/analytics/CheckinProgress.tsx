/**
 * CheckinProgress Component
 * 
 * Displays check-in progress with a visual progress bar.
 * Shows percentage, counts, and recent activity.
 * 
 * @module CheckinProgress
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Users, TrendingUp } from 'lucide-react'

// Types
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
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse h-2 w-full bg-muted rounded-full" />
            <div className="animate-pulse h-4 w-32 bg-muted rounded mx-auto" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {isComplete && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Check-in Rate</span>
            <span className="font-semibold text-primary">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>

        {/* Stats Grid */}
        {showDetails && (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-xs text-muted-foreground">Checked In</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{checkedInCount}</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Not Checked</p>
              </div>
              <p className="text-2xl font-bold text-muted-foreground">{remainingCount}</p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {(lastCheckinName || lastCheckinTime) && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Last check-in: 
              <span className="font-medium text-foreground">{lastCheckinName || '—'}</span>
              {lastCheckinTime && (
                <span className="text-xs text-muted-foreground">at {lastCheckinTime}</span>
              )}
            </p>
          </div>
        )}

        {/* Status Message */}
        {!isComplete && totalTickets > 0 && (
          <div className="pt-2">
            <p className="text-sm text-amber-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {remainingCount} attendee{remainingCount !== 1 ? 's' : ''} still need to check in
            </p>
          </div>
        )}

        {totalTickets === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tickets sold yet. Check-in progress will appear once tickets are purchased.
          </p>
        )}
      </CardContent>
    </Card>
  )
}