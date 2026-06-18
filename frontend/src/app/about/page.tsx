/**
 * About Us Page
 * 
 * Displays information about EventHub, the team, and the mission.
 * Purple/Blue theme with gradients and consistent styling.
 * 
 * @module AboutPage
 */

'use client'

import { Mail, Phone, MapPin, Target, Eye, Heart, Users, Award, Calendar, Ticket, QrCode, Smartphone } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'
// Social icons would be imported here if needed

// Team members data with themed colors
const teamMembers = [
  {
    name: 'Leonie Basil',
    role: 'Frontend Lead',
    bio: 'Expert in React, Next.js, and TypeScript. Responsible for all user interfaces and responsive design.',
    initials: 'LB',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  {
    name: 'Fonyuy Verena',
    role: 'Backend Lead',
    bio: 'Expert in Go, PostgreSQL, and API design. Ensures high performance and security.',
    initials: 'FV',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  {
    name: 'Rosine Achah',
    role: 'Full Stack / QA',
    bio: 'Expert in full-stack development and quality assurance. Bridges frontend and backend integration.',
    initials: 'RA',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  },
]

// Values data with themed icons
const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To empower event organizers in Cameroon with a simple, affordable, and reliable platform to manage their events and sell tickets.',
    color: 'text-purple-600 bg-purple-100',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    description: 'To become the leading event management platform in Central Africa, transforming how events are organized and experienced.',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    icon: Heart,
    title: 'Our Values',
    description: 'Innovation, integrity, customer focus, and local relevance. We build solutions that truly serve the Cameroonian market.',
    color: 'text-indigo-600 bg-indigo-100',
  },
]

// Stats data with colors
const stats = [
  { value: '5,000+', label: 'Events Hosted', icon: Calendar, color: 'from-purple-500 to-indigo-500' },
  { value: '100,000+', label: 'Tickets Sold', icon: Ticket, color: 'from-blue-500 to-cyan-500' },
  { value: '98%', label: 'Satisfaction Rate', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { value: '500+', label: 'Active Organizers', icon: Users, color: 'from-emerald-500 to-teal-500' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Purple/Blue Gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 py-16 text-white">
        <div className="container mx-auto px-4">
          <Breadcrumb 
            items={[
              { label: 'About Us', href: '#', isActive: true },
            ]}
            showHome
          />
          <div className="text-center mt-8 flex flex-col items-center justify-center gap-4">
            {/* Logo placed outside the H1 for clean block/flex rendering */}
            <Image 
              src="/images/logo.svg" 
              alt="EventHub Logo" 
              width={800} 
              height={200} 
              className="h-12 w-auto object-contain"
              priority
            />
            
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                About EventHub
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
                The complete event management platform built for Cameroon
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Story 📖</h2>
          <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
            <p>
              EventHub was born from a simple observation: event organizers in Cameroon were struggling with 
              scattered tools, manual processes, and no dedicated platform for selling tickets via Mobile Money.
            </p>
            <p>
              We saw promoters juggling WhatsApp groups, Excel sheets, paper lists, and cash collections. 
              Attendees faced confusion, lost tickets, and long queues at entry. Something had to change.
            </p>
            <p>
              That&apos;s why we built EventHub – an all-in-one platform that makes event management simple, 
              secure, and accessible to everyone in Cameroon.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section with Gradient Cards */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className={`bg-gradient-to-br ${stat.color} text-white shadow-lg hover:shadow-xl transition-shadow border-0`}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-white/90">{stat.label}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((item, index) => {
            const Icon = item.icon
            return (
              <Card key={index} className="card-hover border-t-4 border-t-purple-500 shadow-md hover:shadow-xl">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">Meet the Team 👥</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            A passionate team dedicated to revolutionizing event management in Cameroon
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center card-hover border-2 hover:border-purple-300 transition-colors">
                <CardHeader>
                  <div className={`w-24 h-24 rounded-full ${member.color} flex items-center justify-center mx-auto mb-4 border-2 shadow-md`}>
                    <span className="text-2xl font-bold">{member.initials}</span>
                  </div>
                  <CardTitle className="text-xl text-gray-800">{member.name}</CardTitle>
                  <CardDescription className="font-medium text-purple-600">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">Ready to Get Started? 🚀</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg">
            Join thousands of organizers in Cameroon using EventHub to manage their events
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="bg-white text-purple-700 hover:bg-gray-100 hover:text-purple-800 font-semibold shadow-lg hover:shadow-xl transition-all btn-press">
              Create Free Account ✨
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Info */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
          <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-purple-100">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
            <p className="text-gray-500">support@eventhub.com</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-purple-100">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">WhatsApp</h3>
            <p className="text-gray-500">+237 670 142 124</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-purple-100">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-7 w-7 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Location</h3>
            <p className="text-gray-500">Buea, Cameroon</p>
          </div>
        </div>
      </section>
    </div>
  )
}