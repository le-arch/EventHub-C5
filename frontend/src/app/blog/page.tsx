/**
 * Blog Listing Page
 * 
 * Displays 5 blog posts across 5 categories.
 * 
 * @module BlogPage
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Clock, Search } from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
}

// 5 Blog Posts - One per category
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
    }, 800)
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <Breadcrumb 
            items={[{ label: 'Blog', href: '#', isActive: true }]}
            showHome
          />
          <div className="text-center mt-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">EventHub Blog 📝</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Insights, tips, and news for event organizers in Cameroon
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="🔍 Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {getCategoryEmoji(category)} {category}
                {category !== 'All' && (
                  <span className="ml-1 text-xs opacity-70">
                    ({posts.filter(p => p.category === category).length})
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        {filteredPosts.length > 0 && (
          <div className="text-sm text-gray-500 mb-4">
            Found {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Blog Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500">No posts found matching your criteria 📭</p>
            {(searchTerm || selectedCategory !== 'All') && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('All')
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id}>
                <Card className="h-full card-hover cursor-pointer">
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/10 rounded-t-lg flex items-center justify-center">
                    <span className="text-6xl">{getCategoryEmoji(post.category)}</span>
                    <Badge className="absolute top-3 right-3 bg-white/90 text-gray-800">
                      {getCategoryEmoji(post.category)} {post.category}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <div className="line-clamp-2 text-sm text-gray-600 mt-2">
                      {post.excerpt}
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
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