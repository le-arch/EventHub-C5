'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AlertCircle, Smartphone, Shield, CheckCircle, QrCode, Loader2, Share2, Copy, Check } from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'

const USSD_CODES = {
  mtn: { dial: '*126#', short: '*126#', name: 'MTN Momo' },
  orange: { dial: '#150#', short: '#150#', name: 'Orange Money' },
} as const

const PIN_RANGES = {
  mtn: { min: 10000, max: 99999, label: '5-digit PIN' },
  orange: { min: 1000, max: 9999, label: '4-digit PIN' },
} as const

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  eventId: string
  eventTitle: string
  ticketType: {
    id: string
    name: string
    price: number
  }
  attendeeName: string
  quantity: number
  onSuccess: (orderId: string) => void
  onError?: (error: string) => void
}

type Step = 'form' | 'ussd' | 'processing' | 'success'
type PaymentMethod = 'mtn' | 'orange'

export function PaymentModal({
  open,
  onClose,
  eventId,
  eventTitle,
  ticketType,
  attendeeName,
  quantity,
  onSuccess,
  onError,
}: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<Step>('form')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pinValue, setPinValue] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [progressMessage, setProgressMessage] = useState('')
  const [ussdPhase, setUssdPhase] = useState<'dialing' | 'received'>('dialing')

  // Auto-pop USSD message after 1.5s
  useEffect(() => {
    if (step === 'ussd' && ussdPhase === 'dialing') {
      const timer = setTimeout(() => setUssdPhase('received'), 1500)
      return () => clearTimeout(timer)
    }
  }, [step, ussdPhase])

  const totalAmount = ticketType.price * quantity

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length === 9
  }

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (raw.length > 9) return
    const formatted = formatPhoneNumber(raw)
    setPhoneNumber(formatted)
    if (errorMessage) setErrorMessage(null)
  }

  const handlePayment = () => {
    if (!paymentMethod) {
      setErrorMessage('Please select a payment method')
      return
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '')
    if (!validatePhoneNumber(cleanPhone)) {
      setErrorMessage('Please enter a valid Cameroon phone number (e.g., 612 345 678)')
      return
    }

    setErrorMessage(null)
    setStep('ussd')
  }

  const handlePinSubmit = () => {
    if (!paymentMethod) return
    const range = PIN_RANGES[paymentMethod]
    const pinNum = Number(pinValue)

    if (pinNum < range.min || pinNum > range.max || isNaN(pinNum)) {
      setPinError(`Please enter a valid ${range.label} (${range.min} – ${range.max})`)
      return
    }

    setPinError(null)
    setStep('processing')
    setIsProcessing(true)
    simulatePayment()
  }

  const simulatePayment = async () => {
    setProgressMessage('Verifying payment details...')
    await delay(1500)
    setProgressMessage('Connecting to mobile money provider...')
    await delay(1500)
    setProgressMessage('Processing payment...')
    await delay(1500)
    setProgressMessage('Payment confirmed! Generating your ticket...')

    try {
      const cleanPhone = '237' + phoneNumber.replace(/\D/g, '')
      const response = await api.post('/orders', {
        event_id: eventId,
        ticket_type_id: ticketType.id,
        attendee_name: attendeeName,
        attendee_phone: cleanPhone,
        quantity: quantity,
      })

      setOrderId(response.data.id)
      setStep('success')
      setIsProcessing(false)
      setProgressMessage('')
      onSuccess(response.data.id)
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Payment failed. Please try again.'
      setErrorMessage(msg)
      onError?.(msg)
      setStep('form')
      setIsProcessing(false)
      setProgressMessage('')
    }
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const handleClose = () => {
    if (!isProcessing) {
      setStep('form')
      setPhoneNumber('')
      setPaymentMethod(null)
      setErrorMessage(null)
      setPinValue('')
      setPinError(null)
      setOrderId(null)
      setProgressMessage('')
      setUssdPhase('dialing')
      onClose()
    }
  }

  const handleRetry = () => {
    setStep('form')
    setErrorMessage(null)
    setPinValue('')
    setPinError(null)
    setProgressMessage('')
    setUssdPhase('dialing')
    setIsProcessing(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-popover">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">
            {step === 'form' && 'Complete Payment'}
            {step === 'ussd' && 'Confirm Payment'}
            {step === 'processing' && 'Processing Payment'}
            {step === 'success' && 'Payment Successful'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 'form' && 'Select your payment method and enter your phone number'}
            {step === 'ussd' && ussdPhase === 'dialing' && 'Dial the USSD code on your phone to authorize payment'}
            {step === 'ussd' && ussdPhase === 'received' && 'Enter your PIN to confirm the payment'}
            {step === 'processing' && progressMessage}
            {step === 'success' && 'Your ticket QR code is ready'}
          </DialogDescription>
        </DialogHeader>

        {/* FORM STEP */}
        {step === 'form' && (
          <>
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="bg-muted/50 rounded-xl p-4 space-y-2 border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Event:</span>
                <span className="font-medium text-foreground">{eventTitle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ticket:</span>
                <span className="text-foreground">{ticketType.name} &times; {quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Attendee:</span>
                <span className="text-foreground">{attendeeName}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                <span className="text-foreground">Total:</span>
                <span className="text-primary text-lg">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-foreground">Payment Method <span className="text-destructive">*</span></Label>
              <RadioGroup
                value={paymentMethod ?? ''}
                onValueChange={(v) => {
                  setPaymentMethod(v as PaymentMethod)
                  if (errorMessage) setErrorMessage(null)
                }}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="mtn"
                  className={cn(
                    "flex items-center gap-2 border-2 rounded-lg p-3 cursor-pointer transition-all relative",
                    "border-border hover:border-primary/50",
                    paymentMethod === 'mtn' && "border-primary bg-primary/10 ring-1 ring-primary/30"
                  )}
                >
                  <RadioGroupItem value="mtn" id="mtn" />
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <span className="text-foreground flex-1">MTN Momo</span>
                  {paymentMethod === 'mtn' && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </Label>
                <Label
                  htmlFor="orange"
                  className={cn(
                    "flex items-center gap-2 border-2 rounded-lg p-3 cursor-pointer transition-all relative",
                    "border-border hover:border-primary/50",
                    paymentMethod === 'orange' && "border-primary bg-primary/10 ring-1 ring-primary/30"
                  )}
                >
                  <RadioGroupItem value="orange" id="orange" />
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">O</span>
                  </div>
                  <span className="text-foreground flex-1">Orange Money</span>
                  {paymentMethod === 'orange' && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="612 345 678"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enter the number registered with {paymentMethod === 'mtn' ? 'MTN' : paymentMethod === 'orange' ? 'Orange' : 'your mobile money provider'}
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={!paymentMethod}>
                Pay {formatCurrency(totalAmount)}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* USSD STEP */}
        {step === 'ussd' && paymentMethod && (
          <>
            {ussdPhase === 'dialing' ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-20 h-20 mx-auto relative">
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center border-2 border-border animate-pulse">
                    <Smartphone className="h-10 w-10 text-foreground" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">Dial USSD Code</h3>
                  <p className="text-muted-foreground text-sm">
                    On your phone, dial <strong className="text-foreground font-mono text-base">{USSD_CODES[paymentMethod].dial}</strong> and authorize the payment of <strong className="text-foreground">{formatCurrency(totalAmount)}</strong>
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">Provider: {USSD_CODES[paymentMethod].name}</p>
                  <p className="text-xs text-muted-foreground">Amount: {formatCurrency(totalAmount)}</p>
                  <p className="text-xs text-muted-foreground">Phone: 237 {phoneNumber.replace(/\D/g, '')}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Waiting for USSD response...
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">USSD Message Received</p>
                    <p className="text-xs text-muted-foreground">
                      A USSD prompt has been sent to 237 {phoneNumber.replace(/\D/g, '')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-foreground">Enter {PIN_RANGES[paymentMethod].label} to confirm</Label>
                  <Input
                    type="password"
                    placeholder={paymentMethod === 'mtn' ? 'Enter 5-digit PIN' : 'Enter 4-digit PIN'}
                    value={pinValue}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '')
                      const maxLen = paymentMethod === 'mtn' ? 5 : 4
                      if (digits.length <= maxLen) {
                        setPinValue(digits)
                        setPinError(null)
                      }
                    }}
                    maxLength={paymentMethod === 'mtn' ? 5 : 4}
                    className="text-center text-lg tracking-[0.5em]"
                  />
                  {pinError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {pinError}
                    </p>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {ussdPhase === 'received' && (
                <Button onClick={handlePinSubmit} disabled={pinValue.length === 0}>
                  Confirm Payment
                </Button>
              )}
            </DialogFooter>
          </>
        )}

        {/* PROCESSING STEP */}
        {step === 'processing' && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 mx-auto relative">
              <div className="w-full h-full rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-1">Processing Payment</h3>
              <p className="text-muted-foreground text-sm min-h-[1.25rem] transition-all duration-500">
                {progressMessage || 'Please wait while we process your payment...'}
              </p>
            </div>

            {/* Progress stages */}
            <div className="max-w-xs mx-auto space-y-2">
              {[
                { label: 'Verifying payment details', done: progressMessage !== 'Verifying payment details...' },
                { label: 'Connecting to mobile money provider', done: progressMessage !== 'Verifying payment details...' && progressMessage !== 'Connecting to mobile money provider...' },
                { label: 'Processing payment', done: progressMessage === 'Payment confirmed! Generating your ticket...' },
                { label: 'Generating your ticket', done: false },
              ].map((stage, i) => (
                <div key={i} className="flex items-center gap-3 text-left">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-500",
                    stage.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {stage.done ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-sm transition-all duration-300",
                    stage.done ? "text-foreground font-medium line-through opacity-60" : "text-muted-foreground"
                  )}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === 'success' && orderId && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Payment Successful!</h3>
              <p className="text-muted-foreground text-sm mt-1">Your payment has been confirmed</p>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-4 flex flex-col items-center gap-3">
              <p className="text-xs text-muted-foreground">Your ticket QR code</p>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <QRCodeSVG value={orderId} size={160} level="H" />
              </div>
              <div className="w-full space-y-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => {
                    const url = `${window.location.origin}/ticket/${orderId}`
                    window.open(`https://wa.me/?text=${encodeURIComponent(`Here is my ticket: ${url}`)}`, '_blank')
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  Share via WhatsApp
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-muted-foreground"
                  onClick={() => {
                    const url = `${window.location.origin}/ticket/${orderId}`
                    navigator.clipboard.writeText(url)
                    toast.success('Ticket link copied!')
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy ticket link
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Order #{orderId.slice(0, 8)}</p>
            </div>
            <DialogFooter className="!mt-4">
              <Button
                className="w-full"
                onClick={() => {
                  handleClose()
                  window.location.href = `/ticket/${orderId}`
                }}
              >
                <QrCode className="h-4 w-4 mr-2" />
                View Your Ticket
              </Button>
            </DialogFooter>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <Shield className="h-3 w-3" />
          <span>Secured by EventHub &bull; Your payment information is encrypted</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
