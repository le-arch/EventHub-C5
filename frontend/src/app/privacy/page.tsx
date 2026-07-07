/**
 * Privacy Policy Page
 * * Displays the privacy policy for EventHub with a clean, premium light aesthetic.
 * * @module PrivacyPage
 */

'use client'

import { Shield, Lock, Eye, Database, Mail, Clock, Server, Cookie, HelpCircle, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-muted/50 text-foreground antialiased relative overflow-hidden">
      
      {/* Decorative Blur Background Mesh */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-200/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[600px] left-1/4 w-[600px] h-[600px] bg-indigo-200/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Hero Section */}
      <div className="border-b border-border/60 bg-white/50 backdrop-blur-sm py-16 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <Breadcrumb 
            items={[
              { label: 'Privacy Policy', href: '#', isActive: true },
            ]}
            showHome
          />
          <div className="text-center mt-8 space-y-4">
            <Badge className="bg-slate-900 text-white hover:bg-slate-900 text-[10px] uppercase tracking-wider rounded-md px-2.5 py-0.5 font-bold mx-auto">
              Legal Framework
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-none">
              Privacy Policy
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
              How we collect, use, and protect your information within our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        
        {/* Intro Card */}
        <Card className="mb-10 bg-card border-border/80 shadow-md shadow-slate-100 rounded-2xl overflow-hidden border-l-4 border-l-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Updated: June 15, 2025</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              At EventHub, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you interact with our event coordination ecosystem.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-foreground">
              <Database className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Information We Collect</h2>
          </div>
          <Card className="bg-card border-border/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">Personal Information</h3>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground font-medium">
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> Name and contact metadata (email, phone number)</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> Credentials securely hashed via cryptographically sound hashes</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> Profile parameters and configurations</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> Transaction signatures processed via MTN Momo & Orange Money</li>
                </ul>
              </div>
              
              <div className="border-t border-slate-100 pt-6 space-y-2">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">Event Configuration Information</h3>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground font-medium">
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> Created event structures (title, timestamps, venues, categories)</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> Attendee rosters, checkout state, and entry counts</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> Secure QR ticket records and confirmation tokens</li>
                </ul>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-2">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">Usage Information</h3>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground font-medium">
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> IP allocation addresses and device architecture profiles</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> Client browser engines and build footprints</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> Interacted routes, system operations, and performance metrics</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-foreground">
              <Eye className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">How We Use Your Information</h2>
          </div>
          <Card className="bg-card border-border/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-3">
              <p className="text-sm font-semibold text-foreground">We utilize telemetry and personal datasets strictly to:</p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" /> Provision and govern client configurations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" /> Clear and balance mobile ledger settlements</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" /> Authenticate secure QR code tokens</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" /> Route transactional email receipts and updates</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" /> Optimize system speed and interface paths</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" /> Comply with localized regulatory mandates</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Data Security */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Data Security</h2>
          </div>
          <Card className="bg-card border-border/80 shadow-sm rounded-2xl overflow-hidden border-l-4 border-l-emerald-500">
            <CardContent className="p-6 sm:p-8 space-y-3">
              <p className="text-sm font-semibold text-foreground">We maintain comprehensive architectural defenses to guarantee infrastructure protection:</p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground font-medium">
                <li className="flex items-center gap-2"><span>•</span> Cryptographic hashing for authentication values</li>
                <li className="flex items-center gap-2"><span>•</span> Stateless JSON Web Tokens for session handling</li>
                <li className="flex items-center gap-2"><span>•</span> HMAC tokens validating ticket verification integrity</li>
                <li className="flex items-center gap-2"><span>•</span> Enforced TLS/HTTPS protocol encryption in transit</li>
                <li className="flex items-center gap-2"><span>•</span> Continuous repository dependency and security reviews</li>
                <li className="flex items-center gap-2"><span>•</span> Standardized transparent storage encryption at rest</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Data Sharing */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-foreground">
              <Shield className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Data Sharing</h2>
          </div>
          <Card className="bg-card border-border/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-sm text-muted-foreground font-medium leading-relaxed space-y-3">
              <p>
                We do not sell user profiles or contact datasets. External data mapping is restricted to functional integrations needed to resolve operations:
              </p>
              <ul className="space-y-1.5 ml-2">
                <li><strong className="text-foreground">Payment Gateways:</strong> Safe routing via localized mobile wallets to conclude entry charges.</li>
                <li><strong className="text-foreground">Communication Service Modules:</strong> Automated transactional email engines handling confirmations.</li>
                <li><strong className="text-foreground">Event Managers:</strong> Access to registered attendee lists for validation and gate entry.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Your Rights */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-foreground">
              <Server className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Your Rights</h2>
          </div>
          <Card className="bg-card border-border/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <p className="text-sm font-semibold text-foreground">Account profiles preserve comprehensive autonomy to:</p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground font-medium">
                <li className="flex items-center gap-2"><span>•</span> Request access to recorded personal datasets</li>
                <li className="flex items-center gap-2"><span>•</span> Correct or recalculate faulty user telemetry</li>
                <li className="flex items-center gap-2"><span>•</span> Terminate accounts and purge historical files</li>
                <li className="flex items-center gap-2"><span>•</span> Opt out of optional informative system alerts</li>
                <li className="flex items-center gap-2"><span>•</span> Export system records into structured formats</li>
              </ul>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground pt-3 border-t border-slate-100">
                To execute any file or parameter modifications, contact the internal security node at <strong className="text-foreground font-semibold">privacy@eventhub.com</strong>.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Cookies Framework */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-foreground">
              <Cookie className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Cookies Framework</h2>
          </div>
          <Card className="bg-card border-border/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-sm text-muted-foreground font-medium leading-relaxed">
              <p>
                Our server uses state tracking cookies to maintain system authentication tokens, optimize client preferences, 
                and compile generic navigation telemetry. While browser preferences can disable global tracker permissions, 
                doing so will terminate safe continuous authentication sessions.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Youth Protection */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-foreground">
              <HelpCircle className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Youth Protection</h2>
          </div>
          <Card className="bg-card border-border/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-sm text-muted-foreground font-medium leading-relaxed">
              <p>
                Platform features are not architected for users under 13 years of age. We do not deliberately retain 
                records belonging to minors. If any youth accounts are discovered to bypass constraints, please notify 
                our privacy node immediately to force deletion.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Revision Logs */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Policy Revisions</h2>
          </div>
          <Card className="bg-card border-border/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-sm text-muted-foreground font-medium leading-relaxed">
              <p>
                We reserve the right to alter this system policy outline. Structural edits are signaled by editing 
                the timestamp baseline displayed above. Continued entry tracking after adjustments serves as explicit acknowledgment.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Corporate Nodes */}
        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Corporate Nodes</h2>
          </div>
          <Card className="bg-card border-border/80 shadow-md rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-sm text-muted-foreground font-medium space-y-3">
              <p className="font-semibold text-foreground">Direct questions related to privacy processing structures to our offices:</p>
              <div className="grid sm:grid-cols-3 gap-4 pt-2 text-xs sm:text-sm font-semibold">
                <div className="p-3 bg-muted/50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Security Node</span>
                  <span className="text-foreground">privacy@eventhub.com</span>
                </div>
                <div className="p-3 bg-muted/50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Call Center</span>
                  <span className="text-foreground">+237 670 142 124</span>
                </div>
                <div className="p-3 bg-muted/50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Location Matrix</span>
                  <span className="text-foreground">Buea, Cameroon</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer Note */}
        <div className="text-center text-xs font-semibold text-muted-foreground mt-12 space-y-1">
          <p>By engaging with EventHub services, you fully accept this privacy framework.</p>
          <p>
            Review our auxiliary parameters inside the{' '}
            <Link href="/terms" className="text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
              Terms & Conditions
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}