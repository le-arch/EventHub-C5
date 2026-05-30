/**
 * About Us Page
 * 
 * Displays information about EventHub, the team, and the mission.
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

// Team members data
const teamMembers = [
  {
    name: 'Leonie Basil',
    role: 'Frontend Lead',
    bio: 'Expert in React, Next.js, and TypeScript. Responsible for all user interfaces and responsive design.',
    initials: 'LB',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'Fonyuy Verena',
    role: 'Backend Lead',
    bio: 'Expert in Go, PostgreSQL, and API design. Ensures high performance and security.',
    initials: 'FV',
    color: 'bg-green-100 text-green-600',
  },
  {
    name: 'Rosine Achah',
    role: 'Full Stack / QA',
    bio: 'Expert in full-stack development and quality assurance. Bridges frontend and backend integration.',
    initials: 'RA',
    color: 'bg-purple-100 text-purple-600',
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <Breadcrumb 
            items={[
              { label: 'About Us', href: '#', isActive: true },
            ]}
            showHome
          />
          <div className="text-center mt-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About EventHub 📅</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The complete event management platform built for Cameroon
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Our Story 📖</h2>
          <div className="space-y-4 text-gray-600 text-lg">
            <p>
              EventHub was born from a simple observation: event organizers in Cameroon were struggling with 
              scattered tools, manual processes, and no dedicated platform for selling tickets via Mobile Money.
            </p>
            <p>
              We saw promoters juggling WhatsApp groups, Excel sheets, paper lists, and cash collections. 
              Attendees faced confusion, lost tickets, and long queues at entry. Something had to change.
            </p>
            <p>
              That's why we built EventHub – an all-in-one platform that makes event management simple, 
              secure, and accessible to everyone in Cameroon.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
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
              <Card key={index} className="card-hover">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">{item.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Meet the Team 👥</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            A passionate team dedicated to revolutionizing event management in Cameroon
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center card-hover">
                <CardHeader>
                  <div className={`w-24 h-24 rounded-full ${member.color} flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl font-bold">{member.initials}</span>
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="font-medium">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started? 🚀</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of organizers in Cameroon using EventHub to manage their events
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="btn-press">
              Create Free Account ✨
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Info */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
          <div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Email</h3>
            <p className="text-gray-500">support@eventhub.com</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">WhatsApp</h3>
            <p className="text-gray-500">+237 670 142 124</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Location</h3>
            <p className="text-gray-500">Buea, Cameroon</p>
          </div>
        </div>
      </section>
    </div>
  )
}