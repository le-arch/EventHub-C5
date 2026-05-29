/**
 * ConfirmationDialog Component
 * 
 * Reusable confirmation modal for destructive actions or important decisions.
 * Supports different variants (danger, warning, info) and custom content.
 * 
 * @module ConfirmationDialog
 */

'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { AlertTriangle, Trash2, Info, HelpCircle } from 'lucide-react'
import { cn } from '@/src/lib/utils'

type DialogVariant = 'danger' | 'warning' | 'info' | 'question'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel?: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: DialogVariant
  isLoading?: boolean
  destructive?: boolean
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100',
    confirmButtonClass: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-100',
    confirmButtonClass: 'bg-amber-600 hover:bg-amber-700',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    confirmButtonClass: 'bg-blue-600 hover:bg-blue-700',
  },
  question: {
    icon: HelpCircle,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10',
    confirmButtonClass: 'bg-primary hover:bg-primary/90',
  },
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  destructive = true,
}: ConfirmationDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = () => {
    onConfirm()
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", config.bgColor)}>
              <Icon className={cn("h-5 w-5", config.iconColor)} />
            </div>
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-3">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={cn(destructive && config.confirmButtonClass)}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}