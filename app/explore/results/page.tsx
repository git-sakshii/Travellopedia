'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signIn } from 'next-auth/react'
import { format } from 'date-fns'
import { 
  MapPin, Plane, Train, Car, Hotel, Utensils, Camera,
  Wallet, Calendar, Cloud, Newspaper, Lightbulb, Shield,
  ArrowLeft, Loader2, PlaneTakeoff, Bookmark, Clock,
  ChevronDown, ChevronUp, Users, Sun, CloudRain
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FloatingOrbs } from '@/components/floating-orbs'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creatingTrip, setCreatingTrip] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    howToReach: true,
    attractions: true,
    costs: true,
  })

  const destination = searchParams.get('destination') || ''
  const from = searchParams.get('from') || ''
  const budget = searchParams.get('budget') || '0'
  const experience = searchParams.get('experience') || ''
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''
  const isGuestMode = searchParams.get('mode') === 'guest'

  useEffect(() => {
    if (destination) {
      fetchResults()
    }
  }, [destination])

  const fetchResults = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, from, budget, experience, startDate, endDate }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.rateLimitReached) {
          setError('Guest limit reached. Sign up for unlimited access!')
        } else {
          throw new Error(data.error || 'Failed to fetch')
        }
        return
      }

      const data = await response.json()
      setResults(data)
    } catch (err: any) {
      setError(err.message || 'Failed to get travel information')
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleCreateTrip = async () => {
    if (!session) {
      toast({ title: 'Sign in required', description: 'Please sign in to create trips', variant: 'destructive' })
      return
    }

    setCreatingTrip(true)
    try {
      const tripData = {
        name: `Trip to ${destination}`,
        destination,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        budget: parseInt(budget) || 0,
        notes: `From: ${from}\nBest time: ${results?.best_time || ''}\n${results?.destination_overview || ''}`,
      }

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
      })

      if (!response.ok) throw new Error('Failed to create trip')
      const trip = await response.json()

      // Add attractions as activities
      if (results?.attractions) {
        for (let i = 0; i < Math.min(results.attractions.length, 8); i++) {
          const attr = results.attractions[i]
          await fetch(`/api/trips/${trip._id}/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: attr.name,
              dayIndex: Math.floor(i / 2),
              timeSlot: i % 2 === 0 ? 'morning' : 'afternoon',
              location: destination,
              description: attr.description,
            }),
          })
        }
      }

      toast({ title: 'Trip created!', description: 'Redirecting...' })
      router.push(`/trips/${trip._id}`)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create trip', variant: 'destructive' })
    } finally {
      setCreatingTrip(false)
    }
  }

  const handleBookmark = async () => {
    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, details: results }),
      })
      toast({ title: 'Bookmarked!', description: 'Saved to your bookmarks' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to bookmark', variant: 'destructive' })
    }
  }

  const budgetNum = parseInt(budget) || 0
  const totalMin = results?.cost_breakdown?.total_estimated?.min || 0
  const totalMax = results?.cost_breakdown?.total_estimated?.max || 0
  const withinBudget = budgetNum === 0 || budgetNum >= totalMin

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Planning your trip to {destination}...</h2>
          <p className="text-muted-foreground">Our AI is creating your personalized travel guide</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass p-12 text-center">
          <h2 className="text-xl font-bold mb-2 text-destructive">Oops!</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Link href="/explore">
              <Button variant="outline">Try Again</Button>
            </Link>
            {!session && (
              <Button onClick={() => signIn()}>Sign Up</Button>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <FloatingOrbs count={2} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <Link href="/explore" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Search
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">{destination}</h1>
            <p className="text-muted-foreground">{results?.destination_overview}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              {from && (
                <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
                  From: {from}
                </span>
              )}
              {budgetNum > 0 && (
                <span className={`text-sm px-3 py-1 rounded-full ${withinBudget ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  Budget: ₹{budgetNum.toLocaleString()}
                </span>
              )}
              {startDate && endDate && (
                <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
                  {format(new Date(startDate), 'MMM d')} - {format(new Date(endDate), 'MMM d')}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="glass" onClick={handleBookmark}>
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button className="glow-button" onClick={handleCreateTrip} disabled={creatingTrip || !session}>
              {creatingTrip ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlaneTakeoff className="h-4 w-4 mr-2" />}
              Create Trip
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* How to Reach */}
            <Card className="glass overflow-hidden">
              <button 
                onClick={() => toggleSection('howToReach')}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5"
              >
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" />
                  How to Reach {destination}
                </h2>
                {expandedSections.howToReach ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              <AnimatePresence>
                {expandedSections.howToReach && results?.how_to_reach && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 grid md:grid-cols-3 gap-4">
                      {results.how_to_reach.by_flight && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <Plane className="h-6 w-6 text-blue-400 mb-2" />
                          <h3 className="font-semibold">By Flight</h3>
                          <p className="text-sm text-muted-foreground">{results.how_to_reach.by_flight.description}</p>
                          <p className="text-sm font-medium mt-2">{results.how_to_reach.by_flight.estimated_cost}</p>
                          <p className="text-xs text-muted-foreground">{results.how_to_reach.by_flight.duration}</p>
                        </div>
                      )}
                      {results.how_to_reach.by_train && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <Train className="h-6 w-6 text-green-400 mb-2" />
                          <h3 className="font-semibold">By Train</h3>
                          <p className="text-sm text-muted-foreground">{results.how_to_reach.by_train.description}</p>
                          <p className="text-sm font-medium mt-2">{results.how_to_reach.by_train.estimated_cost}</p>
                          <p className="text-xs text-muted-foreground">{results.how_to_reach.by_train.duration}</p>
                        </div>
                      )}
                      {results.how_to_reach.by_road && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <Car className="h-6 w-6 text-orange-400 mb-2" />
                          <h3 className="font-semibold">By Road</h3>
                          <p className="text-sm text-muted-foreground">{results.how_to_reach.by_road.description}</p>
                          <p className="text-sm font-medium mt-2">{results.how_to_reach.by_road.estimated_cost}</p>
                          <p className="text-xs text-muted-foreground">{results.how_to_reach.by_road.duration}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Attractions */}
            <Card className="glass overflow-hidden">
              <button 
                onClick={() => toggleSection('attractions')}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5"
              >
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Top Attractions
                </h2>
                {expandedSections.attractions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              <AnimatePresence>
                {expandedSections.attractions && results?.attractions && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 grid md:grid-cols-2 gap-3">
                      {results.attractions.map((attr: any, i: number) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3 flex gap-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-lg shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <h3 className="font-medium">{attr.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{attr.description}</p>
                            <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                              {attr.entry_fee && <span>💰 {attr.entry_fee}</span>}
                              {attr.time_needed && <span>⏱️ {attr.time_needed}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Accommodation */}
            {results?.accommodation && (
              <Card className="glass p-4">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Hotel className="h-5 w-5 text-primary" />
                  Where to Stay
                </h2>
                <div className="grid md:grid-cols-3 gap-3">
                  {results.accommodation.map((acc: any, i: number) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3">
                      <h3 className="font-medium">{acc.type}</h3>
                      <p className="text-sm text-muted-foreground">{acc.options}</p>
                      <p className="text-sm font-medium text-primary mt-1">{acc.price_range}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Food Guide */}
            {results?.food_guide && (
              <Card className="glass p-4">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Utensils className="h-5 w-5 text-primary" />
                  Food Guide
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {results.food_guide.map((food: any, i: number) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3">
                      <h3 className="font-medium">{food.type}</h3>
                      <p className="text-sm text-muted-foreground">{food.dishes?.join(', ')}</p>
                      <p className="text-sm font-medium text-primary mt-1">{food.avg_cost}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Itinerary Suggestions */}
            {results?.itinerary_suggestions && (
              <Card className="glass p-4">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  Suggested Itinerary
                </h2>
                <div className="space-y-3">
                  {results.itinerary_suggestions.map((day: any, i: number) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3">
                      <h3 className="font-medium text-primary mb-2">Day {day.day}</h3>
                      <ul className="space-y-1">
                        {day.activities?.map((act: string, j: number) => (
                          <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full" />
                            {act}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cost Breakdown */}
            <Card className="glass p-4">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Wallet className="h-5 w-5 text-primary" />
                Cost Management
              </h2>
              {results?.cost_breakdown && (
                <div className="space-y-3">
                  {Object.entries(results.cost_breakdown).map(([key, value]: [string, any]) => {
                    if (key === 'total_estimated') return null
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')
                    return (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm">{label}</span>
                        <span className="text-sm font-medium">₹{value.min?.toLocaleString()} - ₹{value.max?.toLocaleString()}</span>
                      </div>
                    )
                  })}
                  <hr className="border-white/10" />
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Estimated</span>
                    <span className="text-primary">₹{totalMin.toLocaleString()} - ₹{totalMax.toLocaleString()}</span>
                  </div>
                  {budgetNum > 0 && (
                    <div className={`p-3 rounded-lg ${withinBudget ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {withinBudget 
                        ? `✓ Fits within your ₹${budgetNum.toLocaleString()} budget!`
                        : `⚠️ May exceed your ₹${budgetNum.toLocaleString()} budget`
                      }
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Weather & Best Time */}
            <Card className="glass p-4">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Cloud className="h-5 w-5 text-primary" />
                Weather Info
              </h2>
              <div className="flex items-center gap-4 mb-3">
                <Sun className="h-12 w-12 text-yellow-500" />
                <div>
                  <p className="font-medium">Current Season</p>
                  <p className="text-sm text-muted-foreground">{results?.weather_info}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm font-medium">Best Time to Visit</p>
                <p className="text-sm text-muted-foreground">{results?.best_time}</p>
              </div>
            </Card>

            {/* Travel Tips */}
            {results?.travel_tips && (
              <Card className="glass p-4">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Travel Tips
                </h2>
                <ul className="space-y-2">
                  {results.travel_tips.map((tip: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Safety Info */}
            {results?.safety_info && (
              <Card className="glass p-4">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-primary" />
                  Safety Info
                </h2>
                <p className="text-sm text-muted-foreground">{results.safety_info}</p>
              </Card>
            )}

            {/* Best For */}
            {results?.best_for && (
              <Card className="glass p-4">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  Best For
                </h2>
                <div className="flex flex-wrap gap-2">
                  {results.best_for.map((item: string, i: number) => (
                    <span key={i} className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
