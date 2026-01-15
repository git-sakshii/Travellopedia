import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import getClientPromise from '@/lib/mongodb'
import { getAuthOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(getAuthOptions())
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await getClientPromise()
    const db = client.db('travelai')
    const history = await db.collection('history')
      .find({ userId: session.user.id })
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