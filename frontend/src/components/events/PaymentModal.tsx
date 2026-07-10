/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PaymentModal Component
 * 
 * Modal for processing Mobile Money payments (MTN Momo and Orange Money).
 * Handles phone number input, payment method selection, and processing states.
 * 
 * @module PaymentModal
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Loader2, Smartphone, CreditCard, Shield } from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  eventId: string
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

export function PaymentModal({
  open,
  onClose,
  eventId,
  ticketType,
  attendeeName,
  quantity,
  onSuccess,
  onError,
}: PaymentModalProps) {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'orange'>('mtn')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const TEST_PHONE = '237612345678'

  const totalAmount = ticketType.price * quantity

  const validatePhoneNumber = (phone: string): boolean => {
    // Cameroon phone number format: 237XXXXXXXXX (12 digits total)
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length === 12 && cleanPhone.startsWith('237')
  }

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 12)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const doCreateOrder = async (phone: string, onDone: (orderId: string) => void) => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (!validatePhoneNumber(cleanPhone)) {
      setErrorMessage('Please enter a valid Cameroon phone number (e.g., 237 612 345 678)')
      return
    }

    setErrorMessage(null)
    setIsProcessing(true)

    try {
      const response = await api.post('/orders', {
        event_id: eventId,
        ticket_type_id: ticketType.id,
        attendee_name: attendeeName,
        attendee_phone: cleanPhone,
        quantity: quantity,
      })

      setPhoneNumber('')
      onDone(response.data.id)
      onClose()
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = () => doCreateOrder(phoneNumber, onSuccess)

  const handleClose = () => {
    if (!isProcessing) {
      setPhoneNumber('')
      setErrorMessage(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Complete Payment</DialogTitle>
          <DialogDescription>
            Select your payment method and enter your phone number
          </DialogDescription>
        </DialogHeader>

            {/* Order Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Event:</span>
                <span className="font-medium">{eventId.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ticket:</span>
                <span>{ticketType.name} × {quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Attendee:</span>
                <span>{attendeeName}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span className="text-primary text-lg">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <Label className="mb-2 block">Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as 'mtn' | 'orange')}
                className="grid grid-cols-2 gap-3"
              >
                <div
                  className={cn(
                    "flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-all",
                    paymentMethod === 'mtn' && "border-primary bg-primary/5"
                  )}
                  onClick={() => setPaymentMethod('mtn')}
                >
                  <RadioGroupItem value="mtn" id="mtn" />
                  <Label htmlFor="mtn" className="flex items-center gap-2 cursor-pointer">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">M</span>
                    </div>
                    MTN Momo
                  </Label>
                </div>
                <div
                  className={cn(
                    "flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-all",
                    paymentMethod === 'orange' && "border-primary bg-primary/5"
                  )}
                  onClick={() => setPaymentMethod('orange')}
                >
                  <RadioGroupItem value="orange" id="orange" />
                  <Label htmlFor="orange" className="flex items-center gap-2 cursor-pointer">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">O</span>
                    </div>
                    Orange Money
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Phone Number Input */}
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative mt-1">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="237 612 345 678"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enter the phone number registered with {paymentMethod === 'mtn' ? 'MTN' : 'Orange'}
              </p>
            </div>

            <div className="space-y-2">
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handlePayment} disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Pay {formatCurrency(totalAmount)}
                </Button>
              </DialogFooter>
              {errorMessage && (
                <p className="text-sm text-red-500 text-center font-medium">{errorMessage}</p>
              )}
              <div className="flex gap-2 justify-center border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs"
                  disabled={isProcessing}
                  onClick={() => {
                    const phone = phoneNumber.replace(/\D/g, '')
                    if (!validatePhoneNumber(phone)) {
                      setPhoneNumber(TEST_PHONE)
                      setErrorMessage('Test phone 237612345678 auto-filled — click again')
                      return
                    }
                    doCreateOrder(phone, onSuccess)
                  }}
                >
                  Simulate Success
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                  disabled={isProcessing}
                  onClick={() => {
                    const phone = phoneNumber.replace(/\D/g, '')
                    if (!validatePhoneNumber(phone)) {
                      setPhoneNumber(TEST_PHONE)
                      setErrorMessage('Test phone 237612345678 auto-filled — click again')
                      return
                    }
                    doCreateOrder(phone, (orderId) => {
                      router.push(`/payment/cancel?error=Payment+declined+by+provider&order_id=${orderId}`)
                    })
                  }}
                >
                  Simulate Failure
                </Button>
              </div>
            </div>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <Shield className="h-3 w-3" />
          <span>Secured by EventHub • Your payment information is encrypted</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}