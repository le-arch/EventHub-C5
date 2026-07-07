/**
 * About Us Landing Page (Light Theme)
 * 
 * Displays a beautifully styled landing experience about EventHub, the team, and the mission.
 * 
 * @module AboutPage
 */

'use client'

import { Mail, Phone, MapPin, Target, Eye, Heart, Users, Calendar, Ticket, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'

// Team members data
const teamMembers = [
  {
    name: 'Leonie Basil',
    role: 'Frontend Lead',
    bio: 'Expert in React, Next.js, and TypeScript. Responsible for all user interfaces and responsive design.',
    initials: 'LB',
    color: 'from-purple-500 via-indigo-500 to-blue-500 text-white',
  },
  {
    name: 'Fonyuy Verena',
    role: 'Backend Lead',
    bio: 'Expert in Go, PostgreSQL, and API design. Ensures high performance, infrastructure scaling, and security.',
    initials: 'FV',
    color: 'from-blue-600 via-indigo-600 to-purple-600 text-white',
  },
  {
    name: 'Rosine Achah',
    role: 'Full Stack / QA',
    bio: 'Expert in full-stack development and quality assurance. Bridges frontend and backend integration.',
    initials: 'RA',
    color: 'from-purple-600 via-pink-600 to-blue-600 text-white',
  },
]

// Values data
const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To empower event organizers in Cameroon with a simple, affordable, and reliable platform to manage their events and sell tickets.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    description: 'To become the leading event management platform in Central Africa, transforming how events are organized and experienced.',
  },
  {
    icon: Heart,
    title: 'Our Values',
    description: 'Innovation, integrity, customer focus, and local relevance. We build solutions that truly serve the Cameroonian market.',
  },
]

