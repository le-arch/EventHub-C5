/**
 * Auth Layout Component
 * 
 * This layout wraps all authentication pages (login, register, verify-otp, forgot-password).
 * It provides a consistent centered card layout with a gradient background.
 * 
 * @module AuthLayout
 */

'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    // Main container with gradient background
    // Uses Tailwind classes for responsive full-height layout
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
      
      {/* Content wrapper - limits maximum width for better readability */}
      <div className="w-full max-w-md">
        
        {/* Logo / Brand Link - centered at top */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="text-2xl font-bold text-primary inline-block hover:opacity-80 transition-opacity"
          >
          
          <p className="text-sm text-gray-500 mt-1">
            Event Management Platform
          </p>
          </Link>
        </div>
        
        {/* Children content - the actual form (login, register, etc.) */}
        {children}
        
        {/* Footer with copyright and legal links */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} EventHub. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600">
              Privacy
            </Link>
            <Link href="/contact" className="text-xs text-gray-400 hover:text-gray-600">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}