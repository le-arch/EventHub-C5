/**
 * CheckinSuccess Component
 * 
 * Success modal/notification displayed after successful check-in.
 * Shows attendee details and provides visual feedback.
 * Auto-dismisses after a few seconds.
 * 
 * @module CheckinSuccess
 */

'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X, User, Ticket, Clock } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { formatTime } from '@/src/lib/utils'

interface CheckinSuccessProps {
  attendeeName: string
  ticketType: string
  checkedInAt: string
  onDismiss?: () => void
  autoDismiss?: boolean
  autoDismissDelay?: number
}

export function CheckinSuccess({
  attendeeName,
  ticketType,
  checkedInAt,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 3000,
}: CheckinSuccessProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, autoDismissDelay)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, autoDismissDelay, onDismiss])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 z-50 animate-slide-up">
      <Card className="bg-green-50 border-green-200 shadow-lg overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Success Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-green-800">Check-in Successful!</h3>
              <p className="text-sm text-green-700 mt-1">
                <span className="font-medium">{attendeeName}</span> has been checked in.
              </p>
              
              <div className="mt-2 space-y-1 text-xs text-green-600">
                <div className="flex items-center gap-2">
                  <Ticket className="h-3 w-3" />
                  <span>{ticketType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>Checked in at {formatTime(checkedInAt)}</span>
                </div>
              </div>
            </div>
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-100"
              onClick={() => {
                setIsVisible(false)
                onDismiss?.()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress Bar for Auto-dismiss */}
        {autoDismiss && (
          <div className="h-1 bg-green-200">
            <div 
              className="h-full bg-green-500 transition-all duration-linear"
              style={{ 
                width: '100%',
                animation: `shrink ${autoDismissDelay}ms linear forwards`
              }}
            />
          </div>
        )}
      </Card>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}