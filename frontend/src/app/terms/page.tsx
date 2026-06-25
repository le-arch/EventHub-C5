/**
 * Terms & Conditions Page
 * * Displays the terms and conditions for EventHub with a clean, premium light aesthetic.
 * * @module TermsPage
 */

'use client'

import { FileText, Scale, CreditCard, Shield, AlertCircle, Clock, Users, Ticket, Smartphone, Mail, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased relative overflow-hidden">
      
      {/* Decorative Blur Background Mesh */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-200/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[600px] left-1/4 w-[600px] h-[600px] bg-indigo-200/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Hero Section */}
      <div className="border-b border-slate-200/60 bg-white/50 backdrop-blur-sm py-16 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <Breadcrumb 
            items={[
              { label: 'Terms & Conditions', href: '#', isActive: true },
            ]}
            showHome
          />
          <div className="text-center mt-8 space-y-4">
            <Badge className="bg-slate-900 text-white hover:bg-slate-900 text-[10px] uppercase tracking-wider rounded-md px-2.5 py-0.5 font-bold mx-auto">
              Legal Framework
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
              Terms & Conditions
            </h1>
            <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              Please read these terms carefully before using EventHub.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        
        {/* Intro Card */}
        <Card className="mb-10 bg-white border-slate-200/80 shadow-md shadow-slate-100 rounded-2xl overflow-hidden border-l-4 border-l-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Effective Date: June 15, 2025</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Welcome to EventHub. By accessing or using our platform, you agree to be bound by these Terms & Conditions. 
              If you do not agree with any part of these terms, please do not use our services.
            </p>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-slate-800">
              <Scale className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Acceptance of Terms</h2>
          </div>
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-sm text-slate-600 font-medium leading-relaxed">
              <p>
                By registering for an account or using EventHub, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms & Conditions, including any future modifications.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Account Registration */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-slate-800">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Account Registration</h2>
          </div>
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <ul className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600 font-medium">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> You must be at least 18 years old to register as an organizer.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> You must provide accurate and complete registration parameters.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> You are responsible for protecting account credential secrets.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> You remain responsible for all activities operating under your scope.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> You must notify us immediately of unauthorized platform access.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> We reserve the right to suspend accounts violating system rules.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Event Creation and Management */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-slate-800">
              <Ticket className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Event Creation and Management</h2>
          </div>
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <ul className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600 font-medium">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> Organizers assume absolute responsibility for provided event metadata accuracy.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> Configuration structures must fully align with localized regional legal parameters.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> Organizers remain liable for ticket clearing actions and event delivery execution.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> Changes or execution cancellations must be broadcasted transparently to attendees.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> We maintain autonomous authority to strip entries violating infrastructure safety policy.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> Organizers manage financial reconciliation and refunds if an entry is cancelled.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Ticket Sales and Payments */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-slate-800">
              <CreditCard className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ticket Sales and Payments</h2>
          </div>
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <ul className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600 font-medium">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> Ticket tier values are structured autonomously by event organizers.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> EventHub retains a 3% transaction overhead assessment on all premium ticketing.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> Ledger operations settle through secure MTN Momo and Orange Money networks.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> All settlement actions stand final unless initiated directly by the coordinator.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> QR codes carry exclusive access signatures and invalidate instantly upon processing.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> Misplaced, deleted, or compromised access vectors cannot be reassigned.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* QR Code System */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-slate-800">
              <Smartphone className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">QR Code System</h2>
          </div>
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <ul className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600 font-medium">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> Unique matrix assets generate specifically for individual transaction states.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> Validation pipelines evaluate cryptographically via secure HMAC signatures.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> Access sequences expire instantly upon registering the initial gateway entry.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> Forged, duplicated, or corrupted verification streams will be rejected automatically.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> Attendees must expose clear system-generated QR hashes during gate evaluation.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Prohibited Activities */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-slate-800">
              <Shield className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Prohibited Activities</h2>
          </div>
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden border-l-4 border-l-rose-500">
            <CardContent className="p-6 sm:p-8 space-y-3">
              <p className="text-sm font-semibold text-slate-700">Platform interactions explicitly forbid the following behaviors:</p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600 font-medium">
                <li className="flex items-center gap-2"><span>•</span> Operating channels for illicit or unsanctioned purposes</li>
                <li className="flex items-center gap-2"><span>•</span> Crafting spoof entry configurations or false registries</li>
                <li className="flex items-center gap-2"><span>•</span> Devising mechanisms to bypass validation or security rings</li>
                <li className="flex items-center gap-2"><span>•</span> Automated scraping or compilation of client telemetry histories</li>
                <li className="flex items-center gap-2"><span>•</span> Introducing anomalies that degrade normal operational processing</li>
                <li className="flex items-center gap-2"><span>•</span> Executing spoofing postures or false identity representations</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Fees and Payments */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-slate-800">
              <CreditCard className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fees and Payments Plans</h2>
          </div>
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <p className="text-sm text-slate-600 font-medium">
                EventHub features scaling tier configurations mapped against event volume limits:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600 font-medium">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <strong className="text-slate-800 block text-xs uppercase tracking-wider text-slate-400">Free Tier Plan</strong>
                  <span>Zero cost for entries managing ≤ 50 total records</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <strong className="text-slate-800 block text-xs uppercase tracking-wider text-slate-400">Pro Matrix Plan</strong>
                  <span>15,000 XAF flat per entry structure (ceiling capped at 500 registers)</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <strong className="text-slate-800 block text-xs uppercase tracking-wider text-slate-400">Enterprise Scale Plan</strong>
                  <span>Tailored configurations built explicitly for commercial organizations</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <strong className="text-slate-800 block text-xs uppercase tracking-wider text-slate-400">Processing Overhead</strong>
                  <span>3% baseline applied exclusively across finalized paid ticketing</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 pt-3 border-t border-slate-100 font-medium leading-relaxed">
                Retained fees persist as non-refundable unless verified via legislative mandate. EventHub maintains 
                authority to re-balance tier parameters via a 30-day notice lifecycle.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Intellectual Property */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-slate-800">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Intellectual Property</h2>
          </div>
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-sm text-slate-600 font-medium leading-relaxed">
              <p>
                EventHub and its original content, features, and functionality are owned by EventHub and are protected 
                by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, 
                or create derivative works without our express written consent.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-slate-800">
              <AlertCircle className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Limitation of Liability</h2>
          </div>
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-sm text-slate-600 font-medium leading-relaxed">
              <p>
                To the maximum extent permitted by law, EventHub shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages, including without limitation, loss of profits, data, or goodwill, 
                arising from your use of our platform. Our total liability shall not exceed the amount paid by you to 
                EventHub in the six months preceding the claim.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Termination */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-slate-800">
              <AlertCircle className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Termination</h2>
          </div>
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-sm text-slate-600 font-medium leading-relaxed">
              <p>
                We may terminate or suspend your account immediately, without prior notice, for conduct that violates 
                these Terms & Conditions or is otherwise harmful to EventHub or other users. Upon termination, your 
                right to use the platform will cease immediately.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Governing Law */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-slate-800">
              <Scale className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Governing Law</h2>
          </div>
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-sm text-slate-600 font-medium leading-relaxed">
              <p>
                These Terms & Conditions shall be governed by and construed in accordance with the laws of Cameroon, 
                without regard to its conflict of law provisions. Any disputes arising under these terms shall be 
                resolved in the courts of Douala, Cameroon.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Changes to Terms */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-slate-800">
              <Clock className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Changes to Terms</h2>
          </div>
          <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-sm text-slate-600 font-medium leading-relaxed">
              <p>
                We reserve the right to modify these Terms & Conditions at any time. We will notify you of material 
                changes by posting the updated terms on this page. Your continued use of EventHub after any changes 
                constitutes acceptance of the new terms.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Contact Us */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-slate-800">
              <Mail className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Contact Us</h2>
          </div>
          <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-sm text-slate-600 font-medium space-y-3">
              <p className="font-semibold text-slate-700">If you have questions about these Terms & Conditions, please contact us:</p>
              <div className="grid sm:grid-cols-3 gap-4 pt-2 text-xs sm:text-sm font-semibold">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Legal Node</span>
                  <span className="text-slate-800">legal@eventhub.com</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Call Center</span>
                  <span className="text-slate-800">+237 670 142 124</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Location Matrix</span>
                  <span className="text-slate-800">Buea, Cameroon</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer Note */}
        <div className="text-center text-xs font-semibold text-slate-400 mt-12 space-y-1">
          <p>By engaging with EventHub services, you agree to these Terms & Conditions.</p>
          <p>
            Learn more about our{' '}
            <Link href="/privacy" className="text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}