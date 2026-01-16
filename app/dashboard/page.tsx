'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { format, differenceInDays } from 'date-fns'
import { 
  Plane, MapPin, Calendar, Wallet, Cloud, 
  ArrowRight, Plus, Sparkles, Sun 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FloatingOrbs } from '@/components/floating-orbs'

interface Trip {
  _id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  totalSpent: number
  daysCount: number
}

interface WeatherData {
  temp: number
  description: string
  icon: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) fetchTrips()
  }, [session])

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips')
      if (res.ok) {
        const data = await res.json()
        setTrips(data)
      }
    } catch (error) {
      console.error('Failed to load trips')
    } finally {
      setLoading(false)
    }
  }

  // Get upcoming trip (closest future trip)
  const upcomingTrip = trips
    .filter(t => new Date(t.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]

  // Get active trip (currently on trip)
  const activeTrip = trips.find(t => {
    const now = new Date()
    return new Date(t.startDate) <= now && new Date(t.endDate) >= now
  })

  // Recent trips (past)
  const recentTrips = trips
    .filter(t => new Date(t.endDate) < new Date())
    .slice(0, 3)

  const countdown = upcomingTrip 
    ? differenceInDays(new Date(upcomingTrip.startDate), new Date())
    : null

  if (!session) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass p-8 text-center max-w-md">
          <Plane className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Welcome to Travellopedia</h1>
          <p className="text-muted-foreground mb-6">Sign in to access your travel dashboard</p>
          <div className="flex gap-3 justify-center">
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
            <Link href="/explore?mode=guest">
              <Button variant="outline">Try as Guest</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <FloatingOrbs count={3} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">
            Welcome back, {session.user?.name?.split(' ')[0] || 'Traveler'}!
          </h1>
          <p className="text-muted-foreground">
            {activeTrip 
              ? `You're currently on a trip to ${activeTrip.destination}!`
              : upcomingTrip 
                ? `Your next adventure awaits...`
                : `Ready to plan your next adventure?`
            }
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Countdown Card (if upcoming trip) */}
            {upcomingTrip && countdown !== null && countdown > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass p-6 bg-gradient-to-r from-primary/10 to-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">UPCOMING TRIP</p>
                      <h2 className="text-2xl font-bold">{upcomingTrip.name}</h2>
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        {upcomingTrip.destination}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(upcomingTrip.startDate), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary">{countdown}</div>
                      <div className="text-sm text-muted-foreground">days to go</div>
                    </div>
                  </div>
                  <Link href={`/trips/${upcomingTrip._id}`}>
                    <Button className="mt-4 w-full" variant="outline">
                      View Trip Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            )}

            {/* Active Trip Card */}
            {activeTrip && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass p-6 border-primary border-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-500">ACTIVE TRIP</span>
                  </div>
                  <h2 className="text-2xl font-bold">{activeTrip.name}</h2>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    {activeTrip.destination}
                  </p>
                  {activeTrip.budget > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Budget</span>
                        <span>₹{activeTrip.totalSpent.toLocaleString()} / ₹{activeTrip.budget.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${Math.min((activeTrip.totalSpent / activeTrip.budget) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <Link href={`/trips/${activeTrip._id}`}>
                    <Button className="mt-4 w-full">
                      Continue Planning
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <Link href="/trips">
                  <Card className="glass p-4 hover-lift cursor-pointer text-center">
                    <Plus className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">New Trip</p>
                  </Card>
                </Link>
                <Link href="/explore">
                  <Card className="glass p-4 hover-lift cursor-pointer text-center">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">AI Explore</p>
                  </Card>
                </Link>
                <Link href="/bookmarks">
                  <Card className="glass p-4 hover-lift cursor-pointer text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">Saved Places</p>
                  </Card>
                </Link>
              </div>
            </motion.div>

            {/* Recent Trips */}
            {recentTrips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-4">Recent Adventures</h3>
                <div className="space-y-3">
                  {recentTrips.map(trip => (
                    <Link key={trip._id} href={`/trips/${trip._id}`}>
                      <Card className="glass p-4 hover-lift cursor-pointer flex items-center justify-between">
                        <div>
                          <p className="font-medium">{trip.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {trip.destination}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(trip.endDate), 'MMM yyyy')}
                          </p>
                          {trip.totalSpent > 0 && (
                            <p className="text-sm font-medium">₹{trip.totalSpent.toLocaleString()}</p>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass p-6">
                <h3 className="font-semibold mb-4">Your Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Trips</span>
                    <span className="font-bold">{trips.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Places Visited</span>
                    <span className="font-bold">
                      {new Set(trips.map(t => t.destination)).size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Spent</span>
                    <span className="font-bold">
                      ₹{trips.reduce((sum, t) => sum + (t.totalSpent || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Travel Tip
                </h3>
                <p className="text-sm text-muted-foreground">
                  Book flights on Tuesday or Wednesday for the best deals. Prices are typically 
                  15-20% lower than weekend bookings!
                </p>
              </Card>
            </motion.div>

            {/* Weather Widget Placeholder */}
            {upcomingTrip && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="glass p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-primary" />
                    Weather in {upcomingTrip.destination}
                  </h3>
                  <div className="flex items-center gap-4">
                    <Sun className="h-12 w-12 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">28°C</p>
                      <p className="text-sm text-muted-foreground">Partly Cloudy</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    *Weather data coming soon
                  </p>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
