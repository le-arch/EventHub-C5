/**
 * Landing Page Component
 * 
 * The public-facing homepage for EventHub.
 * Uses SVG illustrations from /public/images/ folder.
 * Purple/Blue theme with consistent styling.
 * 
 * @module HomePage
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Smartphone, 
  QrCode, 
  Shield, 
  Users, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Utilities
import { useAuthStore } from '@/store/authStore'

/**
 * Feature data for the features section
 */
const features = [
  {
    icon: Calendar,
    title: 'Create Events',
    description: 'Set up your event in minutes with our simple form. Add ticket types, pricing, and event details.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Smartphone,
    title: 'WhatsApp Sharing',
    description: 'Share unique event links directly to WhatsApp groups. No app download required for attendees.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: QrCode,
    title: 'QR Code Check-in',
    description: 'Scan tickets at entry. QR codes expire after first use, preventing fraud and reuse.',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Integrated MTN Momo and Orange Money payments. End-to-end encryption for all transactions.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Users,
    title: 'Attendee Management',
    description: 'View complete attendee lists with names, ticket types, and check-in status. Search and filter.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track ticket sales, revenue, and check-in rates with interactive charts and reports.',
    color: 'bg-rose-100 text-rose-600',
  },
]

/**
 * How it works steps for organizers
 */
const organizerSteps = [
  {
    number: '01',
    title: 'Create Account',
    description: 'Sign up with your email and phone number. Verify your email with a 6-digit OTP.',
    icon: '📝',
  },
  {
    number: '02',
    title: 'Create Event',
    description: 'Add event details, venue, date, and ticket types with pricing and quantities.',
    icon: '📅',
  },
  {
    number: '03',
    title: 'Share Link',
    description: 'Copy your unique event link and share it via WhatsApp, Facebook, or email.',
    icon: '🔗',
  },
  {
    number: '04',
    title: 'Manage & Check-in',
    description: 'View attendee list, track sales, and scan QR codes at the event entrance.',
    icon: '✅',
  },
]

/**
 * How it works steps for attendees
 */
const attendeeSteps = [
  {
    number: '01',
    title: 'Click Link',
    description: 'Tap the WhatsApp link shared by the organizer to open the event page.',
    icon: '📱',
  },
  {
    number: '02',
    title: 'Enter Name',
    description: 'Provide your full name (required) – it will appear on your ticket.',
    icon: '✍️',
  },
  {
    number: '03',
    title: 'Pay & Download',
    description: 'Select ticket type, pay with MTN Momo or Orange Money, download QR code.',
    icon: '💳',
  },
  {
    number: '04',
    title: 'Scan & Enter',
    description: 'Show your QR code at the venue. One scan only – ticket expires immediately.',
    icon: '🎟️',
  },
]

/**
 * Statistics counter animation component
 */
