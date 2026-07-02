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
import { Download, CheckCircle, Home, Calendar, MapPin, Share2, User, Ticket, Layers, CreditCard, ShieldCheck } from 'lucide-react'

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
}

export default function TicketPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const qrRef = useRef<HTMLDivElement>(null)

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadCount, setDownloadCount] = useState(0)

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
      const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement
      if (canvas && typeof navigator.share === 'function') {
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png')
        })
        const file = new File([blob], 'ticket.png', { type: 'image/png' })
        
        await navigator.share({
          title: `Ticket for ${order.eventTitle}`,
          text: `Here's my ticket for ${order.eventTitle}!`,
          files: [file],
        })
        toast.success('Ticket shared successfully')
      } else {
        downloadQRCode()
      }
    } catch (error) {
      console.error('Share failed:', error)
    }
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
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased py-12 px-4 relative overflow-hidden">
      
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-200/10 rounded-full blur-[100px] pointer-events-none z-0" />
      
      <div className="max-w-md mx-auto relative z-10 space-y-6">
        
        {/* Success Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-2xl mb-2 text-emerald-600 shadow-sm">
            <CheckCircle className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payment Successful</h1>
          <p className="text-sm font-medium text-slate-500">Thank you for your purchase, {order.attendeeName}</p>
        </div>

        {/* Ticket Card Cardboard-Style Layout */}
        <Card className="bg-white border-slate-200/80 shadow-md shadow-slate-100 rounded-2xl overflow-hidden animate-slide-up">
          
          {/* Ticket Header Banner */}
          <div className="bg-slate-900 p-5 text-white text-center space-y-1">
            <Badge className="bg-white/10 hover:bg-white/10 text-white border-none text-[10px] uppercase font-bold tracking-wider rounded px-2 py-0.5">
              Verified Event Access
            </Badge>
            <h2 className="font-bold text-base tracking-tight leading-tight pt-1">{order.eventTitle}</h2>
          </div>

          {/* QR Code Presentation Matrix */}
          <CardContent className="pt-8 pb-6 text-center bg-slate-50/50">
            <div className="bg-white p-4 rounded-2xl inline-block mx-auto border border-slate-200/60 shadow-sm">
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
            <p className="text-xs font-semibold text-slate-400 mt-4 max-w-[240px] mx-auto leading-normal">
              Present this cryptographically signed verification asset during venue entry gate processing.
            </p>
          </CardContent>

          {/* Dotted Intersecting Separator Component */}
          <div className="relative flex items-center justify-between px-0 bg-slate-50/50">
            <div className="w-3 h-6 bg-slate-50 rounded-r-full border-r border-t border-b border-slate-200/80 -ml-[1px]" />
            <Separator className="border-dashed border-slate-200 bg-transparent flex-1 mx-2" />
            <div className="w-3 h-6 bg-slate-50 rounded-l-full border-l border-t border-b border-slate-200/80 -mr-[1px]" />
          </div>

          {/* Scheduled Logistics Grid */}
          <CardContent className="py-5 px-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5 text-sm">
                <Calendar className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Date</span>
                  <p className="font-semibold text-slate-800">{formatDate(order.eventDate)}</p>
                  <p className="text-xs text-slate-500 font-medium">{formatTime(order.eventTime)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Venue</span>
                  <p className="font-semibold text-slate-800 line-clamp-1">{order.eventVenue}</p>
                  <p className="text-xs text-slate-500 font-medium">{order.eventCity}</p>
                </div>
              </div>
            </div>
          </CardContent>

          <Separator className="bg-slate-100" />

          {/* Pass Attendee Ledger Metadata */}
          <CardContent className="py-5 px-6 space-y-3 bg-slate-50/20 text-sm font-medium text-slate-600">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-400"><User className="h-3.5 w-3.5" /> Attendee</span>
              <span className="font-bold text-slate-800">{order.attendeeName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-400"><Ticket className="h-3.5 w-3.5" /> Access Tier</span>
              <span className="font-bold text-slate-800">{order.ticketType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-400"><Layers className="h-3.5 w-3.5" /> Volume Allocated</span>
              <span className="font-bold text-slate-800">{order.quantity}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
              <span className="flex items-center gap-2 text-slate-500 font-semibold"><CreditCard className="h-3.5 w-3.5" /> Final Clearing</span>
              <span className="font-extrabold text-slate-900 text-base">{formatCurrency(order.totalAmount)}</span>
            </div>
          </CardContent>

          <Separator className="bg-slate-100" />

          {/* Unique Identifier Core Info */}
          <CardContent className="py-4 text-center bg-slate-50/50 space-y-1">
            <Badge variant="outline" className="text-[10px] bg-white text-slate-500 border-slate-200 font-mono tracking-tight px-2.5">
              ID: {order.id.slice(0, 8).toUpperCase()}...
            </Badge>
            <p className="text-[11px] text-slate-400 font-medium">
              Settlement committed on {formatDate(order.createdAt)}
            </p>
          </CardContent>
        </Card>

        {/* Tactical Interaction Operations Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button 
            onClick={downloadQRCode} 
            className="w-full bg-slate-900 text-white hover:bg-slate-800 h-11 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Signature Asset (PNG)
          </Button>
          
          <Button 
            variant="outline" 
            onClick={shareTicket} 
            className="w-full bg-white text-slate-700 hover:bg-slate-50 border-slate-200 h-11 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share Validation Link
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')} 
            className="w-full text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 h-10 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Technical Gate Access Instructions */}
        <div className="pt-4 border-t border-slate-200/60 grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1.5 p-2 rounded-xl bg-slate-100/40 border border-slate-200/30">
            <div className="w-6 h-6 rounded-lg bg-slate-900/5 flex items-center justify-center text-slate-600 mx-auto">
              <Download className="h-3 w-3" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold leading-tight">Commit to Storage</p>
          </div>
          <div className="space-y-1.5 p-2 rounded-xl bg-slate-100/40 border border-slate-200/30">
            <div className="w-6 h-6 rounded-lg bg-slate-900/5 flex items-center justify-center text-slate-600 mx-auto">
              <Layers className="h-3 w-3" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold leading-tight">Present QR Token</p>
          </div>
          <div className="space-y-1.5 p-2 rounded-xl bg-slate-100/40 border border-slate-200/30">
            <div className="w-6 h-6 rounded-lg bg-slate-900/5 flex items-center justify-center text-slate-600 mx-auto">
              <ShieldCheck className="h-3 w-3" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold leading-tight">Single Clearance</p>
          </div>
        </div>
        
      </div>
    </div>
  )
}