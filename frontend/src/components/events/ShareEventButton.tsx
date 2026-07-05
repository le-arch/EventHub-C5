/**
 * ShareEventButton Component
 * 
 * Button for sharing event links via WhatsApp.
 * Generates WhatsApp share URL with pre-filled message containing event details.
 * 
 * @module ShareEventButton
 */

'use client'

import { useState } from 'react'
import { Share2, Check, Copy, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface ShareEventButtonProps {
  eventId: string
  eventTitle: string
  eventDate: string
  venue: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
}

export function ShareEventButton({
  eventId,
  eventTitle,
  eventDate,
  venue,
  className,
  variant = 'default',
}: ShareEventButtonProps) {
  const [copied, setCopied] = useState(false)

  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/e/${eventId}`
  
  const whatsappMessage = encodeURIComponent(
    `🎟️ Join me at ${eventTitle}!\n\n` +
    `📅 Date: ${formatDate(eventDate)}\n` +
    `📍 Venue: ${venue}\n\n` +
    `Click here to get your ticket:\n${eventUrl}`
  )

  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
      setCopied(true)
      toast.success('Event link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          text: `Join me at ${eventTitle} on ${formatDate(eventDate)} at ${venue}`,
          url: eventUrl,
        })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share')
        }
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Share Event
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white">
        <DropdownMenuItem onClick={() => window.open(whatsappUrl, '_blank')}>
          <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
          Share via WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareNative}>
          <Share2 className="h-4 w-4 mr-2" />
          Share via...
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy Event Link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}