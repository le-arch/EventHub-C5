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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 via-transparent to-blue-200/30 dark:from-purple-700/20 dark:via-transparent dark:to-blue-700/20 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        
        {/* Logo / Brand Link */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent inline-block hover:opacity-80 transition-opacity"
          >
            EventHub
          </Link>
          <p className="text-sm text-muted-foreground mt-1">
            Event Management Platform
          </p>
        </div>
        
        {children}
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} EventHub. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
