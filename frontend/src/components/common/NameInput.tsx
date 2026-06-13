// File: frontend/src/components/common/NameInput.tsx
'use client'

import React from 'react'
import { Input } from '@/components/ui/button' // adjust paths based on your ui library imports
import { Label } from '@/components/ui/label'

interface NameInputProps {
  register: any // For react-hook-form integration
  error?: string
  label?: string
  placeholder?: string
  name?: string
}

export const NameInput: React.FC<NameInputProps> = ({
  register,
  error,
  label = "Full Name",
  placeholder = "Enter your full name",
  name = "fullName"
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </Label>
      <input
        id={name}
        type="text"
        placeholder={placeholder}
        className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          error ? 'border-red-500 focus-visible:ring-red-500' : 'border-input focus-visible:ring-primary'
        }`}
        {...register(name, {
          required: "Name is required",
          pattern: {
            value: /^[a-zA-Z\s\-']+$/,
            message: "Name can only contain letters, spaces, hyphens, or apostrophes"
          },
          minLength: {
            value: 2,
            message: "Name must be at least 2 characters long"
          }
        })}
      />
      {error && <span className="text-xs font-medium text-red-500 mt-1">{error}</span>}
    </div>
  )
}