function StatCounter({ target, label, suffix = '' }: { target: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const interval = 20
    const steps = duration / interval
    const increment = target / steps
    let current = 0
    let timer: NodeJS.Timeout

    const startAnimation = () => {
      timer = setInterval(() => {
        current += increment
        if (current >= target) {
          setCount(target)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, interval)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation()
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    const element = document.getElementById(`stat-${label.replace(/\s/g, '')}`)
    if (element) observer.observe(element)

    return () => {
      clearInterval(timer)
      observer.disconnect()
    }
  }, [target, label])

  return (
    <div id={`stat-${label.replace(/\s/g, '')}`} className="text-center">
      <p className="text-4xl font-bold text-purple-600">
        {count}
        {suffix}
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/*  NAVIGATION  */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100/30 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/20">
              <span className="text-white font-bold text-sm"><Image src="/images/logo.svg" alt="logo" width={200} height={150} /></span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent hidden sm:inline">
              EventHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
              How It Works
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
              Pricing
            </Link>
            {isAuthenticated ? (
              <Link href="/organizer/events">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex gap-3">
                <Link href="/login">
                  <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-purple-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-purple-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-purple-100 py-4 px-4 space-y-3 shadow-lg">
            <Link
              href="#features"
              className="block py-2 px-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="block py-2 px-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="block py-2 px-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="pt-2 border-t border-gray-100">
              {isAuthenticated ? (
                <Link href="/organizer/events" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION  */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-blue-50/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200 hover:bg-purple-100 inline-flex shadow-sm">
                🚀 Now Available in Cameroon
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                The easiest way to manage
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                  events in Cameroon
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl lg:max-w-none leading-relaxed">
                Create events, sell tickets via Mobile Money, and check-in attendees with QR codes.
                No app download required. Works on any phone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {isAuthenticated ? (
                  <Link href="/organizer/events">
                    <Button size="lg" className="btn-press bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-lg shadow-purple-500/25">
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="btn-press bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-lg shadow-purple-500/25">
                        Get Started Free
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button size="lg" variant="outline" className="btn-press border-purple-300 text-purple-700 hover:bg-purple-50">
                        I already have an account
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Illustration */}
            <div className="flex-1 flex justify-center">
              <Image 
                src="/images/hero-illustration.png" 
                alt="Event management illustration" 
                width={500} 
                height={400}
                className="w-full max-w-md lg:max-w-full drop-shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/*  STATS SECTION  */}
      <section className="py-16 bg-gradient-to-r from-purple-50/50 via-white to-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-purple-100">
              <StatCounter target={5000} label="Events Hosted" />
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-blue-100">
              <StatCounter target={100000} label="Tickets Sold" suffix="+" />
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-indigo-100">
              <StatCounter target={98} label="Satisfaction Rate" suffix="%" />
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-purple-100">
              <StatCounter target={500} label="Active Organizers" suffix="+" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="inline-block bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-medium mb-3">
            ✨ Features
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Everything you need to manage events</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            From ticket sales to attendee check-in, EventHub provides all the tools you need in one platform.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-t-4 border-t-purple-500 shadow-md hover:shadow-xl transition-all card-hover">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-500 leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="bg-gradient-to-b from-purple-50/50 to-blue-50/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium mb-3">
              📖 How It Works
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Simple setup, seamless experience</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Get started in minutes. Everything you need to create, promote, and manage your event.
            </p>
          </div>

          {/* Organizer Flow */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-center mb-8 text-purple-700">
              👤 For Organizers
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {organizerSteps.map((step, index) => (
                <Card key={index} className="relative border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{step.icon}</span>
                      <span className="text-3xl font-bold text-purple-200">{step.number}</span>
                    </div>
                    <CardTitle className="text-lg text-gray-800">{step.title}</CardTitle>
                    <CardDescription className="text-gray-500">{step.description}</CardDescription>
                  </CardHeader>
                  {index < organizerSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 text-purple-300">
                      <ChevronRight className="h-6 w-6" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Attendee Flow */}
          <div>
            <h3 className="text-2xl font-semibold text-center mb-8 text-blue-700">
              🎫 For Attendees
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {attendeeSteps.map((step, index) => (
                <Card key={index} className="relative border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{step.icon}</span>
                      <span className="text-3xl font-bold text-blue-200">{step.number}</span>
                    </div>
                    <CardTitle className="text-lg text-gray-800">{step.title}</CardTitle>
                    <CardDescription className="text-gray-500">{step.description}</CardDescription>
                  </CardHeader>
                  {index < attendeeSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 text-blue-300">
                      <ChevronRight className="h-6 w-6" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-medium mb-3">
            💰 Pricing
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Simple, Transparent Pricing</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Start for free, pay only when you grow. No hidden fees.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="border-2 border-gray-200 shadow-md hover:shadow-xl transition-all card-hover">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Free</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-800">0 XAF</span>
                <span className="text-gray-500">/event</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-500">Perfect for small events and testing</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  Up to 50 attendees
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  Basic event page
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  QR code tickets
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  WhatsApp sharing
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-purple-500 shadow-xl hover:shadow-2xl transition-all card-hover relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg shadow-md">
              🌟 Popular
            </div>
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Pro</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-purple-600">15,000 XAF</span>
                <span className="text-gray-500">/event</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-500">Everything you need for professional events</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  Up to 500 attendees
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  Multiple ticket types
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  Attendee list with search
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  Analytics dashboard
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  Priority support
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-2 border-gray-200 shadow-md hover:shadow-xl transition-all card-hover">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Enterprise</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-800">Custom</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-500">For large organizations and high-volume events</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  Unlimited attendees
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  Dedicated account manager
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  Custom branding
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  API access
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  SLA guarantee
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <p className="text-center text-sm text-gray-400 mt-8">
          * 3% transaction fee applies to paid tickets
        </p>
      </section>

      {/* CTA SECTION */}
      <section className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
            Ready to streamline your events?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg">
            Join thousands of organizers in Cameroon using EventHub to manage their events.
          </p>
          {isAuthenticated ? (
            <Link href="/organizer/events">
              <Button size="lg" variant="secondary" className="btn-press bg-white text-purple-700 hover:bg-gray-100 hover:text-purple-800 font-semibold shadow-lg hover:shadow-xl transition-all">
                Go to Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button size="lg" variant="secondary" className="btn-press bg-white text-purple-700 hover:bg-gray-100 hover:text-purple-800 font-semibold shadow-lg hover:shadow-xl transition-all">
                Create Free Account
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs"><Image src="/images/logo.svg" alt="logo" width={100} height={80} /></span>
                </div>
                <h3 className="text-white font-semibold text-lg">EventHub</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                The complete event management platform for Cameroon.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="text-gray-500 hover:text-purple-400 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-purple-400 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-purple-400 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-purple-400 transition-colors">
                  <span className="sr-only">YouTube</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} EventHub. All rights reserved.</p>
            <p className="mt-1 text-gray-500">Built with ❤️ for Cameroon&apos;s event organizers</p>
          </div>
        </div>
      </footer>
    </div>
  )
}