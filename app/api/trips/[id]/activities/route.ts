import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import getClientPromise from '@/lib/mongodb'
import { getAuthOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// GET activities for a trip
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
    
    const activities = await db.collection('activities')
      .find({ tripId: params.id })
      .sort({ dayIndex: 1, order: 1 })
      .toArray()

    return NextResponse.json(activities)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

// POST create activity
export async function POST(
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
    
    // Get max order for this day
    const lastActivity = await db.collection('activities')
      .findOne(
        { tripId: params.id, dayIndex: data.dayIndex },
        { sort: { order: -1 } }
      )
    
    const activity = {
      tripId: params.id,
      dayIndex: data.dayIndex,
      timeSlot: data.timeSlot || 'morning',
      title: data.title,
      description: data.description || '',
      location: data.location || '',
      estimatedCost: data.estimatedCost || 0,
      duration: data.duration || 60,
      order: lastActivity ? lastActivity.order + 1 : 0,
      completed: false,
    }

    const result = await db.collection('activities').insertOne(activity)
    
    return NextResponse.json({ ...activity, _id: result.insertedId })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}

// PUT update activity order (for drag and drop)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(getAuthOptions())
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { activityId, dayIndex, order, timeSlot } = await req.json()
    const client = await getClientPromise()
    const db = client.db('travelai')
    
    await db.collection('activities').updateOne(
      { _id: new ObjectId(activityId), tripId: params.id },
      { $set: { dayIndex, order, timeSlot } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 })
  }
}
