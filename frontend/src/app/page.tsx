/**
 * Landing Page Component
 * 
 * The public-facing homepage for EventHub.
 * Optimized for crisp, high-visibility Light Mode with a Dreamy Cyber-Glass theme.
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
  Sparkles
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Utilities
import { useAuthStore } from '@/store/authStore'

/**
 * Feature data optimized for crisp visibility against light backgrounds
 */
const features = [
  {
    icon: Calendar,
    title: 'Create Events',
    description: 'Set up your event in minutes with our simple form. Add ticket types, pricing, and event details.',
    color: 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm shadow-purple-100',
    animateClass: 'animate-icon-float',
  },
  {
    icon: Smartphone,
    title: 'WhatsApp Sharing',
    description: 'Share unique event links directly to WhatsApp groups. No app download required for attendees.',
    color: 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm shadow-blue-100',
    animateClass: 'animate-icon-float',
  },
  {
    icon: QrCode,
    title: 'QR Code Check-in',
    description: 'Scan tickets at entry. QR codes expire after first use, preventing fraud and reuse.',
    color: 'bg-pink-100 text-pink-700 border border-pink-200 shadow-sm shadow-pink-100',
    animateClass: 'animate-icon-glow',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Integrated MTN Momo and Orange Money payments. End-to-end encryption for all transactions.',
    color: 'bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm shadow-indigo-100',
    animateClass: 'animate-icon-glow',
  },
  {
    icon: Users,
    title: 'Attendee Management',
    description: 'View complete attendee lists with names, ticket types, and check-in status. Search and filter.',
    color: 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200 shadow-sm shadow-fuchsia-100',
    animateClass: 'animate-icon-float',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track ticket sales, revenue, and check-in rates with interactive charts and reports.',
    color: 'bg-cyan-100 text-cyan-700 border border-cyan-200 shadow-sm shadow-cyan-100',
    animateClass: 'animate-icon-spin',
  },
]

const organizerSteps = [
  { number: '01', title: 'Create Account', description: 'Sign up with your email and phone number. Verify your email with a 6-digit OTP.' },
  { number: '02', title: 'Create Event', description: 'Add event details, venue, date, and ticket types with pricing and quantities.' },
  { number: '03', title: 'Share Link', description: 'Copy your unique event link and share it via WhatsApp, Facebook, or email.' },
  { number: '04', title: 'Manage & Check-in', description: 'View attendee list, track sales, and scan QR codes at the event entrance.' },
]

