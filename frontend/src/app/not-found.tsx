/**
 * Not Found Page (404)
 * 
 * Displayed when a user navigates to a route that doesn't exist.
 * Provides helpful links to get back to working parts of the application.
 * 
 * @module NotFoundPage
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Home, Calendar, HelpCircle } from 'lucide-react'

// shadcn/ui components
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* 404 Illustration */}
         <div className="mb-8 flex justify-center">
          <Image 
            src="/images/error-404.svg" 
            alt="404 Page Not Found Illustration" 
            width={300} 
            height={200}
            className="w-full max-w-xs"
            priority
          />
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button onClick={() => router.back()} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <Card className="text-left mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Looking for something?
            </CardTitle>
            <CardDescription>
              Here are some popular pages you might want to visit:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4 text-gray-400" />
                  <span>Homepage</span>
                </div>
                <span className="text-gray-400 text-sm">→</span>
              </Link>
              <Link href="/login" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <ArrowLeft className="h-4 w-4 text-gray-400" />
                  <span>Login to your account</span>
                </div>
                <span className="text-gray-400 text-sm">→</span>
              </Link>
              <Link href="/register" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Create a new account</span>
                </div>
                <span className="text-gray-400 text-sm">→</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}