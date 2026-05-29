/**
 * Payment Methods Constants
 * 
 * Defines all supported payment methods with their configurations,
 * display names, colors, and icons.
 * 
 * @module PaymentMethodsConstants
 */

export const PAYMENT_METHODS = {
  MTN_MOMO: 'mtn_momo',
  ORANGE_MONEY: 'orange_money',
} as const

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]

// Payment method configuration for UI
export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, {
  label: string
  shortLabel: string
  color: string
  bgColor: string
  hoverColor: string
  textColor: string
  borderColor: string
  icon: string
  feePercentage: number
  feeFixed: number
  description: string
  phoneFormat: string
  phoneRegex: RegExp
}> = {
  [PAYMENT_METHODS.MTN_MOMO]: {
    label: 'MTN Mobile Money',
    shortLabel: 'MTN Momo',
    color: '#FFCC00',
    bgColor: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    textColor: 'text-yellow-900',
    borderColor: 'border-yellow-200',
    icon: '📱',
    feePercentage: 0.5,
    feeFixed: 0,
    description: 'Pay using your MTN Mobile Money account',
    phoneFormat: '237 6X XX XX XX',
    phoneRegex: /^237[6-9][0-9]{9}$/,
  },
  [PAYMENT_METHODS.ORANGE_MONEY]: {
    label: 'Orange Money',
    shortLabel: 'Orange Money',
    color: '#FF6600',
    bgColor: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    textColor: 'text-orange-900',
    borderColor: 'border-orange-200',
    icon: '📱',
    feePercentage: 0.5,
    feeFixed: 0,
    description: 'Pay using your Orange Money account',
    phoneFormat: '237 6X XX XX XX',
    phoneRegex: /^237[6-9][0-9]{9}$/,
  },
}

// Get payment method by key
export const getPaymentMethod = (key: string): PaymentMethod | null => {
  const method = Object.values(PAYMENT_METHODS).find(m => m === key)
  return method || null
}

// Check if payment method is valid
export const isValidPaymentMethod = (method: string): method is PaymentMethod => {
  return Object.values(PAYMENT_METHODS).includes(method as PaymentMethod)
}

// Get payment method label
export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  return PAYMENT_METHOD_CONFIG[method]?.label || method
}

// Get payment method color
export const getPaymentMethodColor = (method: PaymentMethod): string => {
  return PAYMENT_METHOD_CONFIG[method]?.color || '#000000'
}

// Calculate total with fees
export const calculateTotalWithFees = (amount: number, method: PaymentMethod): number => {
  const config = PAYMENT_METHOD_CONFIG[method]
  const fees = amount * (config.feePercentage / 100) + config.feeFixed
  return Math.ceil(amount + fees)
}