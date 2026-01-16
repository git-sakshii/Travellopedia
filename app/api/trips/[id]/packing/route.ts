import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import getClientPromise from '@/lib/mongodb'
import { getAuthOptions } from '@/lib/auth'
import { getGeminiModel } from '@/lib/gemini'
import { ObjectId } from 'mongodb'

// GET packing items for a trip
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
    
    const items = await db.collection('packing_items')
      .find({ tripId: params.id })
      .toArray()

    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch packing items' }, { status: 500 })
  }
}

// POST create packing item
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
    
    // Check if it's a request for AI suggestions
    if (data.generateAI) {
      const trip = await db.collection('trips').findOne({
        _id: new ObjectId(params.id),
      })

      if (!trip) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
      }

      const prompt = `Generate a packing list for a trip to ${trip.destination} from ${new Date(trip.startDate).toLocaleDateString()} to ${new Date(trip.endDate).toLocaleDateString()}.

Return ONLY valid JSON (no markdown) with this structure:
{
  "items": [
    {"category": "clothing", "name": "T-shirts", "quantity": 4},
    {"category": "toiletries", "name": "Toothbrush", "quantity": 1},
    ...
  ]
}

Categories: clothing, toiletries, electronics, documents, medicine, other
Include 15-20 essential items.`

      const geminiModel = getGeminiModel()
      const result = await geminiModel.generateContent(prompt)
      const response = result.response.text()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()

      const parsed = JSON.parse(response)
      
      // Insert all items
      const itemsToInsert = parsed.items.map((item: any) => ({
        tripId: params.id,
        category: item.category,
        name: item.name,
        quantity: item.quantity || 1,
        packed: false,
      }))

      await db.collection('packing_items').insertMany(itemsToInsert)
      
      return NextResponse.json(itemsToInsert)
    }

    // Regular item creation
    const item = {
      tripId: params.id,
      category: data.category,
      name: data.name,
      quantity: data.quantity || 1,
      packed: false,
    }

    const result = await db.collection('packing_items').insertOne(item)
    
    return NextResponse.json({ ...item, _id: result.insertedId })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to create packing item' }, { status: 500 })
  }
}

// PUT toggle packed status
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(getAuthOptions())
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId, packed } = await req.json()
    const client = await getClientPromise()
    const db = client.db('travelai')
    
    await db.collection('packing_items').updateOne(
      { _id: new ObjectId(itemId) },
      { $set: { packed } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

// DELETE packing item
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(getAuthOptions())
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('itemId')
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    const client = await getClientPromise()
    const db = client.db('travelai')
    
    await db.collection('packing_items').deleteOne({ _id: new ObjectId(itemId) })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
