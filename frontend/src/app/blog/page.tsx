/**
 * Blog Listing Page (Light Theme)
 * 
 * Displays blog posts across structured categories following the premium landing page aesthetic.
 * 
 * @module BlogPage
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Clock, Search, ArrowRight, BookOpen, Layers } from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'

// Types
interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImage: string
  author: string
  publishedAt: string
  readTime: number
  category: string
  gradient: string
}

// 5 Blog Posts - Updated with specific landing cover gradients
const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'how-to-sell-tickets-online-in-cameroon',
    title: 'How to Sell Tickets Online in Cameroon: A Complete Guide',
    excerpt: 'Learn the best strategies for selling event tickets online in Cameroon using Mobile Money and QR codes. A step-by-step guide for organizers.',
    coverImage: '',
    author: 'Leonie Basil',
    publishedAt: '2026-06-15T10:00:00Z',
    readTime: 5,
    category: 'Tutorial',
    gradient: 'from-purple-500/10 to-indigo-500/5 border-purple-500/10',
  },
  {
    id: '2',
    slug: 'qr-code-check-in-benefits',
    title: 'Why QR Code Check-in is a Game Changer for Events',
    excerpt: 'Discover how QR code technology can streamline your event entry process, prevent fraud, and save hours of waiting time.',
    coverImage: '',
    author: 'Fonyuy Verena',
    publishedAt: '2026-05-10T10:00:00Z',
    readTime: 4,
    category: 'Technology',
    gradient: 'from-blue-500/10 to-indigo-500/5 border-blue-500/10',
  },
  {
    id: '3',
    slug: 'mobile-money-payments-for-events',
    title: 'The Rise of Mobile Money Payments for Events in Cameroon',
    excerpt: 'Explore how MTN Momo and Orange Money are transforming event ticketing and making it easier for attendees to purchase tickets.',
    coverImage: '',
    author: 'Rosine Achah',
    publishedAt: '2026-06-05T10:00:00Z',
    readTime: 6,
    category: 'Trends',
    gradient: 'from-pink-500/10 to-purple-500/5 border-pink-500/10',
  },
  {
    id: '4',
    slug: 'eventhub-launches-in-cameroon',
    title: 'EventHub Launches in Cameroon: Revolutionizing Event Management',
    excerpt: 'We are excited to announce the official launch of EventHub in Cameroon, bringing modern event management to local organizers.',
    coverImage: '',
    author: 'Leonie Basil',
    publishedAt: '2026-06-01T10:00:00Z',
    readTime: 3,
    category: 'News',
    gradient: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/10',
  },
  {
    id: '5',
    slug: 'douala-music-fest-case-study',
    title: 'Case Study: How Douala Music Fest Sold 5,000+ Tickets Using EventHub',
    excerpt: 'Learn how one of Cameroon\'s biggest music festivals used EventHub to manage ticket sales, prevent fraud, and speed up entry.',
    coverImage: '',
    author: 'Fonyuy Verena',
    publishedAt: '2026-05-20T10:00:00Z',
    readTime: 8,
    category: 'Case Studies',
    gradient: 'from-amber-500/10 to-orange-500/5 border-amber-500/10',
  },
]

const categories = ['All', 'Tutorial', 'Technology', 'Trends', 'News', 'Case Studies']

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(blogPosts)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      searchTerm === '' ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

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

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50">
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <Skeleton className="h-6 w-32 mb-8 mx-auto rounded-full" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="bg-card border-border">
                <Skeleton className="h-44 w-full rounded-t-2xl" />
                <CardHeader className="space-y-2">
                  <Skeleton className="h-5 w-1/4 rounded-full" />
                  <Skeleton className="h-6 w-5/6" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/50 text-foreground antialiased selection:bg-purple-500/10 overflow-hidden relative">
      
      {/* Light Gradient Background Mesh Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[300px] right-1/4 w-[700px] h-[700px] bg-blue-200/20 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Hero Header Section */}
      <div className="relative border-b border-border/80 bg-gradient-to-b from-purple-50/60 via-indigo-50/40 to-transparent pt-12 pb-20 z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex justify-center mb-8">
            <Breadcrumb 
              items={[{ label: 'Blog', href: '#', isActive: true }]}
              showHome
            />
          </div>
          
          <div className="text-center space-y-6">
            {/* Elegant Brand Logo Container */}
            <div className="inline-flex relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="relative p-4 bg-card border border-border rounded-3xl shadow-xl shadow-slate-200/60">
                <Image 
                  src="/images/logo.svg" 
                  alt="EventHub Brand Icon" 
                  width={56} 
                  height={56}
                  className="w-14 h-14"
                  priority
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Resources and Insights
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                The EventHub Blog
              </h1>
            </div>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto font-medium">
              Expert guides, payment trends, and localized strategies built to support event growth inside Cameroon.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl relative z-10">
        
        {/* Search Input and Category Pills Navigation */}
        <div className="space-y-6 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            
            {/* Input Search Block */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-11 bg-card border-border shadow-sm rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-purple-500/20 focus-visible:border-purple-500"
              />
            </div>

            {/* Total Count Flag */}
            {filteredPosts.length > 0 && (
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground self-center px-1">
                Showing {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Dynamic Filtering Navigation Array */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none flex-wrap">
            {categories.map((category) => {
              const isActive = selectedCategory === category
              const count = category === 'All' ? posts.length : posts.filter(p => p.category === category).length
              
              return (
                <Button
                  key={category}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 text-xs font-semibold h-8 transition-all ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-card border-border hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <span>{category}</span>
                  <span className={`ml-1.5 text-[10px] font-bold ${isActive ? 'text-purple-300' : 'text-muted-foreground'}`}>
                    ({count})
                  </span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Missing Query Empty Canvas Case */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-3xl shadow-xl shadow-slate-200/40 max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 bg-muted/50 border border-border rounded-xl flex items-center justify-center mx-auto">
              <Layers className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-foreground text-lg">No resources found</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">We couldn&apos;t match any articles to your custom criteria parameters.</p>
            </div>
            {(searchTerm || selectedCategory !== 'All') && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('All')
                }}
                className="text-purple-600 font-semibold text-sm"
              >
                Reset active search parameters
              </Button>
            )}
          </div>
        ) : (
          
          /* Core Grid Representation Matrix */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id} className="group">
                <Card className="h-full bg-card border-border/80 rounded-2xl overflow-hidden shadow-lg shadow-slate-200/40 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 flex flex-col">
                  
                  {/* Decorative Banner Top Placeholder */}
                  <div className={`relative h-44 bg-gradient-to-br ${post.gradient} border-b flex items-center justify-center transition-all group-hover:opacity-90 overflow-hidden`}>
                    <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,transparent)]" />
                    <BookOpen className="h-10 w-10 text-muted-foreground/10 fill-blue-50 absolute" />
                    <Badge className="absolute top-4 left-4 bg-white/90 border border-border/60 shadow-sm text-foreground font-bold hover:bg-card text-[10px] uppercase tracking-wider rounded-md">
                      {post.category}
                    </Badge>
                  </div>

                  <CardHeader className="space-y-2 pt-6 flex-1">
                    <CardTitle className="text-lg font-bold text-foreground tracking-tight leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 text-muted-foreground text-xs md:text-sm leading-relaxed">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="flex justify-between items-center text-[11px] font-semibold text-muted-foreground border-t border-slate-100 pt-4 pb-5 px-6">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{post.readTime} min</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}