// Stats data
const stats = [
  { value: '5,000+', label: 'Events Hosted', icon: Calendar },
  { value: '100,000+', label: 'Tickets Sold', icon: Ticket },
  { value: '98%', label: 'Satisfaction Rate', icon: Heart },
  { value: '500+', label: 'Active Organizers', icon: Users },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted/50 text-foreground antialiased selection:bg-purple-500/10 overflow-hidden relative">
      
      {/* Immersive Landing Light Gradient Background Mesh */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[400px] right-1/4 w-[700px] h-[700px] bg-blue-200/20 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-[200px] left-1/3 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Hero Header Section */}
      <div className="relative border-b border-border/80 bg-gradient-to-b from-purple-50/60 via-indigo-50/40 to-transparent pt-12 pb-24 lg:pt-16 lg:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex justify-center mb-8">
            <Breadcrumb 
              items={[
                { label: 'About Us', href: '#', isActive: true },
              ]}
              showHome
            />
          </div>
          
          <div className="text-center space-y-6">
            {/* Elegant Brand Logo Wrapper */}
            <div className="inline-flex relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 rounded-4xl blur-md opacity-80 group-hover:opacity-90 transition-opacity duration-500 animate-pulse" />
              <div className="relative p-4 bg-card border border-border rounded-3xl shadow-xl shadow-slate-200/60">
                <Image 
                  src="/images/logo.svg" 
                  alt="EventHub Brand Icon" 
                  width={100} 
                  height={100}
                  className="w-20 h-20"
                  priority
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Discover Our Roots
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
                Behind EventHub
              </h1>
            </div>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              We are a team of creators building the complete digital event management blueprint specifically structured for Cameroon.
            </p>
          </div>
        </div>
      </div>

      {/* Brand Story Split Content Section */}
      <section className="container mx-auto px-4 py-24 relative z-10 max-w-5xl">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Why We Exist</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Revolutionizing the Event Ecosystem
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              We analyzed infrastructure complexities across cities like Douala, Yaoundé, and Buea to establish a platform tailored seamlessly around local payment methods and organization flows.
            </p>
          </div>
          
          <div className="lg:col-span-7 bg-card border border-border shadow-xl shadow-slate-200/50 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex gap-4 items-start">
              <CheckCircle2 className="h-5 w-5 text-purple-600 shrink-0 mt-1" />
              <p className="text-muted-foreground text-sm md:text-base">
                <strong className="text-foreground block mb-0.5">The Legacy Problem:</strong> Event promoters previously navigated disjointed WhatsApp groups, fragmented Excel spreadsheets, and physical paper rosters.
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-1" />
              <p className="text-muted-foreground text-sm md:text-base">
                <strong className="text-foreground block mb-0.5">Payment Challenges:</strong> Ticket distribution fell short without seamless Mobile Money automation frameworks, extending waiting lines at active gates.
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-1" />
              <p className="text-muted-foreground text-sm md:text-base">
                <strong className="text-foreground block mb-0.5">Our Solution:</strong> An intuitive SaaS platform consolidating registration, analytical tracking, live validation matrices, and streamlined checkout systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Landing Stat Matrix */}
      <section className="bg-card border-y border-border py-16 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="bg-muted/50 border border-border rounded-2xl p-6 text-center shadow-sm transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{stat.value}</h3>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Strategic Vision Grid Cards */}
      <section className="container mx-auto px-4 py-24 relative z-10 max-w-5xl">
        <div className="text-center space-y-2 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Core Principles</span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">How We Shape Tomorrow</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((item, index) => {
            const Icon = item.icon
            return (
              <Card key={index} className="bg-card border-border shadow-xl shadow-slate-200/40 group transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/40">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20 mb-3 transition-transform group-hover:scale-105">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground tracking-tight">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Team Profile Grid Showcase */}
      <section className="bg-muted/30/60 border-t border-border py-24 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600">Architects of EventHub</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Meet the Team</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-xs md:text-sm">
              Engineers and innovators dedicated to shaping reliable event infrastructure in Africa.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="bg-card border-border text-center group transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/40 overflow-hidden relative shadow-xl shadow-slate-200/50">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-3 pt-8">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${member.color} flex items-center justify-center mx-auto mb-4 shadow-lg font-mono text-xl font-bold tracking-wider transition-transform group-hover:scale-105`}>
                    {member.initials}
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground tracking-tight group-hover:text-purple-600 transition-colors">{member.name}</CardTitle>
                  <CardDescription className="font-bold text-purple-600 text-[11px] tracking-widest uppercase mt-1">{member.role}</CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed px-2">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Immersive CTA Landing Frame */}
      <section className="relative overflow-hidden py-24 border-t border-border bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950 via-slate-950 to-blue-950 opacity-90 z-0" />
        <div className="container mx-auto px-4 text-center relative z-10 max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Ready to Transform Your Workflow?</h2>
          <p className="text-slate-300 max-w-xl mx-auto font-medium text-sm md:text-base">
            Launch your events ecosystem inside Cameroon with comprehensive analytics tools, live verification metrics, and automated transactions.
          </p>
          <div className="pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-xl shadow-purple-900/40 rounded-xl transition-all duration-200 active:scale-[0.98] group gap-2 border-0">
                <span>Create Your Free Account</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Light Landing Grid Contact Information Blocks */}
      <section className="container mx-auto px-4 py-16 relative z-10 max-w-4xl border-t border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <div className="w-9 h-9 bg-card border border-border rounded-xl flex items-center justify-center mx-auto shadow-sm">
              <Mail className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider pt-1">Email</h3>
            <p className="text-xs text-foreground font-medium">support@eventhub.com</p>
          </div>
          <div className="space-y-1">
            <div className="w-9 h-9 bg-card border border-border rounded-xl flex items-center justify-center mx-auto shadow-sm">
              <Phone className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider pt-1">WhatsApp</h3>
            <p className="text-xs text-foreground font-medium">+237 670 142 124</p>
          </div>
          <div className="space-y-1">
            <div className="w-9 h-9 bg-card border border-border rounded-xl flex items-center justify-center mx-auto shadow-sm">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider pt-1">Location</h3>
            <p className="text-xs text-foreground font-medium">Buea, Cameroon</p>
          </div>
        </div>
      </section>
    </div>
  )
}