const attendeeSteps = [
  { number: '01', title: 'Click Link', description: 'Tap the WhatsApp link shared by the organizer to open the event page.' },
  { number: '02', title: 'Enter Name', description: 'Provide your full name (required) – it will appear on your ticket.' },
  { number: '03', title: 'Pay & Download', description: 'Select ticket type, pay with MTN Momo or Orange Money, download QR code.' },
  { number: '04', title: 'Scan & Enter', description: 'Show your QR code at the venue. One scan only – ticket expires immediately.' },
]

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
    <div id={`stat-${label.replace(/\s/g, '')}`} className="text-center p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-purple-200/60 shadow-md shadow-purple-500/5">
      <p className="text-4xl font-extrabold gradient-text tracking-tight">
        {count}
        {suffix}
      </p>
      <p className="text-sm font-semibold text-purple-950/70 mt-2">{label}</p>
    </div>
  )
}

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#fcfaff] text-foreground transition-colors duration-300">
      
      {/* Navigation - Transparent Vivid Glass Sticky Layer */}
      <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-purple-100/80 shadow-md shadow-purple-100/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg blur opacity-60 group-hover:opacity-90 transition duration-300" />
              <Image 
                src="/images/logo.svg" 
                alt="EventHub Icon" 
                width={36} 
                height={36}
                className="w-9 h-9 relative animate-icon-float"
              />
            </div>
            <span className="text-2xl font-black gradient-text tracking-tight hidden sm:inline">
              EventHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-semibold text-muted-foreground hover:text-purple-600 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-semibold text-muted-foreground hover:text-purple-600 transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-semibold text-muted-foreground hover:text-purple-600 transition-colors">
              Pricing
            </Link>
            {isAuthenticated ? (
              <Link href="/organizer/events">
                <Button className="bg-white/80 border border-purple-200 hover:border-purple-400 text-purple-700 shadow-sm rounded-xl btn-press font-semibold">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex gap-3">
                <Link href="/login">
                  <Button variant="ghost" className="hover:bg-purple-500/10 text-foreground font-semibold">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-md shadow-purple-500/20 btn-press font-semibold rounded-xl">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-purple-100 py-4 px-4 space-y-3">
            <Link href="#features" className="block py-2 font-semibold text-foreground" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link href="#how-it-works" className="block py-2 font-semibold text-foreground" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
            <Link href="#pricing" className="block py-2 font-semibold text-foreground" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            {isAuthenticated ? (
              <Link href="/organizer/events" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-card border border-purple-200 text-purple-700 font-semibold">Dashboard</Button>
              </Link>
            ) : (
              <div className="space-y-2 pt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-purple-200 font-semibold">Log In</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold">Sign Up Free</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative overflow-hidden">
        {/* Soft, ultra-visible pastel light gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-300/20 to-blue-300/20 blur-[130px] rounded-full pointer-events-none -z-10" />
        
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left animate-slide-up">
            <Badge className="mb-6 bg-purple-100 border border-purple-300 text-purple-800 px-3 py-1 text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-icon-glow" /> Now Available in Cameroon
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-[1.15] tracking-tight">
              The easiest way to manage
              <span className="gradient-text block mt-1">events in Cameroon</span>
            </h1>
            <p className="text-base md:text-lg text-foreground mb-10 max-w-2xl lg:max-w-none font-medium leading-relaxed">
              Create events, sell tickets via Mobile Money, and check-in attendees with crisp QR codes. 
              No app download required. Built to look magical, styled to run with perfect high-contrast readability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {isAuthenticated ? (
                <Link href="/organizer/events">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-purple-500/20 btn-press px-8 py-6 rounded-xl">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-purple-500/20 btn-press px-8 py-6 rounded-xl">
                      Get Started Free
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="bg-card border-2 border-purple-200/80 hover:border-purple-400 text-purple-950 font-bold btn-press px-8 py-6 rounded-xl shadow-sm">
                      I already have an account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Illustration */}
          <div className="flex-1 flex justify-center relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-300/30 to-purple-300/30 blur-3xl opacity-40 rounded-full scale-75" />
            <Image 
              src="/images/hero-illustration.png" 
              alt="Event management illustration" 
              width={540} 
              height={440}
              className="w-full max-w-md lg:max-w-full drop-shadow-[0_15px_35px_rgba(168,85,247,0.12)] object-contain transform hover:scale-[1.02] transition duration-500"
              priority
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-purple-100 relative bg-white/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <StatCounter target={5000} label="Events Hosted" />
            <StatCounter target={1000} label="Tickets Sold" suffix="+" />
            <StatCounter target={98} label="Satisfaction Rate" suffix="%" />
            <StatCounter target={500} label="Active Organizers" suffix="+" />
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4 tracking-tight">Everything you need to manage events</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base font-medium">
            From seamless digital ticket checkout pipelines to quick gate control, EventHub wraps complex actions into crystal clear, glowing tools.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="bg-white/60 backdrop-blur-md border-l-4 border-l-purple-200/60 card-hover shadow-md shadow-purple-500/5 p-4 rounded-2xl flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.color}`}>
                    <Icon className={`h-6 w-6 ${feature.animateClass}`} />
                  </div>
                  <CardTitle className="text-xl font-extrabold tracking-tight text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-foreground font-medium">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-24 md:py-32 border-t border-purple-100 relative bg-white/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4 tracking-tight">Simple Pipeline Mechanics</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base font-medium">
              Simple deployment structures for organizers, fluid zero-app experiences for attendees.
            </p>
          </div>

          {/* Organizer Flow */}
          <div className="mb-24">
            <h3 className="text-sm font-black tracking-widest text-center mb-12 uppercase text-purple-700 bg-purple-100 border border-purple-200 rounded-full py-1.5 px-4 inline-block mx-auto left-1/2 relative -translate-x-1/2 shadow-sm">
              ⚡ For Organizers
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {organizerSteps.map((step, index) => (
                <Card key={index} className="bg-white/70 backdrop-blur-md relative p-2 rounded-2xl border border-purple-200/50 shadow-md">
                  <CardHeader>
                    <div className="text-5xl font-black text-purple-600/60 mb-2 tracking-tighter">
                      {step.number}
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-foreground font-medium leading-relaxed">{step.description}</CardDescription>
                  </CardContent>
                  {index < organizerSteps.length - 1 && (
                    <div className="hidden md:flex items-center justify-center absolute top-1/2 -right-4 -translate-y-1/2 text-purple-500/50 z-10">
                      <ChevronRight className="h-6 w-6 animate-icon-float" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Attendee Flow */}
          <div>
            <h3 className="text-sm font-black tracking-widest text-center mb-12 uppercase text-blue-700 bg-blue-100 border border-blue-200 rounded-full py-1.5 px-4 inline-block mx-auto left-1/2 relative -translate-x-1/2 shadow-sm">
              ✨ For Attendees
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {attendeeSteps.map((step, index) => (
                <Card key={index} className="bg-white/70 backdrop-blur-md relative p-2 rounded-2xl border border-blue-200/50 shadow-sm">
                  <CardHeader>
                    <div className="text-5xl font-black text-blue-600/60 mb-2 tracking-tighter">
                      {step.number}
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-foreground font-medium leading-relaxed">{step.description}</CardDescription>
                  </CardContent>
                  {index < attendeeSteps.length - 1 && (
                    <div className="hidden md:flex items-center justify-center absolute top-1/2 -right-4 -translate-y-1/2 text-blue-500/50 z-10">
                      <ChevronRight className="h-6 w-6 animate-icon-float" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4 tracking-tight">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base font-medium">
            Start completely free, scale features as you build your audience.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Free Plan */}
          <Card className="bg-white/60 backdrop-blur-md border border-purple-200/80 card-hover p-4 rounded-3xl flex flex-col justify-between shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Free</CardTitle>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">0 XAF</span>
                <span className="text-muted-foreground text-sm font-semibold">/event</span>
              </div>
            </CardHeader>
            <CardContent className="mt-6 flex-1 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground font-medium mb-6">Perfect for small meetups and configuration testing</p>
              <ul className="space-y-3 border-t border-purple-100 pt-6">
                {['Up to 50 attendees', 'Basic glass event page', 'QR code tickets', 'WhatsApp sharing layer'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-foreground font-semibold">
                    <CheckCircle className="h-4 w-4 text-purple-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-card border-2 border-purple-500 shadow-xl shadow-purple-500/5 p-4 rounded-3xl relative overflow-hidden scale-[1.03] flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-blue-600 text-white px-4 py-1.5 text-xs font-bold rounded-bl-xl uppercase tracking-wider animate-pulse-slow">
              Popular
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-purple-950">Pro</CardTitle>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black gradient-text">15,000 XAF</span>
                <span className="text-muted-foreground text-sm font-semibold">/event</span>
              </div>
            </CardHeader>
            <CardContent className="mt-6 flex-1 flex flex-col justify-between">
              <p className="text-sm text-foreground font-medium mb-6">Everything required for premium corporate or public gatherings</p>
              <ul className="space-y-3 border-t border-purple-100 pt-6">
                {['Up to 500 attendees', 'Multiple ticket configuration groups', 'Attendee list with smart search', 'Full glass analytics dashboard', 'Priority developer support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-foreground font-semibold">
                    <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="bg-white/60 backdrop-blur-md border border-purple-200/80 card-hover p-4 rounded-3xl flex flex-col justify-between shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Enterprise</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-black text-foreground">Custom</span>
              </div>
            </CardHeader>
            <CardContent className="mt-6 flex-1 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground font-medium mb-6">For large scale production workflows and high-volume operations</p>
              <ul className="space-y-3 border-t border-purple-100 pt-6">
                {['Unlimited core attendee metrics', 'Dedicated system account manager', 'White-label custom branding', 'Full REST API integration access', 'SLA architecture guarantees'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-foreground font-semibold">
                    <CheckCircle className="h-4 w-4 text-pink-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <p className="text-center text-xs text-muted-foreground font-semibold mt-10">
          * A minimal 3% transaction gateway processor fee applies explicitly to paid tickets
        </p>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-purple-950 via-[#191147] to-[#0d092c] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
            Ready to streamline your events?
          </h2>
          <p className="text-purple-100/90 mb-10 max-w-xl mx-auto font-medium text-base">
            Join thousands of modern organizers across Cameroon modernizing their entry gates and monetization flows with EventHub.
          </p>
          {isAuthenticated ? (
            <Link href="/organizer/events">
              <Button size="lg" className="bg-card text-purple-950 hover:bg-purple-50 font-bold px-8 py-6 rounded-xl shadow-lg shadow-black/20 btn-press">
                Go to Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-purple-500/30 border border-purple-400/30 btn-press">
                Create Free Account
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0b0822] text-gray-400 border-t border-purple-950 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image src="/images/logo.svg" alt="EventHub Icon" width={30} height={30} className="w-7 h-7" />
                <h3 className="text-white font-bold text-lg tracking-tight">EventHub</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                The complete custom digital event management pipeline architecture designed natively for Cameroon.
              </p>
            </div>
            {[['Product', '#features', '#pricing', '#how-it-works'], ['Company', '/about', '/contact', '/blog'], ['Legal', '/terms', '/privacy']].map((section, idx) => (
              <div key={idx}>
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">{section[0] as string}</h4>
                <ul className="space-y-2 text-sm">
                  {(section as string[]).slice(1).map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link href={link} className="text-muted-foreground hover:text-purple-400 font-medium transition-colors">
                        {link.replace('#', '').replace('/', '').replace('-', ' ')}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 text-center text-xs text-muted-foreground font-medium">
            <p>&copy; {new Date().getFullYear()} EventHub. All rights reserved.</p>
            <p className="mt-1">Built with 💜 for modern event organizers</p>
          </div>
        </div>
      </footer>
    </div>
  )
}