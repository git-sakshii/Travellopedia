import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import getClientPromise from '@/lib/mongodb'
import { getAuthOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// GET all trips for user
export async function GET() {
  try {
    const session = await getServerSession(getAuthOptions())
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await getClientPromise()
    const db = client.db('travelai')
    
    const trips = await db.collection('trips')
      .find({ userId: session.user.id })
      .sort({ startDate: -1 })
      .toArray()

    // Get expense totals for each trip
    const tripsWithTotals = await Promise.all(
      trips.map(async (trip) => {
        const expenses = await db.collection('expenses')
          .find({ tripId: trip._id.toString() })
          .toArray()
        
        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
        const daysCount = Math.ceil(
          (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
        ) + 1

        return { ...trip, totalSpent, daysCount }
      })
    )

    return NextResponse.json(tripsWithTotals)
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
  }
}

// POST create new trip
export async function POST(req: Request) {
  try {
    const session = await getServerSession(getAuthOptions())
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const client = await getClientPromise()
    const db = client.db('travelai')
    
    const trip = {
      userId: session.user.id,
      name: data.name,
      destination: data.destination,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      budget: data.budget || 0,
      currency: data.currency || 'INR',
      coverImage: data.coverImage,
      notes: data.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('trips').insertOne(trip)
    
    return NextResponse.json({ ...trip, _id: result.insertedId })
  } catch (error) {
    console.error('Error creating trip:', error)
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })
  }
}
