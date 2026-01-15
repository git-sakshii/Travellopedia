'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LucideIcon, MapPin, Calendar, Plane, Hotel, Cloud, DollarSign, Lightbulb, Bookmark, Search, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSession, signIn } from 'next-auth/react'
import { SearchForm } from './components/search-form'
import { DateRangePicker } from './components/date-range-picker'
import { ExperienceInput } from './components/experience-input'
import { Suggestions } from './components/suggestions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FloatingOrbs } from '@/components/floating-orbs'

// ResultCard Types and Component
type ContentItem = {
  name?: string
  price_range?: string
  description?: string
  [key: string]: any
}

type Content = string | string[] | ContentItem[]

interface ResultCardProps {
  icon: LucideIcon
  title: string
  content: Content
  className?: string
  index?: number
}

const ResultCard = ({
  icon: Icon,
  title,
  content,
  className = '',
  index = 0,
}: ResultCardProps) => {
  const renderContentItem = (item: string | ContentItem, idx: number) => {
    if (typeof item === 'string') {
      return <li key={idx}>{item}</li>
    }

    if (typeof item === 'object' && item !== null) {
      const displayText = item.name || item.value || JSON.stringify(item)
      const details = item.price_range || item.description || ''
      return (
        <li key={idx}>
          <span className="font-medium">{displayText}</span>
          {details && <span className="text-muted-foreground"> - {details}</span>}
        </li>
      )
    }

    return null
  }

  const renderContent = () => {
    if (Array.isArray(content)) {
      return content.map((item, idx) => renderContentItem(item, idx))
    }
    return <p className="mt-2 text-muted-foreground">{content}</p>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className={`glass p-6 hover-lift ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        {Array.isArray(content) ? (
          <ul className="list-disc list-inside space-y-2 text-sm">
            {renderContent()}
          </ul>
        ) : (
          renderContent()
        )}
      </Card>
    </motion.div>
  )
}

// ExplorePage Types
type TravelInfo = {
  attractions: any[]
  best_time: string
  transportation: any[]
  accommodation: any[]
  weather: string
  estimated_budget: string
  personalized_suggestions: any[]
}

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="grid md:grid-cols-2 gap-6">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg shimmer" />
          <div className="h-4 w-32 rounded shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded shimmer" />
          <div className="h-3 w-3/4 rounded shimmer" />
          <div className="h-3 w-1/2 rounded shimmer" />
        </div>
      </motion.div>
    ))}
  </div>
)

// Main ExplorePage Component
export default function ExplorePage() {
  const [results, setResults] = useState<TravelInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [experience, setExperience] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date(),
  })
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { data: session } = useSession()
  const isSignedIn = !!session
  const searchParams = useSearchParams()
  const isGuestMode = searchParams.get('mode') === 'guest'
  const [rateLimitReached, setRateLimitReached] = useState(false)

  const handleSearch = async (data: { query: string }) => {
    setSearchQuery(data.query)

    if (!isSignedIn && !isGuestMode) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in or use guest mode to continue',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setError(null)
    setRateLimitReached(false)

    try {
      const response = await fetch('/api/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: data.query, experience, dateRange }),
      })

      if (response.status === 429) {
        const data = await response.json()
        if (!isSignedIn) {
          setRateLimitReached(true)
          toast({
            title: 'Rate limit exceeded',
            description: `Guest mode limit reached. Please sign up to continue. Resets in ${Math.ceil(
              (data.reset - Date.now()) / 1000 / 60
            )} minutes.`,
            variant: 'destructive',
          })
        }
        return
      }

      if (!response.ok) throw new Error('Failed to fetch travel information')

      const result = await response.json()
      setResults(result)

      if (isGuestMode) {
        const remaining = response.headers.get('X-RateLimit-Remaining')
        toast({
          title: 'Guest Mode',
          description: `${remaining} queries remaining`,
        })
      }
    } catch (error) {
      console.error(error)
      setError('Failed to fetch travel information. Please try again.')
      toast({
        title: 'Error',
        description: 'Failed to fetch travel information. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = async () => {
    if (!results || !searchQuery) return

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: searchQuery,
          details: results,
        }),
      })

      if (!response.ok) throw new Error('Failed to save bookmark')

      toast({
        title: 'Success',
        description: 'Place bookmarked successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to bookmark place',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 gradient-bg -z-10" />
      <FloatingOrbs count={3} />
      
      {/* Header */}
      <div className="relative py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Plan Your Perfect Adventure</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto px-4">
            Enter your destination and let AI create a personalized travel guide for you
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {!rateLimitReached ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="glass gradient-border p-6 mb-8">
                  <div className="grid gap-6">
                    <Suggestions onSelect={(place) => handleSearch({ query: place })} />
                    <SearchForm onSubmit={handleSearch} loading={loading} />
                    <ExperienceInput value={experience} onChange={setExperience} />
                    <DateRangePicker onDateChange={setDateRange} />
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="limit"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="glass p-8 mb-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Guest Query Limit Reached</h2>
                  <p className="text-muted-foreground mb-6">Sign up to continue exploring and get unlimited access!</p>
                  <Button size="lg" className="glow-button" onClick={() => signIn()}>
                    Sign Up Now
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl mb-8"
              >
                <strong>{error}</strong>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {loading && !rateLimitReached && <LoadingSkeleton />}

          {/* Results */}
          <AnimatePresence>
            {results && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex justify-end mb-4">
                  <Button onClick={handleBookmark} variant="outline" className="glass">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmark this place
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <ResultCard icon={MapPin} title="Must-Visit Places" content={results?.attractions || []} index={0} />
                  <ResultCard icon={Calendar} title="Best Time to Visit" content={results?.best_time || ''} index={1} />
                  <ResultCard icon={Plane} title="Getting Around" content={results?.transportation || []} index={2} />
                  <ResultCard icon={Hotel} title="Where to Stay" content={results?.accommodation || []} index={3} />
                  <ResultCard icon={Cloud} title="Weather" content={results?.weather || ''} index={4} />
                  <ResultCard icon={DollarSign} title="Budget Estimate" content={results?.estimated_budget || ''} index={5} />
                  <ResultCard 
                    icon={Lightbulb} 
                    title="Personalized Suggestions" 
                    content={results?.personalized_suggestions || []} 
                    className="md:col-span-2" 
                    index={6} 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}