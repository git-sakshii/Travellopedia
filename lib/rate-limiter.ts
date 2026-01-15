import getClientPromise from './mongodb'

interface RateLimitEntry {
  ip: string
  count: number
  resetAt: Date
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

const RATE_LIMIT = 5 // requests per day
const WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const client = await getClientPromise()
  const db = client.db('travelai')
  const collection = db.collection<RateLimitEntry>('rate_limits')

  const now = new Date()
  const resetAt = new Date(now.getTime() + WINDOW_MS)

  // Find existing rate limit entry for this IP
  const existing = await collection.findOne({ ip })

  if (!existing) {
    // First request from this IP - create entry
    await collection.insertOne({
      ip,
      count: 1,
      resetAt,
    })

    return {
      success: true,
      limit: RATE_LIMIT,
      remaining: RATE_LIMIT - 1,
      reset: resetAt.getTime(),
    }
  }

  // Check if the window has expired
  if (new Date(existing.resetAt) < now) {
    // Reset the counter
    await collection.updateOne(
      { ip },
      { $set: { count: 1, resetAt } }
    )

    return {
      success: true,
      limit: RATE_LIMIT,
      remaining: RATE_LIMIT - 1,
      reset: resetAt.getTime(),
    }
  }

  // Window still active - check if limit exceeded
  if (existing.count >= RATE_LIMIT) {
    return {
      success: false,
      limit: RATE_LIMIT,
      remaining: 0,
      reset: new Date(existing.resetAt).getTime(),
    }
  }

  // Increment counter
  await collection.updateOne(
    { ip },
    { $inc: { count: 1 } }
  )

  return {
    success: true,
    limit: RATE_LIMIT,
    remaining: RATE_LIMIT - existing.count - 1,
    reset: new Date(existing.resetAt).getTime(),
  }
}

// Create index for efficient lookups (run once on startup)
export async function ensureRateLimitIndexes() {
  try {
    const client = await getClientPromise()
    const db = client.db('travelai')
    const collection = db.collection('rate_limits')
    
    // Create index on ip field
    await collection.createIndex({ ip: 1 }, { unique: true })
    // Create TTL index to auto-delete expired entries
    await collection.createIndex({ resetAt: 1 }, { expireAfterSeconds: 0 })
  } catch (error) {
    console.error('Failed to create rate limit indexes:', error)
  }
}
