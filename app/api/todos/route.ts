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
    const todos = await db.collection('todos')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(todos)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text } = await req.json()
    const client = await getClientPromise()
    const db = client.db('travelai')
    
    const todo = {
      text,
      userId,
      completed: false,
      createdAt: new Date(),
    }

    await db.collection('todos').insertOne(todo)
    return NextResponse.json(todo)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    )
  }
}