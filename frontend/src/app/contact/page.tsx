/**
 * Contact Page
 * 
 * Contact form and company information.
 * Uses custom SVG icons for social media.
 * Purple/Blue theme with consistent styling.
 * 
 * @module ContactPage
 */

'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Clock, MessageCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      toast.success('✅ Message sent successfully! We\'ll get back to you soon.')
      setIsSubmitted(true)
      reset()
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (error) {
      toast.error('❌ Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Purple/Blue Gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 py-16 text-white">
        <div className="container mx-auto px-4">
          <Breadcrumb 
            items={[
              { label: 'Contact', href: '#', isActive: true },
            ]}
            showHome
          />
          <div className="text-center mt-8">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium mb-4">
              📞 Get in Touch
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">Contact Us</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
              Have questions? We&apos;d love to hear from you
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="space-y-6">
            {/* Email Card */}
            <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="text-purple-400">📧</span> support@eventhub.com
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="text-purple-400">📧</span> sales@eventhub.com
                </p>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  Call Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="text-blue-400">📞</span> +237 670 142 124
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="text-blue-400">⏰</span> Mon-Fri, 9AM - 6PM
                </p>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className="border-l-4 border-l-indigo-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                  </div>
                  Visit Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="text-indigo-400">📍</span> Buea, Cameroon
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="text-indigo-400">🏢</span> Buea Town, Mountain Hub
                </p>
              </CardContent>
            </Card>

            {/* Social Media Card */}
            <Card className="border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <div className="p-2 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  Follow Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 flex-wrap">
                  <div className="p-2 bg-gray-100 rounded-lg hover:bg-blue-100 transition-colors group">
                    <FacebookIcon href="https://facebook.com/eventhub" />
                  </div>
                  <div className="p-2 bg-gray-100 rounded-lg hover:bg-sky-100 transition-colors group">
                    <TwitterIcon href="https://twitter.com/eventhub" />
                  </div>
                  <div className="p-2 bg-gray-100 rounded-lg hover:bg-pink-100 transition-colors group">
                    <InstagramIcon href="https://instagram.com/eventhub" />
                  </div>
                  <div className="p-2 bg-gray-100 rounded-lg hover:bg-blue-100 transition-colors group">
                    <LinkedinIcon href="https://linkedin.com/company/eventhub" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-t-4 border-t-purple-500 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-purple-700">
                  <Send className="h-6 w-6 text-purple-500" />
                  Send us a message 📧
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we&apos;ll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <p className="text-emerald-700">✅ Message sent successfully! We&apos;ll get back to you soon.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      {...register('name')}
                      className={errors.name ? 'border-red-500' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      {...register('email')}
                      className={errors.email ? 'border-red-500' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-gray-700 font-medium">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help you?"
                      {...register('subject')}
                      className={errors.subject ? 'border-red-500' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your question or concern..."
                      rows={5}
                      {...register('message')}
                      className={errors.message ? 'border-red-500' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500'}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Message ✨
                      </span>
                    )}
                  </Button>
                </form>

                <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                  <span className="text-purple-400">🔒</span>
                  By submitting this form, you agree to our privacy policy. We&apos;ll never share your information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <div className="inline-block bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-medium mb-3">
              ❓ Got Questions?
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Frequently Asked Questions</h2>
            <p className="text-gray-500 mt-2">Find quick answers to common questions about EventHub</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
                  <span className="text-2xl">📝</span>
                  How do I create an account?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Click the &quot;Sign Up&quot; button on the homepage, fill in your details, and verify your email address. ✨</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                  <span className="text-2xl">💳</span>
                  What payment methods are accepted?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">We accept 💛 MTN Momo and 🧡 Orange Money for ticket payments.</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-700">
                  <span className="text-2xl">🔄</span>
                  How do I get a refund?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Contact the event organizer directly. EventHub facilitates refunds as requested by organizers. 🔄</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-emerald-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                  <span className="text-2xl">🎟️</span>
                  Is EventHub free to use?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">EventHub offers a free plan for events with up to 50 attendees. Paid plans start at 15,000 XAF per event. 🎟️</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 px-6 py-3 bg-white rounded-full shadow-sm border border-gray-100">
            <span className="text-sm text-gray-500">🔒 Secure</span>
            <span className="w-px h-4 bg-gray-200" />
            <span className="text-sm text-gray-500">⚡ Fast Response</span>
            <span className="w-px h-4 bg-gray-200" />
            <span className="text-sm text-gray-500">💬 24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  )
}