/**
 * Terms & Conditions Page
 * 
 * Displays the terms and conditions for EventHub.
 * 
 * @module TermsPage
 */

'use client'

import { FileText, Scale, CreditCard, Shield, AlertCircle, Clock, Users, Ticket, Smartphone, Mail } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <Breadcrumb 
            items={[
              { label: 'Terms & Conditions', href: '#', isActive: true },
            ]}
            showHome
          />
          <div className="text-center mt-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions 📜</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Please read these terms carefully before using EventHub
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm text-gray-500">Effective Date: June 15, 2025</span>
            </div>
            <p className="text-gray-600 mb-4">
              Welcome to EventHub. By accessing or using our platform, you agree to be bound by these Terms & Conditions. 
              If you do not agree with any part of these terms, please do not use our services.
            </p>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Acceptance of Terms ✅</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">
                By registering for an account or using EventHub, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms & Conditions, including any future modifications.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Account Registration */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Account Registration 👤</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>You must be at least 18 years old to register as an organizer</li>
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
            <Ticket className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Event Creation and Management 📅</h2>
          </div>
          <Card>
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
            <CreditCard className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Ticket Sales and Payments 💳</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Ticket prices are set by event organizers</li>
                <li>EventHub charges a 3% transaction fee on paid tickets</li>
                <li>Payments are processed through MTN Momo and Orange Money</li>
                <li>All sales are final unless the event organizer issues a refund</li>
                <li>QR code tickets are one-time use and expire after scanning</li>
                <li>Lost or stolen tickets cannot be replaced</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* QR Code System */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">QR Code System 📱</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>QR codes are generated uniquely for each ticket purchase</li>
                <li>QR codes are validated using HMAC signatures to prevent forgery</li>
                <li>QR codes expire immediately after the first successful scan</li>
                <li>Duplicate or fraudulent QR codes will be rejected</li>
                <li>Attendees must present valid QR codes at event entry</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Prohibited Activities */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Prohibited Activities 🚫</h2>
          </div>
          <Card>
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
            <CreditCard className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Fees and Payments 💰</h2>
          </div>
          <Card>
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
                Fees are non-refundable unless required by law. EventHub reserves the right to modify pricing with 30 days' notice.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Intellectual Property */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Intellectual Property ©️</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">
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
            <AlertCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Limitation of Liability ⚠️</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">
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
            <AlertCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Termination 🔚</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">
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
            <Scale className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Governing Law ⚖️</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">
                These Terms & Conditions shall be governed by and construed in accordance with the laws of Cameroon, 
                without regard to its conflict of law provisions. Any disputes arising under these terms shall be 
                resolved in the courts of Douala, Cameroon.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Changes to Terms */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Changes to Terms 📝</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">
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
            <Mail className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Contact Us 📧</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">
                If you have questions about these Terms & Conditions, please contact us:
              </p>
              <div className="mt-3 space-y-1">
                <p>📧 Email: <strong>legal@eventhub.com</strong></p>
                <p>📞 Phone: <strong>+237 600 000 000</strong></p>
                <p>📍 Address: <strong>Douala, Cameroon</strong></p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-400 mt-8">
          By using EventHub, you agree to these Terms & Conditions. 
          Learn more about our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}