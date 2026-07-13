/**
 * Individual Blog Post Page (Light Theme)
 * 
 * Displays a single blog post with full prose styling and premium platform layout accents.
 * 
 * @module BlogPostPage
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, Clock, ArrowLeft, Mail, BookOpen, Tag } from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { FacebookIcon, TwitterIcon, LinkedinIcon } from '@/components/common/SocialIcons'

// Types
interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  authorRole: string
  authorBio: string
  publishedAt: string
  readTime: number
  category: string
  tags: string[]
  gradient: string
}

// Blog posts content - Upgraded with premium semantic color gradients matching listing styles
const blogContent: Record<string, BlogPost> = {
  'how-to-sell-tickets-online-in-cameroon': {
    id: '1',
    slug: 'how-to-sell-tickets-online-in-cameroon',
    title: 'How to Sell Tickets Online in Cameroon: A Complete Guide',
    excerpt: 'Learn the best strategies for selling event tickets online in Cameroon using Mobile Money and QR codes.',
    content: `
      <p>Selling tickets online in Cameroon has never been easier. With the rise of mobile money and digital platforms, event organizers can now reach a wider audience and streamline their ticket sales process.</p>
      
      <h2>Why Sell Tickets Online?</h2>
      <p>Online ticket sales offer numerous benefits over traditional methods:</p>
      <ul>
        <li><strong>Reach a wider audience</strong> - Promote your event beyond your immediate circle</li>
        <li><strong>Reduce manual work</strong> - No more tracking payments in WhatsApp groups</li>
        <li><strong>Prevent fraud</strong> - QR codes ensure ticket authenticity</li>
        <li><strong>Real-time tracking</strong> - Know exactly how many tickets you've sold</li>
        <li><strong>Attendee data</strong> - Collect valuable information about your audience</li>
      </ul>
      
      <h2>How EventHub Makes It Easy</h2>
      <p>EventHub provides a complete solution for selling tickets online in Cameroon. Create your event, set ticket prices, share your link, and start selling.</p>
      
      <h2>Tips for Success</h2>
      <ul>
        <li>Start ticket sales 2-4 weeks before your event</li>
        <li>Offer early bird discounts to encourage early purchases</li>
        <li>Share your event link on WhatsApp and social media</li>
        <li>Track your sales analytics to adjust your strategy</li>
      </ul>
    `,
    author: 'Leonie Basil',
    authorRole: 'Frontend Lead',
    authorBio: 'Leonie is the Frontend Lead at EventHub, passionate about creating beautiful and intuitive user interfaces.',
    publishedAt: '2026-05-15T10:00:00Z',
    readTime: 5,
    category: 'Tutorial',
    tags: ['tickets', 'mobile money', 'guide', 'event planning'],
    gradient: 'from-purple-500/10 via-indigo-500/5 to-transparent border-purple-500/10',
  },
  'qr-code-check-in-benefits': {
    id: '2',
    slug: 'qr-code-check-in-benefits',
    title: 'Why QR Code Check-in is a Game Changer for Events',
    excerpt: 'Discover how QR code technology can streamline your event entry process and prevent fraud.',
    content: `
      <p>QR code check-in technology is transforming how events manage attendee entry. Here's why it's a game changer for event organizers in Cameroon.</p>
      
      <h2>Benefits of QR Code Check-in</h2>
      <ul>
        <li><strong>Speed</strong> - Scan a QR code in under 2 seconds per person</li>
        <li><strong>Security</strong> - HMAC signatures prevent ticket forgery</li>
        <li><strong>One-time use</strong> - QR codes expire after first scan</li>
        <li><strong>No app needed</strong> - Works with any smartphone camera</li>
        <li><strong>Real-time tracking</strong> - Know exactly who has arrived</li>
      </ul>
      
      <h2>How It Works</h2>
      <p>After purchasing a ticket, attendees receive a unique QR code. At the event, organizers simply scan the code using a webcam or phone camera. The system validates the code and marks the ticket as used.</p>
    `,
    author: 'Fonyuy Verena',
    authorRole: 'Backend Lead',
    authorBio: 'Fonyuy is the Backend Lead at EventHub, ensuring high performance and security.',
    publishedAt: '2026-05-10T10:00:00Z',
    readTime: 4,
    category: 'Technology',
    tags: ['qr code', 'check-in', 'technology'],
    gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent border-blue-500/10',
  },
  'mobile-money-payments-for-events': {
    id: '3',
    slug: 'mobile-money-payments-for-events',
    title: 'The Rise of Mobile Money Payments for Events in Cameroon',
    excerpt: 'Explore how MTN Momo and Orange Money are transforming event ticketing.',
    content: `
      <p>Mobile money has revolutionized how Cameroonians transact. Now, it's transforming event ticketing.</p>
      
      <h2>Why Mobile Money for Events?</h2>
      <ul>
        <li><strong>Accessibility</strong> - Over 90% of adults use mobile money</li>
        <li><strong>Convenience</strong> - No bank account needed</li>
        <li><strong>Speed</strong> - Instant payments and ticket delivery</li>
        <li><strong>Security</strong> - Reduced cash handling risks</li>
      </ul>
      
      <h2>MTN Momo and Orange Money Integration</h2>
      <p>EventHub integrates both major mobile money providers, making it easy for attendees to purchase tickets with their preferred method.</p>
    `,
    author: 'Rosine Achah',
    authorRole: 'Full Stack / QA',
    authorBio: 'Rosine bridges frontend and backend integration, ensuring quality across the platform.',
    publishedAt: '2026-05-05T10:00:00Z',
    readTime: 6,
    category: 'Trends',
    tags: ['mobile money', 'payments', 'trends'],
    gradient: 'from-pink-500/10 via-purple-500/5 to-transparent border-pink-500/10',
  },
  'eventhub-launches-in-cameroon': {
    id: '4',
    slug: 'eventhub-launches-in-cameroon',
    title: 'EventHub Launches in Cameroon: Revolutionizing Event Management',
    excerpt: 'We are excited to announce the official launch of EventHub in Cameroon.',
    content: `
      <p>We are thrilled to announce the official launch of EventHub in Cameroon! After months of development and beta testing, our platform is now available to event organizers across the country.</p>
      
      <h2>A New Era for Event Management</h2>
      <p>EventHub is designed specifically for the Cameroonian market, addressing the unique challenges that local organizers face.</p>
      
      <h2>Key Features</h2>
      <ul>
        <li>Mobile Money payments (MTN Momo & Orange Money)</li>
        <li>QR code ticketing with fraud protection</li>
        <li>WhatsApp sharing for easy promotion</li>
        <li>Real-time attendee tracking and analytics</li>
      </ul>
      
      <p>Ready to get started? <a href="/register">Create your free account today</a>.</p>
    `,
    author: 'Leonie Basil',
    authorRole: 'Frontend Lead',
    authorBio: 'Leonie is the Frontend Lead at EventHub, passionate about creating beautiful and intuitive user interfaces.',
    publishedAt: '2026-06-01T10:00:00Z',
    readTime: 3,
    category: 'News',
    tags: ['launch', 'announcement', 'eventhub'],
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/10',
  },
  'douala-music-fest-case-study': {
    id: '5',
    slug: 'douala-music-fest-case-study',
    title: 'Case Study: How Douala Music Fest Sold 5,000+ Tickets Using EventHub',
    excerpt: 'Learn how one of Cameroon\'s biggest music festivals used EventHub.',
    content: `
      <p>The Douala Music Fest is one of Cameroon's premier music events. In 2025, they partnered with EventHub to manage their ticket sales and check-in process.</p>
      
      <h2>The Challenge</h2>
      <p>Previous years had been plagued by manual ticketing processes, long queues at entry, and ticket fraud.</p>
      
      <h2>The Solution</h2>
      <p>EventHub provided online ticket sales via Mobile Money, QR code tickets, real-time analytics, and QR scanner check-in.</p>
      
      <h2>The Results</h2>
      <ul>
        <li>5,200+ tickets sold - 15% increase</li>
        <li>Zero ticket fraud</li>
        <li>75% faster entry</li>
        <li>100% attendee data capture</li>
      </ul>
    `,
    author: 'Fonyuy Verena',
    authorRole: 'Backend Lead',
    authorBio: 'Fonyuy is the Backend Lead at EventHub, ensuring high performance and security.',
    publishedAt: '2026-05-20T10:00:00Z',
    readTime: 8,
    category: 'Case Studies',
    tags: ['case study', 'music festival', 'success story'],
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/10',
  },
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      const slug = params.slug as string
      const foundPost = blogContent[slug]
      setPost(foundPost || null)
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [params.slug])

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')
  }

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post?.title || '')}&url=${encodeURIComponent(window.location.href)}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')
  }

  const shareByEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(post?.title || '')}&body=${encodeURIComponent(`Check out this article: ${window.location.href}`)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <Skeleton className="h-5 w-40 mb-6 rounded-full" />
          <Skeleton className="h-10 w-5/6 mb-4 rounded-xl" />
          <Skeleton className="h-5 w-1/2 mb-10 rounded-md" />
          <Skeleton className="h-72 w-full rounded-2xl mb-10" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm bg-card p-8 border border-border shadow-xl rounded-2xl space-y-4">
          <div className="w-12 h-12 bg-muted/50 border border-border rounded-xl flex items-center justify-center mx-auto">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-foreground">Post Not Found</h1>
            <p className="text-sm text-muted-foreground">The article you are searching for might have been updated or relocated.</p>
          </div>
          <Link href="/blog" className="block">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold h-10">
              Return to Blog Catalog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/50 text-foreground antialiased selection:bg-purple-500/10 relative overflow-hidden">
      
      {/* Decorative Blur Background Mesh */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-200/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[400px] left-1/4 w-[600px] h-[600px] bg-indigo-200/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="container mx-auto px-4 py-12 max-w-3xl relative z-10">
        
        {/* Navigation Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumb 
            items={[
              { label: 'Blog', href: '/blog' },
              { label: post.category, href: '#', isActive: true },
            ]}
            showHome
          />
        </div>

        {/* Hero Meta Header */}
        <div className="space-y-4 mb-8">
          <div>
            <Badge className="bg-card border border-border shadow-sm text-foreground hover:bg-card text-[10px] uppercase tracking-wider rounded-md px-2.5 py-0.5 font-bold">
              {post.category}
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </div>

        {/* Structural Visual Cover Section */}
        <div className={`h-52 sm:h-80 rounded-2xl overflow-hidden mb-10 bg-gradient-to-br ${post.gradient} border border-border/60 flex items-center justify-center relative shadow-inner shadow-slate-100`}>
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)]" />
          <BookOpen className="h-16 w-16 text-muted-foreground/30" />
        </div>

        {/* Main Article Content Node  */}
        <article 
          className="prose prose-slate max-w-none mb-10 prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-foreground prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-muted-foreground prose-p:text-sm sm:prose-p:text-base prose-p:leading-relaxed prose-a:text-purple-600 prose-a:font-semibold hover:prose-a:text-purple-700 prose-strong:text-foreground prose-li:text-muted-foreground prose-li:text-sm sm:prose-li:text-base prose-ul:list-disc prose-ul:pl-5 space-y-2"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Content Metadata Tags Array */}
        <div className="flex flex-wrap gap-2 mb-10">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[11px] font-semibold text-muted-foreground bg-card border-border px-2.5 py-0.5 rounded-lg">
              <Tag className="w-2.5 h-2.5 mr-1 text-muted-foreground" />
              {tag}
            </Badge>
          ))}
        </div>

        <Separator className="my-10 bg-slate-200/80" />

        {/* Author Presentation Profile Card */}
        <Card className="bg-card border-border/80 rounded-2xl shadow-md shadow-slate-100 overflow-hidden mb-10">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-100">
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {post.author.charAt(0)}
                </span>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <h3 className="font-bold text-foreground text-base">About {post.author}</h3>
                  <span className="text-xs font-semibold text-purple-600 sm:before:content-['•'] sm:before:mr-1 sm:before:text-slate-300">
                    {post.authorRole}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{post.authorBio}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Matrix Footer Area */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 px-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Share:</span>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-card border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground shadow-sm" onClick={shareOnFacebook}>
                <FacebookIcon href="#" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-card border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground shadow-sm" onClick={shareOnTwitter}>
                <TwitterIcon href="#" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-card border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground shadow-sm" onClick={shareOnLinkedIn}>
                <LinkedinIcon href="#" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-card border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground shadow-sm" onClick={shareByEmail}>
                <Mail className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => router.push('/blog')}
            className="text-muted-foreground hover:text-foreground text-xs font-semibold h-9 rounded-xl hover:bg-muted/50"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-2" />
            Back to Blog Index
          </Button>
        </div>

      </div>
    </div>
  )
}