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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/csrc/omponents/ui/label'
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group'
import { Loader2, Smartphone, CreditCard, Shield } from 'lucide-react'
import { formatCurrency } from '@/src/lib/utils'
import { cn } from '@/src/lib/utils'

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
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'orange'>('mtn')
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'form' | 'processing'>('form')

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

  const handlePayment = async () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    if (!validatePhoneNumber(cleanPhone)) {
      onError?.('Please enter a valid Cameroon phone number (e.g., 237 612 345 678)')
      return
    }

    setStep('processing')
    setIsProcessing(true)

    try {
      // Simulate API call - replace with actual API integration
      // const response = await api.post('/orders', {
      //   event_id: eventId,
      //   ticket_type_id: ticketType.id,
      //   attendee_name: attendeeName,
      //   attendee_phone: cleanPhone,
      //   quantity: quantity,
      //   payment_method: paymentMethod === 'mtn' ? 'mtn_momo' : 'orange_money',
      // })
      
      // Simulate delay for payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock success
      onSuccess('mock-order-id')
    } catch (error: any) {
      onError?.(error.response?.data?.error || 'Payment failed. Please try again.')
      setStep('form')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      setStep('form')
      setPhoneNumber('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 'form' ? 'Complete Payment' : 'Processing Payment'}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' 
              ? 'Select your payment method and enter your phone number'
              : 'Please check your phone and approve the payment request'}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' ? (
          <>
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Event:</span>
                <span className="font-medium">{eventId.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ticket:</span>
                <span>{ticketType.name} × {quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Attendee:</span>
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
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="237 612 345 678"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the phone number registered with {paymentMethod === 'mtn' ? 'MTN' : 'Orange'}
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handlePayment}>
                Pay {formatCurrency(totalAmount)}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Processing State */}
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4">
                <div className="w-full h-full rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Please check your phone</h3>
              <p className="text-gray-500 text-sm mb-2">
                We've sent a payment request to your {paymentMethod === 'mtn' ? 'MTN Momo' : 'Orange Money'}.
              </p>
              <p className="text-gray-400 text-xs">
                Enter your PIN to complete the payment. This may take a few seconds.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="w-full">
                Cancel Payment
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
          <Shield className="h-3 w-3" />
          <span>Secured by EventHub • Your payment information is encrypted</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}