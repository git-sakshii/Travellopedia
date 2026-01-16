import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import getClientPromise from '@/lib/mongodb'
import { getAuthOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// GET expenses for a trip
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
    
    const expenses = await db.collection('expenses')
      .find({ tripId: params.id })
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json(expenses)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

// POST create expense
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
    
    const expense = {
      tripId: params.id,
      category: data.category,
      amount: data.amount,
      currency: data.currency || 'INR',
      description: data.description,
      date: new Date(data.date || Date.now()),
      paidBy: data.paidBy,
      splitWith: data.splitWith || [],
      createdAt: new Date(),
    }

    const result = await db.collection('expenses').insertOne(expense)
    
    return NextResponse.json({ ...expense, _id: result.insertedId })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}

// DELETE expense
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(getAuthOptions())
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const expenseId = searchParams.get('expenseId')
    
    if (!expenseId) {
      return NextResponse.json({ error: 'Expense ID required' }, { status: 400 })
    }

    const client = await getClientPromise()
    const db = client.db('travelai')
    
    await db.collection('expenses').deleteOne({ _id: new ObjectId(expenseId) })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
