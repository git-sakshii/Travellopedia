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
    const bookmarks = await db.collection('bookmarks')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(bookmarks)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(getAuthOptions())
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const client = await getClientPromise()
    const db = client.db('travelai')
    
    const bookmark = {
      ...data,
      userId: session.user.id,
      createdAt: new Date(),
    }

    await db.collection('bookmarks').insertOne(bookmark)
    return NextResponse.json(bookmark)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    )
  }
}