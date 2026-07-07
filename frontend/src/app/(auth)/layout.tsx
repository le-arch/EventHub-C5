'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient purple/blue blobs */}
      <div className="fixed top-1/4 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-3xl font-bold gradient-text inline-block hover:opacity-80 transition-opacity"
          >
            EventHub
          </Link>
          <p className="text-sm text-muted-foreground mt-1">
            Event Management Platform
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          {children}
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} EventHub. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
