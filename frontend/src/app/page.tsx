/**
 * Landing Page Component
 * 
 * The public-facing homepage for EventHub.
 * Uses SVG illustrations from /public/images/ folder.
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
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'

// Utilities
import { useAuthStore } from '@/src/store/authStore'

/**
 * Feature data for the features section
 */
const features = [
  {
    icon: Calendar,
    title: 'Create Events',
    description: 'Set up your event in minutes with our simple form. Add ticket types, pricing, and event details.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Smartphone,
    title: 'WhatsApp Sharing',
    description: 'Share unique event links directly to WhatsApp groups. No app download required for attendees.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: QrCode,
    title: 'QR Code Check-in',
    description: 'Scan tickets at entry. QR codes expire after first use, preventing fraud and reuse.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Integrated MTN Momo and Orange Money payments. End-to-end encryption for all transactions.',
    color: 'bg-red-100 text-red-600',
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
    color: 'bg-indigo-100 text-indigo-600',
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
  },
  {
    number: '02',
    title: 'Create Event',
    description: 'Add event details, venue, date, and ticket types with pricing and quantities.',
  },
  {
    number: '03',
    title: 'Share Link',
    description: 'Copy your unique event link and share it via WhatsApp, Facebook, or email.',
  },
  {
    number: '04',
    title: 'Manage & Check-in',
    description: 'View attendee list, track sales, and scan QR codes at the event entrance.',
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
  },
  {
    number: '02',
    title: 'Enter Name',
    description: 'Provide your full name (required) – it will appear on your ticket.',
  },
  {
    number: '03',
    title: 'Pay & Download',
    description: 'Select ticket type, pay with MTN Momo or Orange Money, download QR code.',
  },
  {
    number: '04',
    title: 'Scan & Enter',
    description: 'Show your QR code at the venue. One scan only – ticket expires immediately.',
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
      <p className="text-4xl font-bold text-primary">
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
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo with SVG from public folder */}
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/images/logo.svg" 
              alt="EventHub Icon" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
            <span className="text-2xl font-bold text-primary hidden sm:inline">
              EventHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-primary transition-colors">
              Pricing
            </Link>
            {isAuthenticated ? (
              <Link href="/organizer/events">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <div className="flex gap-3">
                <Link href="/login">
                  <Button variant="outline">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up Free</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b py-4 px-4 space-y-3">
            <Link
              href="#features"
              className="block py-2 text-gray-600 hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="block py-2 text-gray-600 hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="block py-2 text-gray-600 hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            {isAuthenticated ? (
              <Link href="/organizer/events" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Dashboard</Button>
              </Link>
            ) : (
              <div className="space-y-2 pt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Log In</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Sign Up Free</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 inline-flex">
              🚀 Now Available in Cameroon
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              The easiest way to manage
              <span className="text-primary"> events in Cameroon</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl lg:max-w-none">
              Create events, sell tickets via Mobile Money, and check-in attendees with QR codes.
              No app download required. Works on any phone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {isAuthenticated ? (
                <Link href="/organizer/events">
                  <Button size="lg" className="btn-press">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="btn-press">
                      Get Started Free
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="btn-press">
                      I already have an account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Illustration - SVG from public folder */}
          <div className="flex-1 flex justify-center">
            <Image 
              src="/images/hero-illustration.png" 
              alt="Event management illustration" 
              width={500} 
              height={400}
              className="w-full max-w-md lg:max-w-full"
              priority
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <StatCounter target={5000} label="Events Hosted" />
            <StatCounter target={100000} label="Tickets Sold" suffix="+" />
            <StatCounter target={98} label="Satisfaction Rate" suffix="%" />
            <StatCounter target={500} label="Active Organizers" suffix="+" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything you need to manage events</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From ticket sales to attendee check-in, EventHub provides all the tools you need in one platform.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="card-hover border-0 shadow-md">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple setup for organizers, seamless experience for attendees.
            </p>
          </div>

          {/* Organizer Flow */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-center mb-8 text-primary">
              For Organizers
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {organizerSteps.map((step, index) => (
                <Card key={index} className="relative">
                  <CardHeader>
                    <div className="text-4xl font-bold text-primary/20 mb-2">
                      {step.number}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  {index < organizerSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 text-gray-300">
                      <ChevronRight className="h-6 w-6" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Attendee Flow */}
          <div>
            <h3 className="text-2xl font-semibold text-center mb-8 text-primary">
              For Attendees
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {attendeeSteps.map((step, index) => (
                <Card key={index} className="relative">
                  <CardHeader>
                    <div className="text-4xl font-bold text-primary/20 mb-2">
                      {step.number}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  {index < attendeeSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 text-gray-300">
                      <ChevronRight className="h-6 w-6" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Start for free, pay only when you grow. No hidden fees.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="card-hover border-2 border-gray-100">
            <CardHeader>
              <CardTitle className="text-xl">Free</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">0 XAF</span>
                <span className="text-gray-500">/event</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-500">Perfect for small events and testing</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Up to 50 attendees
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Basic event page
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  QR code tickets
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  WhatsApp sharing
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="card-hover border-2 border-primary shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm rounded-bl-lg">
              Popular
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Pro</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">15,000 XAF</span>
                <span className="text-gray-500">/event</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-500">Everything you need for professional events</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Up to 500 attendees
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Multiple ticket types
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Attendee list with search
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Analytics dashboard
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Priority support
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="card-hover border-2 border-gray-100">
            <CardHeader>
              <CardTitle className="text-xl">Enterprise</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">Custom</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-500">For large organizations and high-volume events</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Unlimited attendees
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Dedicated account manager
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Custom branding
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  API access
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  SLA guarantee
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <p className="text-center text-sm text-gray-500 mt-8">
          * 3% transaction fee applies to paid tickets
        </p>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to streamline your events?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of organizers in Cameroon using EventHub to manage their events.
          </p>
          {isAuthenticated ? (
            <Link href="/organizer/events">
              <Button size="lg" variant="secondary" className="btn-press">
                Go to Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button size="lg" variant="secondary" className="btn-press">
                Create Free Account
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image 
                  src="/images/logo.svg" 
                  alt="EventHub Icon" 
                  width={28} 
                  height={28}
                  className="w-7 h-7"
                />
                <h3 className="text-white font-semibold text-lg">EventHub</h3>
              </div>
              <p className="text-sm">
                The complete event management platform for Cameroon.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} EventHub. All rights reserved.</p>
            <p className="mt-1">Built with ❤️ for Cameroon&apos;s event organizers</p>
          </div>
        </div>
      </footer>
    </div>
  )
}