// app/api/explore/route.ts
import { NextResponse } from 'next/server'
import { getGeminiModel } from '@/lib/gemini'
import { getServerSession } from 'next-auth'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rate-limiter'
import { getAuthOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const startTime = performance.now()

  // Define isGuestMode at the top level to be accessible in catch block
  let isGuestMode = false
  let rateLimitInfo: { success: boolean; limit: number; remaining: number; reset: number } | null = null

  try {
    // Check authentication and guest mode
    const session = await getServerSession(getAuthOptions())
    const headersList = headers()
    const referer = headersList.get('referer') || ''
    isGuestMode = referer.includes('mode=guest')
    
    // Get IP for rate limiting
    const ip = headersList.get('x-forwarded-for') || 'anonymous'

    if (!session?.user && !isGuestMode) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apply rate limiting for guest users using MongoDB
    if (isGuestMode) {
      rateLimitInfo = await checkRateLimit(ip)

      if (!rateLimitInfo.success) {
        return NextResponse.json({
          error: 'Rate limit exceeded',
          limit: rateLimitInfo.limit,
          reset: rateLimitInfo.reset,
          remaining: rateLimitInfo.remaining
        }, { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitInfo.limit.toString(),
            'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
            'X-RateLimit-Reset': rateLimitInfo.reset.toString()
          }
        })
      }
    }

    const { query, experience, dateRange } = await req.json()

    const prompt = `You are a travel expert. Provide detailed information about the destination "${query}" for someone interested in "${experience}" traveling from ${dateRange.from} to ${dateRange.to}.

Return ONLY valid JSON (no markdown, no code blocks) with these exact keys:
{
  "attractions": ["attraction 1", "attraction 2", ...],
  "best_time": "description of best times to visit",
  "transportation": ["option 1", "option 2", "option 3"],
  "accommodation": [{"name": "Hotel/Type", "price_range": "₹X,XXX - ₹X,XXX per night"}],
  "weather": "brief weather description",
  "estimated_budget": "₹X,XXX - ₹X,XXX per day",
  "personalized_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}

Keep each section concise but informative. Use INR (₹) for all prices.`

    const geminiModel = getGeminiModel()
    const result = await geminiModel.generateContent(prompt)
    const response = result.response.text()

    const endTime = performance.now()
    console.log(`Time taken: ${(endTime - startTime).toFixed(2)}ms`)

    if (!response) {
      throw new Error('No response from Gemini')
    }

    // Clean up any potential markdown formatting
    const cleanResponse = response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    // Create response with cleaned data
    const jsonResponse = NextResponse.json(JSON.parse(cleanResponse))

    // Add rate limit headers to successful response if in guest mode
    if (isGuestMode && rateLimitInfo) {
      jsonResponse.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString())
      jsonResponse.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
      jsonResponse.headers.set('X-RateLimit-Reset', rateLimitInfo.reset.toString())
    }

    return jsonResponse

  } catch (error) {
    console.error('Error:', error)

    // Create error response with appropriate status and message
    const errorResponse = (message: string, status: number) => {
      const response = NextResponse.json({ error: message }, { status })
      
      // Add rate limit headers to error responses if in guest mode
      if (isGuestMode && rateLimitInfo) {
        response.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString())
        response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
        response.headers.set('X-RateLimit-Reset', rateLimitInfo.reset.toString())
      }
      
      return response
    }

    if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('timeout')) {
        return errorResponse('Slow Internet Connection. Please try again later.', 504)
      }

      // Handle JSON parsing errors
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return errorResponse('Invalid response format. Please try again.', 500)
      }

      return errorResponse('Failed to process request. Please try again later.', 500)
    }

    return errorResponse('Unknown error occurred. Please try again later.', 500)
  }
}