/**
 * Privacy Policy Page
 * 
 * Displays the privacy policy for EventHub.
 * Purple/Blue theme with consistent styling.
 * 
 * @module PrivacyPage
 */

'use client'

import { Shield, Lock, Eye, Database, Mail, Clock, Server, User, FileText, Globe, Calendar, Phone, MapPin, } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Purple/Blue Gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 py-16 text-white">
        <div className="container mx-auto px-4">
          <Breadcrumb 
            items={[
              { label: 'Privacy Policy', href: '#', isActive: true },
            ]}
            showHome
          />
          <div className="text-center mt-8">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium mb-4">
              🔒 Your Privacy Matters
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">Privacy Policy</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
              How we collect, use, and protect your information
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Last Updated Card */}
        <Card className="mb-8 border-l-4 border-l-purple-500 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-gray-500">Last Updated: June 15, 2025</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              At EventHub, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our platform.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Information We Collect 📊</h2>
          </div>
          <Card className="border-l-4 border-l-blue-500 shadow-md">
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Personal Information
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Account credentials (password stored securely via bcrypt hashing)</li>
                  <li>Profile information and preferences</li>
                  <li>Payment transaction data (processed through MTN Momo and Orange Money)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  Event Information
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Event details you create (title, date, venue, ticket types)</li>
                  <li>Attendee information (names, ticket purchases, check-in status)</li>
                  <li>QR code data and check-in records</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  Usage Information
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and actions taken</li>
                  <li>Referral source and session duration</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">How We Use Your Information 🔍</h2>
          </div>
          <Card className="border-l-4 border-l-indigo-500 shadow-md">
            <CardContent className="pt-6 space-y-3">
              <p className="text-gray-600">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Create and manage your account</li>
                <li>Process ticket purchases and payments</li>
                <li>Generate and validate QR code tickets</li>
                <li>Send event confirmations and reminders</li>
                <li>Improve our platform and user experience</li>
                <li>Communicate important updates and security alerts</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Data Security */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Lock className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Data Security 🔐</h2>
          </div>
          <Card className="border-l-4 border-l-emerald-500 shadow-md">
            <CardContent className="pt-6 space-y-3">
              <p className="text-gray-600">We implement robust security measures to protect your data:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Password hashing using bcrypt (never stored in plain text)</li>
                <li>JWT tokens for secure authentication</li>
                <li>HMAC signatures for QR code validation</li>
                <li>HTTPS encryption for all data transmission</li>
                <li>Regular security audits and updates</li>
                <li>Database encryption at rest</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Data Sharing */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Data Sharing 🤝</h2>
          </div>
          <Card className="border-l-4 border-l-amber-500 shadow-md">
            <CardContent className="pt-6 space-y-3">
              <p className="text-gray-600">We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Payment processors (MTN Momo, Orange Money) to complete transactions</li>
                <li>Email service providers for sending notifications (with your consent)</li>
                <li>Legal authorities when required by law</li>
                <li>Event organizers (for attendee information related to their events)</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Your Rights */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Server className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Your Rights 📋</h2>
          </div>
          <Card className="border-l-4 border-l-rose-500 shadow-md">
            <CardContent className="pt-6 space-y-3">
              <p className="text-gray-600">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
              <p className="text-gray-600 mt-3">
                To exercise these rights, contact us at <strong className="text-purple-600">privacy@eventhub.com</strong>.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Cookies */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Mail className="h-6 w-6 text-rose-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Cookies 🍪</h2>
          </div>
          <Card className="border-l-4 border-l-purple-500 shadow-md">
            <CardContent className="pt-6">
              <p className="text-gray-600 leading-relaxed">
                We use cookies to enhance your experience on our platform. Cookies help us remember your preferences, 
                analyze site traffic, and provide secure authentication. You can disable cookies in your browser settings, 
                but this may affect some platform functionality.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Children's Privacy */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Shield className="h-6 w-6 text-pink-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Children&apos;s Privacy 👶</h2>
          </div>
          <Card className="border-l-4 border-l-pink-500 shadow-md">
            <CardContent className="pt-6">
              <p className="text-gray-600 leading-relaxed">
                EventHub is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If you believe we have collected information from a child under 13, 
                please contact us immediately.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Changes to Policy */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Clock className="h-6 w-6 text-cyan-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Changes to This Policy 📝</h2>
          </div>
          <Card className="border-l-4 border-l-cyan-500 shadow-md">
            <CardContent className="pt-6">
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new policy on this page and updating the &quot;Last Updated&quot; date. We encourage you to 
                review this policy periodically.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Contact Us */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Contact Us 📧</h2>
          </div>
          <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <p className="text-gray-600">
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <div className="mt-3 space-y-1 text-gray-700">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-500" />
                  <strong>Email:</strong> <span className="text-purple-600">privacy@eventhub.com</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <strong>Phone:</strong> <span>+237 670 142 124</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  <strong>Address:</strong> <span>Buea, Cameroon</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer Note */}
        <div className="text-center pt-8 border-t border-gray-200 mt-8">
          <p className="text-sm text-gray-400">
            By using EventHub, you agree to this Privacy Policy. 
            Learn more about our <Link href="/terms" className="text-purple-600 hover:underline font-medium">Terms & Conditions</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}