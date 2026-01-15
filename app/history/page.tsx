'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { DetailDialog } from '../explore/components/detail-dialog'

interface TripHistory {
  id: string
  destination: string
  dateFrom: string
  dateTo: string
  experience: string
  imageUrl: string
  details: {
    attractions: string[]
    transportation: string[]
    accommodation: string[]
    weather: string
    budget: string
    suggestions: string[]
  }
}

export default function HistoryPage() {
  const [trips, setTrips] = useState<TripHistory[]>([])
  const [selectedTrip, setSelectedTrip] = useState<TripHistory | null>(null)
  const { data: session } = useSession()
  const isSignedIn = !!session

  useEffect(() => {
    // Fetch trip history from API
    const fetchTrips = async () => {
      if (isSignedIn) {
        // Fetch trips for the user
      }
    }

    fetchTrips()
  }, [isSignedIn])

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[200px] mb-8">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828"
          alt="Travel History"
          fill
          className="object-cover brightness-75"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <h1 className="text-4xl font-bold text-white">Your Travel History</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card 
              key={trip.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedTrip(trip)}
            >
              <div className="relative h-48">
                <Image
                  src={trip.imageUrl}
                  alt={trip.destination}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2 text-foreground">{trip.destination}</h3>
                <p className="text-muted-foreground mb-2">
                  {format(new Date(trip.dateFrom), 'MMM d, yyyy')} -{' '}
                  {format(new Date(trip.dateTo), 'MMM d, yyyy')}
                </p>
                <p className="text-muted-foreground line-clamp-2">{trip.experience}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedTrip && (
        <DetailDialog
          open={!!selectedTrip}
          onOpenChange={() => setSelectedTrip(null)}
          title={selectedTrip.destination}
          content={[
            ...selectedTrip.details.attractions,
            ...selectedTrip.details.transportation,
            ...selectedTrip.details.accommodation,
            selectedTrip.details.weather,
            selectedTrip.details.budget,
            ...selectedTrip.details.suggestions,
          ]}
        />
      )}
    </div>
  )
}