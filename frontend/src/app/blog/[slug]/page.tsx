/**
 * Individual Blog Post Page
 * 
 * Displays a single blog post with full content.
 * 
 * @module BlogPostPage
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, Clock, ArrowLeft, Mail } from 'lucide-react'

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
}

// Blog posts content
const blogContent: Record<string, BlogPost> = {
  // Tutorial
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
  },

  // Technology
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
  },

  // Trends
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
  },

  // News
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
  },

  // Case Studies
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
    }, 500)
    return () => clearTimeout(timer)
  }, [params.slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Tutorial': return '📚'
      case 'Technology': return '💻'
      case 'Trends': return '📈'
      case 'News': return '📰'
      case 'Case Studies': return '📊'
      default: return '📝'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full rounded-lg mb-8" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Blog', href: '/blog' },
            { label: post.category, href: '#', isActive: true },
          ]}
          showHome
        />

        {/* Header */}
        <div className="mt-8 mb-6">
          <div className="flex gap-2 mb-4">
            <Badge className="bg-primary/10 text-primary">
              {getCategoryEmoji(post.category)} {post.category}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </div>

        {/* Cover Image Placeholder */}
        <div className="h-64 md:h-96 rounded-lg overflow-hidden mb-8 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <span className="text-8xl">{getCategoryEmoji(post.category)}</span>
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none mb-8 prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary prose-strong:text-gray-900 prose-li:text-gray-600"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-sm">
              #{tag}
            </Badge>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Author Bio */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-primary">{post.author.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">About {post.author}</h3>
                <p className="text-sm text-gray-600 mb-1">{post.authorRole}</p>
                <p className="text-sm text-gray-600 mb-3">{post.authorBio}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Section */}
        <div className="flex items-center justify-between flex-wrap gap-4 mt-8">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Share this article:</span>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareOnFacebook}>
                <FacebookIcon href="#" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareOnTwitter}>
                <TwitterIcon href="#" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareOnLinkedIn}>
                <LinkedinIcon href="#" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareByEmail}>
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button variant="ghost" onClick={() => router.push('/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    </div>
  )
}