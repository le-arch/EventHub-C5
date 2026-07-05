/**
 * Ticket Download Page
 * * Displays the QR code ticket after successful payment.
 * Allows attendee to download the QR code as PNG image.
 * * @module TicketPage
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, CheckCircle, Home, Calendar, MapPin, Share2, User, Ticket, Layers, CreditCard, ShieldCheck, Ban, Copy, MessageCircle, Check } from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

// Utilities
import api from '@/lib/api'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface OrderDetails {
  id: string
  attendeeName: string
  attendeePhone: string
  ticketType: string
  quantity: number
  unitPrice: number
  totalAmount: number
  eventTitle: string
  eventDate: string
  eventTime: string
  eventVenue: string
  eventCity: string
  qrCodeData: string
  createdAt: string
  checkedIn?: boolean
  checkedInAt?: string | null
}

export default function TicketPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const qrRef = useRef<HTMLDivElement>(null)

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadCount, setDownloadCount] = useState(0)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/orders/${orderId}/details`)
      setOrder(response.data)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Ticket not found'
      toast.error(errorMessage)
      router.push('/')
    } finally {
      loading && setLoading(false)
    }
  }

  const downloadQRCode = async () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      const filename = `ticket_${order?.eventTitle?.replace(/\s/g, '_')}_${order?.attendeeName?.replace(/\s/g, '_')}.png`
      downloadLink.href = pngUrl
      downloadLink.download = filename
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      
      setDownloadCount(prev => prev + 1)
      toast.success('QR code downloaded successfully')
    }
  }

  const shareTicket = async () => {
    if (!order) return
    
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: `Ticket for ${order.eventTitle}`,
          text: `Here's my ticket for ${order.eventTitle}!`,
          url: `${window.location.origin}/ticket/${order.id}`,
        })
        toast.success('Ticket shared successfully')
        return
      }
    } catch {}

    setShowShareOptions(true)
  }

  const shareViaWhatsApp = () => {
    if (!order) return
    const url = `${window.location.origin}/ticket/${order.id}`
    window.open(`https://wa.me/?text=${encodeURIComponent(`Here is my ticket for ${order.eventTitle}: ${url}`)}`, '_blank')
    setShowShareOptions(false)
  }

  const copyTicketLink = () => {
    if (!order) return
    const url = `${window.location.origin}/ticket/${order.id}`
    navigator.clipboard.writeText(url)
    setLinkCopied(true)
    toast.success('Ticket link copied!')
    setTimeout(() => setLinkCopied(false), 2000)
    setShowShareOptions(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-slate-200/80 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-40 w-40 mx-auto mb-6 rounded-xl" />
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="min-h-screen bg-background text-foreground antialiased py-12 px-4 relative overflow-hidden">
      
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />
      
      <div className="max-w-md mx-auto relative z-10 space-y-6">
        
        {/* Success Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl mb-2 text-primary shadow-sm">
            <CheckCircle className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Payment Successful</h1>
          <p className="text-sm font-medium text-muted-foreground">Thank you for your purchase, {order.attendeeName}</p>
        </div>

        {/* Ticket Card Cardboard-Style Layout */}
        <Card className="bg-card border-border shadow-md shadow-black/5 rounded-2xl overflow-hidden animate-slide-up">
          
          {/* Ticket Header Banner */}
          <div className="bg-foreground p-5 text-background text-center space-y-1">
            <Badge className="bg-white/10 hover:bg-white/10 text-white border-none text-[10px] uppercase font-bold tracking-wider rounded px-2 py-0.5">
              Event Ticket
            </Badge>
            <h2 className="font-bold text-base tracking-tight leading-tight pt-1">{order.eventTitle}</h2>
          </div>

          {/* QR Code Presentation Matrix */}
          <CardContent className="pt-8 pb-6 text-center bg-muted/20">
            {order.checkedIn ? (
              <div className="py-6 space-y-3">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto border border-warning/20">
                  <Ban className="h-7 w-7 text-warning" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Ticket Already Used</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This ticket was checked in{order.checkedInAt ? ` at ${formatTime(order.checkedInAt)}` : ''}.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-card p-4 rounded-2xl inline-block mx-auto border border-border/60 shadow-sm">
                  <div ref={qrRef} className="rounded-lg overflow-hidden">
                    <QRCodeCanvas
                      id="qr-code-canvas"
                      value={order.qrCodeData}
                      size={190}
                      level="H"
                      includeMargin={true}
                      bgColor="#FFFFFF"
                      fgColor="#0f172a"
                    />
                  </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground mt-4 max-w-[240px] mx-auto leading-normal">
                  Show this QR code at the venue entrance to check in.
                </p>
              </>
            )}
          </CardContent>

          {/* Ticket tear-off separator */}
          <div className="relative flex items-center justify-between px-0 bg-muted/20">
            <div className="w-3 h-6 bg-background rounded-r-full border-r border-t border-b border-border -ml-[1px]" />
            <Separator className="border-dashed border-border bg-transparent flex-1 mx-2" />
            <div className="w-3 h-6 bg-background rounded-l-full border-l border-t border-b border-border -mr-[1px]" />
          </div>

          {/* Event details */}
          <CardContent className="py-5 px-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 block">Date & Time</span>
                  <p className="font-semibold text-foreground">{formatDate(order.eventDate)}</p>
                  <p className="text-xs text-muted-foreground font-medium">{formatTime(order.eventTime)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 block">Venue</span>
                  <p className="font-semibold text-foreground line-clamp-1">{order.eventVenue}</p>
                  <p className="text-xs text-muted-foreground font-medium">{order.eventCity}</p>
                </div>
              </div>
            </div>
          </CardContent>

          <Separator className="bg-border" />

          {/* Attendee and payment details */}
          <CardContent className="py-5 px-6 space-y-3 bg-muted/10 text-sm font-medium text-muted-foreground">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-muted-foreground"><User className="h-3.5 w-3.5" /> Attendee</span>
              <span className="font-bold text-foreground">{order.attendeeName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-muted-foreground"><Ticket className="h-3.5 w-3.5" /> Access Tier</span>
              <span className="font-bold text-foreground">{order.ticketType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-muted-foreground"><Layers className="h-3.5 w-3.5" /> Volume Allocated</span>
              <span className="font-bold text-foreground">{order.quantity}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border mt-2">
              <span className="flex items-center gap-2 text-muted-foreground font-semibold"><CreditCard className="h-3.5 w-3.5" /> Final Clearing</span>
              <span className="font-extrabold text-foreground text-base">{formatCurrency(order.totalAmount)}</span>
            </div>
          </CardContent>

          <Separator className="bg-border" />

          {/* Unique Identifier Core Info */}
          <CardContent className="py-4 text-center bg-muted/20 space-y-1">
            <Badge variant="outline" className="text-[10px] bg-card text-muted-foreground border-border font-mono tracking-tight px-2.5">
              ID: {order.id.slice(0, 8).toUpperCase()}...
            </Badge>
            <p className="text-[11px] text-muted-foreground font-medium">
              Settlement committed on {formatDate(order.createdAt)}
            </p>
          </CardContent>
        </Card>

          {/* Action buttons */}
        <div className="space-y-2.5 pt-2">
          {!order.checkedIn && (
            <>
              <Button 
                onClick={downloadQRCode} 
                className="w-full bg-foreground text-background hover:bg-foreground/90 h-11 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download QR Code
              </Button>
              
              <div className="relative">
                <Button 
                  variant="outline" 
                  onClick={shareTicket} 
                  className="w-full bg-card text-foreground hover:bg-accent border-border h-11 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share Ticket
                </Button>

                {showShareOptions && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowShareOptions(false)} />
                    <div className="absolute bottom-full mb-2 left-0 right-0 z-50 bg-popover border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <button
                        onClick={shareViaWhatsApp}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        Share via WhatsApp
                      </button>
                      <button
                        onClick={copyTicketLink}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        {linkCopied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                        {linkCopied ? 'Copied!' : 'Copy ticket link'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')} 
            className="w-full text-muted-foreground hover:text-foreground hover:bg-accent h-10 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

          {/* What to do next */}
        <div className="pt-4 border-t border-border grid grid-cols-3 gap-3 text-center">
          {order.checkedIn ? (
            <div className="col-span-3 space-y-1.5 p-3 rounded-xl bg-warning/10 border border-warning/20">
              <div className="w-6 h-6 rounded-lg bg-warning/20 flex items-center justify-center text-warning mx-auto">
                <ShieldCheck className="h-3 w-3" />
              </div>
              <p className="text-[10px] text-warning font-bold leading-tight">This ticket has been used. It can no longer be used for entry.</p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5 p-2 rounded-xl bg-muted/40 border border-border/30">
                <div className="w-6 h-6 rounded-lg bg-foreground/5 flex items-center justify-center text-muted-foreground mx-auto">
                  <Download className="h-3 w-3" />
                </div>
                <p className="text-[10px] text-muted-foreground font-bold leading-tight">Download it</p>
              </div>
              <div className="space-y-1.5 p-2 rounded-xl bg-muted/40 border border-border/30">
                <div className="w-6 h-6 rounded-lg bg-foreground/5 flex items-center justify-center text-muted-foreground mx-auto">
                  <Layers className="h-3 w-3" />
                </div>
                <p className="text-[10px] text-muted-foreground font-bold leading-tight">Show at venue</p>
              </div>
              <div className="space-y-1.5 p-2 rounded-xl bg-muted/40 border border-border/30">
                <div className="w-6 h-6 rounded-lg bg-foreground/5 flex items-center justify-center text-muted-foreground mx-auto">
                  <ShieldCheck className="h-3 w-3" />
                </div>
                <p className="text-[10px] text-muted-foreground font-bold leading-tight">One-time use</p>
              </div>
            </>
          )}
        </div>
        
      </div>
    </div>
  )
}