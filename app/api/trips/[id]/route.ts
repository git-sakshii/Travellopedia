import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import getClientPromise from '@/lib/mongodb'
import { getAuthOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// GET single trip with all details
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(getAuthOptions())
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await getClientPromise()
    const db = client.db('travelai')
    
    const trip = await db.collection('trips').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id,
    })

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    // Get related data
    const [activities, expenses, packingItems] = await Promise.all([
      db.collection('activities')
        .find({ tripId: params.id })
        .sort({ dayIndex: 1, order: 1 })
        .toArray(),
      db.collection('expenses')
        .find({ tripId: params.id })
        .sort({ date: -1 })
        .toArray(),
      db.collection('packing_items')
        .find({ tripId: params.id })
        .toArray(),
    ])

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const daysCount = Math.ceil(
      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1

    return NextResponse.json({
      ...trip,
      activities,
      expenses,
      packingItems,
      totalSpent,
      daysCount,
    })
  } catch (error) {
    console.error('Error fetching trip:', error)
    return NextResponse.json({ error: 'Failed to fetch trip' }, { status: 500 })
  }
}

// PUT update trip
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(getAuthOptions())
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const client = await getClientPromise()
    const db = client.db('travelai')
    
    const result = await db.collection('trips').updateOne(
      { _id: new ObjectId(params.id), userId: session.user.id },
      {
        $set: {
          name: data.name,
          destination: data.destination,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          budget: data.budget,
          currency: data.currency,
          notes: data.notes,
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating trip:', error)
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 })
  }
}

// DELETE trip and all related data
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(getAuthOptions())
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await getClientPromise()
    const db = client.db('travelai')
    
    // Delete trip and all related data
    await Promise.all([
      db.collection('trips').deleteOne({
        _id: new ObjectId(params.id),
        userId: session.user.id,
      }),
      db.collection('activities').deleteMany({ tripId: params.id }),
      db.collection('expenses').deleteMany({ tripId: params.id }),
      db.collection('packing_items').deleteMany({ tripId: params.id }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trip:', error)
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 })
  }
}
