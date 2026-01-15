import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import getClientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await getClientPromise()
    const db = client.db('travelai')
    const history = await db.collection('history')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(history)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}