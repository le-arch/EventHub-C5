/**
 * Payment Types
 * 
 * Type definitions for payment processing, webhooks, and payment methods.
 * 
 * @module PaymentTypes
 */

import { PaymentMethod, PaymentStatus } from './order'

// Payment Provider Types
export type PaymentProvider = 'mtn_momo' | 'orange_money'

// Payment Request
export interface PaymentRequest {
  orderId: string
  amount: number
  currency: string
  phoneNumber: string
  provider: PaymentProvider
  description?: string
  callbackUrl?: string
}

// Payment Response
export interface PaymentResponse {
  success: boolean
  transactionId: string
  reference: string
  status: PaymentStatus
  message?: string
  providerReference?: string
}

// Payment Webhook Payload
export interface PaymentWebhookPayload {
  transactionId: string
  orderId?: string
  reference: string
  status: 'success' | 'failed' | 'pending'
  amount: number
  currency: string
  phoneNumber: string
  provider: PaymentProvider
  providerReference?: string
  timestamp: string
  signature?: string
}

// Payment Status Response
export interface PaymentStatusResponse {
  transactionId: string
  status: PaymentStatus
  amount: number
  paidAt?: string
  failureReason?: string
}

// Payment Method Configuration
export interface PaymentMethodConfig {
  id: PaymentMethod
  name: string
  displayName: string
  icon: string
  color: string
  bgColor: string
  feePercentage: number
  feeFixed: number
  minAmount: number
  maxAmount: number
  enabled: boolean
  phoneRegex: RegExp
  phoneFormat: string
}

// Mobile Money Account Info
export interface MobileMoneyAccount {
  phoneNumber: string
  provider: PaymentProvider
  balance?: number
  accountStatus?: 'active' | 'inactive' | 'suspended'
  lastTransaction?: string
}

// Transaction Record
export interface Transaction {
  id: string
  transactionId: string
  orderId: string
  amount: number
  currency: string
  provider: PaymentProvider
  status: PaymentStatus
  phoneNumber: string
  reference: string
  providerReference?: string
  failureReason?: string
  createdAt: string
  completedAt?: string
}

// Refund Request
export interface RefundRequest {
  transactionId: string
  orderId: string
  amount: number
  reason: string
  initiatedBy: string
}

// Refund Response
export interface RefundResponse {
  success: boolean
  refundId: string
  transactionId: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  message?: string
}