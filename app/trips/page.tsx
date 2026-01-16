'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format, differenceInDays } from 'date-fns'
import { 
  Plus, MapPin, Calendar, Wallet, Plane, 
  ChevronRight, Loader2, Trash2 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FloatingOrbs } from '@/components/floating-orbs'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Trip {
  _id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  currency: string
  totalSpent: number
  daysCount: number
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTrip, setNewTrip] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: 0,
  })
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

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
      toast({ title: 'Error', description: 'Failed to load trips', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const createTrip = async () => {
    if (!newTrip.name || !newTrip.destination || !newTrip.startDate || !newTrip.endDate) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' })
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrip),
      })

      if (res.ok) {
        const trip = await res.json()
        toast({ title: 'Success', description: 'Trip created!' })
        setDialogOpen(false)
        setNewTrip({ name: '', destination: '', startDate: '', endDate: '', budget: 0 })
        router.push(`/trips/${trip._id}`)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create trip', variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  const deleteTrip = async (tripId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Delete this trip and all its data?')) return

    try {
      await fetch(`/api/trips/${tripId}`, { method: 'DELETE' })
      setTrips(trips.filter(t => t._id !== tripId))
      toast({ title: 'Deleted', description: 'Trip removed' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  const getCountdown = (startDate: string) => {
    const days = differenceInDays(new Date(startDate), new Date())
    if (days < 0) return null
    if (days === 0) return 'Today!'
    if (days === 1) return '1 day'
    return `${days} days`
  }

  if (!session) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass p-8 text-center">
          <Plane className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-bold mb-2">Sign in to plan trips</h2>
          <p className="text-muted-foreground mb-4">Create and manage your travel plans</p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <FloatingOrbs count={3} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Trips</h1>
            <p className="text-muted-foreground">Plan and manage your adventures</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Trip
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>Create New Trip</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Trip Name</Label>
                  <Input 
                    placeholder="Summer Vacation 2024"
                    value={newTrip.name}
                    onChange={e => setNewTrip({...newTrip, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Destination</Label>
                  <Input 
                    placeholder="Paris, France"
                    value={newTrip.destination}
                    onChange={e => setNewTrip({...newTrip, destination: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input 
                      type="date"
                      value={newTrip.startDate}
                      onChange={e => setNewTrip({...newTrip, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input 
                      type="date"
                      value={newTrip.endDate}
                      onChange={e => setNewTrip({...newTrip, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Budget (₹)</Label>
                  <Input 
                    type="number"
                    placeholder="50000"
                    value={newTrip.budget || ''}
                    onChange={e => setNewTrip({...newTrip, budget: Number(e.target.value)})}
                  />
                </div>
                <Button onClick={createTrip} disabled={creating} className="w-full">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Trip
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && trips.length === 0 && (
          <Card className="glass p-12 text-center">
            <Plane className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
            <p className="text-muted-foreground mb-6">Start planning your next adventure!</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Trip
            </Button>
          </Card>
        )}

        {/* Trips Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {trips.map((trip, i) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/trips/${trip._id}`}>
                  <Card className="glass hover-lift p-6 cursor-pointer group relative">
                    {/* Countdown Badge */}
                    {getCountdown(trip.startDate) && (
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                        {getCountdown(trip.startDate)}
                      </div>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={(e) => deleteTrip(trip._id, e)}
                      className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>

                    <h3 className="text-xl font-bold mb-1 pr-16">{trip.name}</h3>
                    
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{trip.destination}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                      </span>
                      <span className="text-xs">({trip.daysCount} days)</span>
                    </div>

                    {trip.budget > 0 && (
                      <div className="flex items-center gap-2 text-sm mb-4">
                        <Wallet className="h-4 w-4 text-primary" />
                        <span>₹{trip.totalSpent.toLocaleString()} / ₹{trip.budget.toLocaleString()}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min((trip.totalSpent / trip.budget) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-primary text-sm font-medium">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
