/**
 * Terms & Conditions Page
 * 
 * Displays the terms and conditions for EventHub.
 * Purple/Blue theme with consistent styling.
 * 
 * @module TermsPage
 */

'use client'

import { FileText, Scale, CreditCard, Shield, AlertCircle, Clock, Users, Ticket, Smartphone, Mail, Phone, MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Purple/Blue Gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 py-16 text-white">
        <div className="container mx-auto px-4">
          <Breadcrumb 
            items={[
              { label: 'Terms & Conditions', href: '#', isActive: true },
            ]}
            showHome
          />
          <div className="text-center mt-8">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium mb-4">
              📜 Legal Agreement
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">Terms & Conditions</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
              Please read these terms carefully before using EventHub
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Effective Date Card */}
        <Card className="mb-8 border-l-4 border-l-purple-500 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-gray-500">Effective Date: June 15, 2025</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Welcome to EventHub. By accessing or using our platform, you agree to be bound by these Terms & Conditions. 
              If you do not agree with any part of these terms, please do not use our services.
            </p>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Scale className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Acceptance of Terms ✅</h2>
          </div>
          <Card className="border-l-4 border-l-purple-500 shadow-md">
            <CardContent className="pt-6">
              <p className="text-gray-600 leading-relaxed">
                By registering for an account or using EventHub, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms & Conditions, including any future modifications.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Account Registration */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Account Registration 👤</h2>
          </div>
          <Card className="border-l-4 border-l-blue-500 shadow-md">
            <CardContent className="pt-6 space-y-3">
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>You must be at least <strong>18 years old</strong> to register as an organizer</li>
                <li>You must provide accurate and complete registration information</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized account access</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Event Creation and Management */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Ticket className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Event Creation and Management 📅</h2>
          </div>
          <Card className="border-l-4 border-l-indigo-500 shadow-md">
            <CardContent className="pt-6 space-y-3">
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>You are responsible for the accuracy of all event information you provide</li>
                <li>You must comply with all applicable laws regarding your events</li>
                <li>You are responsible for fulfilling ticket sales and event delivery</li>
                <li>You must clearly communicate any event changes or cancellations to attendees</li>
                <li>We reserve the right to remove events that violate our policies</li>
                <li>Event organizers are responsible for refunds in case of event cancellation</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Ticket Sales and Payments */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Ticket Sales and Payments 💳</h2>
          </div>
          <Card className="border-l-4 border-l-emerald-500 shadow-md">
            <CardContent className="pt-6 space-y-3">
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Ticket prices are set by event organizers</li>
                <li>EventHub charges a <strong>3% transaction fee</strong> on paid tickets</li>
                <li>Payments are processed through <strong>MTN Momo</strong> and <strong>Orange Money</strong></li>
                <li>All sales are final unless the event organizer issues a refund</li>
                <li>QR code tickets are <strong>one-time use</strong> and expire after scanning</li>
                <li>Lost or stolen tickets cannot be replaced</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* QR Code System */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Smartphone className="h-6 w-6 text-cyan-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">QR Code System 📱</h2>
          </div>
          <Card className="border-l-4 border-l-cyan-500 shadow-md">
            <CardContent className="pt-6 space-y-3">
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>QR codes are generated uniquely for each ticket purchase</li>
                <li>QR codes are validated using <strong>HMAC signatures</strong> to prevent forgery</li>
                <li>QR codes expire <strong>immediately</strong> after the first successful scan</li>
                <li>Duplicate or fraudulent QR codes will be rejected</li>
                <li>Attendees must present valid QR codes at event entry</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Prohibited Activities */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Shield className="h-6 w-6 text-rose-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Prohibited Activities 🚫</h2>
          </div>
          <Card className="border-l-4 border-l-rose-500 shadow-md">
            <CardContent className="pt-6 space-y-3">
              <p className="text-gray-600 font-medium">You may not:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Use EventHub for any illegal purpose</li>
                <li>Create fake events or fraudulent ticket listings</li>
                <li>Attempt to bypass our security measures or QR code validation</li>
                <li>Scrape or harvest attendee data without permission</li>
                <li>Interfere with the normal operation of the platform</li>
                <li>Impersonate another person or entity</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Fees and Payments */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Fees and Payments 💰</h2>
          </div>
          <Card className="border-l-4 border-l-amber-500 shadow-md">
            <CardContent className="pt-6 space-y-3">
              <p className="text-gray-600">
                EventHub offers a free plan for events with up to 50 attendees. Paid plans are available for larger events:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Free Plan:</strong> Free for events with ≤ 50 attendees</li>
                <li><strong>Pro Plan:</strong> 15,000 XAF per event (up to 500 attendees)</li>
                <li><strong>Enterprise:</strong> Custom pricing for larger organizations</li>
                <li><strong>Transaction Fee:</strong> 3% on all paid tickets</li>
              </ul>
              <p className="text-gray-600 mt-2">
                Fees are non-refundable unless required by law. EventHub reserves the right to modify pricing with 30 days&apos; notice.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Intellectual Property */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-violet-100 rounded-lg">
              <FileText className="h-6 w-6 text-violet-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Intellectual Property ©️</h2>
          </div>
          <Card className="border-l-4 border-l-violet-500 shadow-md">
            <CardContent className="pt-6">
              <p className="text-gray-600 leading-relaxed">
                EventHub and its original content, features, and functionality are owned by EventHub and are protected 
                by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, 
                or create derivative works without our express written consent.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Limitation of Liability ⚠️</h2>
          </div>
          <Card className="border-l-4 border-l-orange-500 shadow-md">
            <CardContent className="pt-6">
              <p className="text-gray-600 leading-relaxed">
                To the maximum extent permitted by law, EventHub shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages, including without limitation, loss of profits, data, or goodwill, 
                arising from your use of our platform. Our total liability shall not exceed the amount paid by you to 
                EventHub in the six months preceding the claim.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Termination */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-pink-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Termination 🔚</h2>
          </div>
          <Card className="border-l-4 border-l-pink-500 shadow-md">
            <CardContent className="pt-6">
              <p className="text-gray-600 leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for conduct that violates 
                these Terms & Conditions or is otherwise harmful to EventHub or other users. Upon termination, your 
                right to use the platform will cease immediately.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Governing Law */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Scale className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Governing Law ⚖️</h2>
          </div>
          <Card className="border-l-4 border-l-indigo-500 shadow-md">
            <CardContent className="pt-6">
              <p className="text-gray-600 leading-relaxed">
                These Terms & Conditions shall be governed by and construed in accordance with the laws of <strong>Cameroon</strong>, 
                without regard to its conflict of law provisions. Any disputes arising under these terms shall be 
                resolved in the courts of <strong>Douala, Cameroon</strong>.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Changes to Terms */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Clock className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Changes to Terms 📝</h2>
          </div>
          <Card className="border-l-4 border-l-teal-500 shadow-md">
            <CardContent className="pt-6">
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these Terms & Conditions at any time. We will notify you of material 
                changes by posting the updated terms on this page. Your continued use of EventHub after any changes 
                constitutes acceptance of the new terms.
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
                If you have questions about these Terms & Conditions, please contact us:
              </p>
              <div className="mt-3 space-y-1 text-gray-700">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-500" />
                  <strong>Email:</strong> <span className="text-purple-600">legal@eventhub.com</span>
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
            By using EventHub, you agree to these Terms & Conditions. 
            Learn more about our <Link href="/privacy" className="text-purple-600 hover:underline font-medium">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}