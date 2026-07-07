/**
 * Contact Page (Premium Light Theme)
 * 
 * Elegant layout for user inquiry submission and corporate contact nodes.
 * 
 * @module ContactPage
 */

'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Clock, ShieldCheck, HelpCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from '@/components/common/SocialIcons'

// Contact form schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormValues = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Contact form submitted:', data)
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      setIsSubmitted(true)
      reset()
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/50 text-foreground antialiased relative overflow-hidden">
      
      {/* Decorative Blur Background Mesh */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-200/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[400px] left-1/4 w-[600px] h-[600px] bg-indigo-200/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Hero Section */}
      <div className="border-b border-border/60 bg-white/50 backdrop-blur-sm py-16 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <Breadcrumb 
            items={[
              { label: 'Contact', href: '#', isActive: true },
            ]}
            showHome
          />
          <div className="text-center mt-8 space-y-4">
            <Badge className="bg-slate-900 text-white hover:bg-slate-900 text-[10px] uppercase tracking-wider rounded-md px-2.5 py-0.5 font-bold mx-auto">
              Get In Touch
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-none">
              Contact Our Team
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
              Have questions or need support? We would love to hear from you.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Contact Information Sidebar */}
          <div className="space-y-4 lg:col-span-1">
            <Card className="bg-card border-border/80 shadow-md shadow-slate-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Enquiries</h3>
                  <p className="text-sm font-semibold text-foreground">support@eventhub.com</p>
                  <p className="text-sm font-semibold text-foreground">sales@eventhub.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/80 shadow-md shadow-slate-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Call Center</h3>
                  <p className="text-sm font-semibold text-foreground">+237 670 142 124</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Mon-Fri, 9AM - 6PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/80 shadow-md shadow-slate-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Headquarters</h3>
                  <p className="text-sm font-semibold text-foreground">Buea, Cameroon</p>
                  <p className="text-xs font-medium text-muted-foreground">Buea Town, Mountain Hub</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/80 shadow-md shadow-slate-100 rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Connect With Us</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl bg-card border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground shadow-sm" asChild>
                    <FacebookIcon href="https://facebook.com/eventhub" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl bg-card border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground shadow-sm" asChild>
                    <TwitterIcon href="https://twitter.com/eventhub" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl bg-card border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground shadow-sm" asChild>
                    <InstagramIcon href="https://instagram.com/eventhub" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl bg-card border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground shadow-sm" asChild>
                    <LinkedinIcon href="https://linkedin.com/company/eventhub" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form Container */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border/80 shadow-xl shadow-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="p-6 sm:p-8 border-b border-slate-100 bg-muted/50/50">
                <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Send us a message</CardTitle>
                <CardDescription className="text-muted-foreground font-medium text-xs sm:text-sm">
                  Fill out the securely encrypted form below and we will get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                {isSubmitted && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center gap-3 animate-in fade-in-50 duration-300">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs sm:text-sm font-semibold text-emerald-800">Message sent successfully! We will get back to you soon.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-bold text-foreground">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        {...register('name')}
                        className={`rounded-xl border-border focus-visible:ring-purple-500 h-10 text-sm ${errors.name ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-bold text-foreground">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        {...register('email')}
                        className={`rounded-xl border-border focus-visible:ring-purple-500 h-10 text-sm ${errors.email ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs font-bold text-foreground">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help you?"
                      {...register('subject')}
                      className={`rounded-xl border-border focus-visible:ring-purple-500 h-10 text-sm ${errors.subject ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                    />
                    {errors.subject && (
                      <p className="text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs font-bold text-foreground">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your question or concern in detail..."
                      rows={5}
                      {...register('message')}
                      className={`rounded-xl border-border focus-visible:ring-purple-500 text-sm resize-none ${errors.message ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                    />
                    {errors.message && (
                      <p className="text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold h-11 shadow-md shadow-slate-200 transition-all" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processing Transmission...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-3.5 w-3.5" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>

                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-muted-foreground text-center mt-6">
                  <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>By submitting this form, you agree to our corporate privacy policy.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Area Integration */}
        <div className="mt-20 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm font-medium text-muted-foreground max-w-md mx-auto">Quick answers to common operational questions.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card border-border/80 shadow-md shadow-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="p-5 flex flex-row items-start gap-3 space-y-0">
                <HelpCircle className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">How do I create an account?</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pl-12">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Click the signup interactive module on our homepage gateway, input your configuration values, and verify your email node.</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/80 shadow-md shadow-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="p-5 flex flex-row items-start gap-3 space-y-0">
                <HelpCircle className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">What payment methods are accepted?</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pl-12">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">We settle entries natively via local microfinance wallets including MTN Mobile Money and Orange Money ecosystems.</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/80 shadow-md shadow-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="p-5 flex flex-row items-start gap-3 space-y-0">
                <HelpCircle className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">How do I request a refund?</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pl-12">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Refund parameters are authorized directly by individual event curators. EventHub acts as a neutral transaction ledger.</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/80 shadow-md shadow-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="p-5 flex flex-row items-start gap-3 space-y-0">
                <HelpCircle className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">Is EventHub free to use?</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pl-12">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Accounts running configurations of up to 50 entries scale for free. Premium structural tiers evaluate starting at 15,000 XAF.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}