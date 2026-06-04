/**
 * NameInput Component
 * 
 * Required name input component for attendees before proceeding to ticket selection.
 * Features validation, error messages, and smooth transitions.
 * 
 * @module NameInput
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, ArrowRight } from 'lucide-react'

// Name validation schema
const nameSchema = z.object({
  fullName: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Name can only contain letters and spaces'),
})

type NameFormData = z.infer<typeof nameSchema>

interface NameInputProps {
  eventTitle: string
  onSubmit: (name: string) => void
  isLoading?: boolean
}

export function NameInput({ eventTitle, onSubmit, isLoading = false }: NameInputProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: { fullName: '' },
  })

  const onFormSubmit = (data: NameFormData) => {
    setIsSubmitted(true)
    onSubmit(data.fullName)
  }

  return (
    <Card className="max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <User className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Enter Your Details</CardTitle>
        <CardDescription>
          Please provide your full name for ticket {eventTitle}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="fullName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="e.g., John Doe"
              {...register('fullName')}
              className="text-lg"
              autoFocus
              disabled={isSubmitted || isLoading}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                <span className="text-xs">⚠️</span>
                {errors.fullName.message}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Your name will appear on your ticket and will be used for check-in
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitted || isLoading}
            size="lg"
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                Continue to Tickets
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}