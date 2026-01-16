'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { 
  MapPin, Plane, Search, Wallet, Calendar,
  Sparkles, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FloatingOrbs } from '@/components/floating-orbs'
import { useToast } from '@/hooks/use-toast'

const POPULAR_DESTINATIONS = [
  { name: 'Paris', country: 'France', emoji: '🗼' },
  { name: 'Tokyo', country: 'Japan', emoji: '🗾' },
  { name: 'Bali', country: 'Indonesia', emoji: '🏝️' },
  { name: 'Dubai', country: 'UAE', emoji: '🏜️' },
  { name: 'New York', country: 'USA', emoji: '🗽' },
  { name: 'Goa', country: 'India', emoji: '🏖️' },
]

export default function ExplorePage() {
  const [destination, setDestination] = useState('')
  const [fromLocation, setFromLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [experience, setExperience] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const isGuestMode = searchParams.get('mode') === 'guest'

  const handleSearch = () => {
    if (!destination) {
      toast({ title: 'Required', description: 'Please enter a destination', variant: 'destructive' })
      return
    }

    // Build query params
    const params = new URLSearchParams({
      destination,
      from: fromLocation || 'Not specified',
      budget: budget || '0',
      experience: experience || '',
      startDate: startDate || '',
      endDate: endDate || '',
      ...(isGuestMode && { mode: 'guest' }),
    })

    router.push(`/explore/results?${params.toString()}`)
  }

  const handleQuickSelect = (name: string) => {
    setDestination(name)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 gradient-bg -z-10" />
      <FloatingOrbs count={3} />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Plan Your Dream Trip</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tell us where you want to go, and our AI will create a personalized travel plan with budget recommendations
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass p-8">
              {/* Popular Destinations */}
              <div className="mb-8">
                <Label className="text-sm text-muted-foreground mb-3 block">Popular Destinations</Label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <button
                      key={dest.name}
                      onClick={() => handleQuickSelect(dest.name)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        destination === dest.name 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {dest.emoji} {dest.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Inputs */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Destination */}
                <div className="md:col-span-2">
                  <Label className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Where do you want to go?
                  </Label>
                  <Input
                    placeholder="Enter destination (e.g., Paris, France)"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="text-lg"
                  />
                </div>

                {/* From Location */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Plane className="h-4 w-4 text-primary" />
                    Traveling from?
                  </Label>
                  <Input
                    placeholder="Your city (e.g., Mumbai)"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                  />
                </div>

                {/* Budget */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    Budget (₹)
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 50000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>

                {/* Dates */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Start Date
                  </Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    End Date
                  </Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                {/* Experience */}
                <div className="md:col-span-2">
                  <Label className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    What kind of experience? (optional)
                  </Label>
                  <Input
                    placeholder="e.g., Adventure, Relaxation, Cultural, Romantic..."
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>
              </div>

              {/* Search Button */}
              <Button 
                onClick={handleSearch}
                size="lg" 
                className="w-full text-lg glow-button"
              >
                <Search className="h-5 w-5 mr-2" />
                Search & Plan My Trip
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              {!session && !isGuestMode && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  <a href="/auth/signin" className="text-primary hover:underline">Sign in</a> for unlimited searches, or{' '}
                  <a href="/explore?mode=guest" className="text-primary hover:underline">try as guest</a> (5 searches/day)
                </p>
              )}
            </Card>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-4 mt-8"
          >
            {[
              { icon: Sparkles, title: 'AI-Powered', desc: 'Smart recommendations based on your preferences' },
              { icon: Wallet, title: 'Budget Planning', desc: 'Cost breakdown to fit your budget' },
              { icon: MapPin, title: 'Complete Guide', desc: 'Weather, news, and how to reach' },
            ].map((feature, i) => (
              <Card key={i} className="glass p-4 text-center">
                <feature.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}