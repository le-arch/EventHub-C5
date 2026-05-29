/**
 * RecentCheckins Component
 * 
 * Displays a list of recent check-in activities.
 * Shows attendee name, ticket type, and check-in time.
 * 
 * @module RecentCheckins
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { Clock, CheckCircle, Users } from 'lucide-react'
import { formatTime } from '@/src/lib/utils'

// Types
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

/**
 * Get initials from attendee name
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Get random color for avatar (consistent per name)
 */
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-green-100 text-green-600',
    'bg-purple-100 text-purple-600',
    'bg-amber-100 text-amber-600',
    'bg-pink-100 text-pink-600',
    'bg-indigo-100 text-indigo-600',
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
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (displayCheckins.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No check-ins yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Check-ins will appear here once attendees arrive
            </p>
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
        <div className="space-y-4">
          {displayCheckins.map((checkin) => (
            <div 
              key={checkin.id} 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className={getAvatarColor(checkin.attendeeName)}>
                  {getInitials(checkin.attendeeName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900 truncate">
                    {checkin.attendeeName}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {checkin.ticketType}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-500">
                    Checked in at {formatTime(checkin.checkedInAt)}
                  </p>
                </div>
              </div>
              
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            </div>
          ))}
        </div>

        {checkins.length > maxItems && (
          <p className="text-center text-sm text-gray-400 mt-4 pt-2 border-t">
            +{checkins.length - maxItems} more check-ins
          </p>
        )}
      </CardContent>
    </Card>
  )
}