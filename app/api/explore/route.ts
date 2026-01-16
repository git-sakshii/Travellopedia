import { NextResponse } from 'next/server'
import { getGeminiModel } from '@/lib/gemini'
import { getServerSession } from 'next-auth'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rate-limiter'
import { getAuthOptions } from '@/lib/auth'
import { repairAndParseJSON } from '@/lib/json-repair'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let isGuestMode = false

  try {
    // Check authentication and guest mode
    const session = await getServerSession(getAuthOptions())
    const headersList = headers()
    const referer = headersList.get('referer') || ''
    isGuestMode = referer.includes('mode=guest')

    if (!session && !isGuestMode) {
      return NextResponse.json(
        { error: 'Please sign in or use guest mode to explore destinations' },
        { status: 401 }
      )
    }

    // Rate limiting for guest users
    if (isGuestMode && !session) {
      const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
                 headersList.get('x-real-ip') || 
                 'unknown'
      
      const rateLimit = await checkRateLimit(ip)
      
      if (!rateLimit.success) {
        return NextResponse.json(
          { 
            error: 'Guest query limit reached. Sign up for unlimited access!',
            rateLimitReached: true,
            reset: rateLimit.reset 
          },
          { status: 429 }
        )
      }
    }

    const { destination, from, budget, experience, startDate, endDate } = await req.json()
    
    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      )
    }

    const prompt = `You are a travel assistant. Return ONLY a JSON object for ${destination} trip from ${from || 'India'}.
Budget: ${budget ? '₹' + budget : 'any'}. ${experience || ''}

JSON format (no extra text):
{
  "destination_overview": "2 sentences about ${destination}",
  "how_to_reach": {
    "by_flight": {"description": "flights from ${from || 'major cities'}", "cost": "₹X-Y", "duration": "X hrs"},
    "by_train": {"description": "train options", "cost": "₹X-Y", "duration": "X hrs"},
    "by_road": {"description": "road/bus", "cost": "₹X-Y", "duration": "X hrs"}
  },
  "attractions": [
    {"name": "Place 1", "description": "about it", "entry_fee": "₹X", "time_needed": "X hrs"}
  ],
  "best_time": "best months",
  "weather_info": "current weather",
  "accommodation": [
    {"type": "Budget", "options": "hotel names", "price_range": "₹X-Y/night"}
  ],
  "food_guide": [
    {"type": "Local", "dishes": ["dish1", "dish2"], "avg_cost": "₹X/meal"}
  ],
  "cost_breakdown": {
    "transport": {"min": 1000, "max": 5000},
    "accommodation": {"min": 1000, "max": 5000},
    "food": {"min": 500, "max": 1500},
    "activities": {"min": 500, "max": 2000},
    "total_estimated": {"min": 5000, "max": 20000}
  },
  "itinerary_suggestions": [
    {"day": 1, "activities": ["Morning", "Afternoon", "Evening"]}
  ],
  "travel_tips": ["tip1", "tip2", "tip3"],
  "safety_info": "safety notes",
  "best_for": ["Families", "Couples"]
}

Fill with real data for ${destination}. Include 5 attractions, 3 accommodation types, 3-day itinerary.`

    const geminiModel = getGeminiModel()
    
    let travelInfo = null
    
    try {
      const result = await geminiModel.generateContent(prompt)
      const response = result.response.text()
      
      // Use robust JSON repair
      travelInfo = repairAndParseJSON(response)
      
      // If repair failed, throw to use fallback
      if (!travelInfo) {
        throw new Error('JSON repair returned null')
      }
    } catch (parseError) {
      console.error('JSON parse failed:', parseError)
      // Return fallback
      travelInfo = {
        destination_overview: `${destination} is a popular travel destination with diverse attractions and experiences.`,
        how_to_reach: {
          by_flight: { description: `Flights from ${from || 'major cities'}`, cost: "₹3,000 - ₹15,000", duration: "2-4 hours" },
          by_train: { description: "Train services available", cost: "₹500 - ₹3,000", duration: "8-12 hours" },
          by_road: { description: "Well connected by roads", cost: "₹1,000 - ₹5,000", duration: "Varies" }
        },
        attractions: [
          { name: "Local Landmarks", description: "Famous spots to visit", entry_fee: "₹50-500", time_needed: "2-3 hours" },
          { name: "Cultural Sites", description: "Experience local culture", entry_fee: "₹100-300", time_needed: "1-2 hours" },
          { name: "Nature Spots", description: "Natural beauty", entry_fee: "Free-₹200", time_needed: "2-4 hours" }
        ],
        best_time: "October to March for pleasant weather",
        weather_info: "Check current forecast before travel",
        accommodation: [
          { type: "Budget", options: "Hostels, Guesthouses", price_range: "₹500-1500/night" },
          { type: "Mid-range", options: "3-star hotels", price_range: "₹2000-4000/night" },
          { type: "Luxury", options: "5-star hotels", price_range: "₹5000+/night" }
        ],
        food_guide: [
          { type: "Street Food", dishes: ["Local snacks"], avg_cost: "₹50-150/meal" },
          { type: "Restaurant", dishes: ["Main dishes"], avg_cost: "₹200-500/meal" }
        ],
        cost_breakdown: {
          transport: { min: 3000, max: 15000 },
          accommodation: { min: 2000, max: 10000 },
          food: { min: 1500, max: 5000 },
          activities: { min: 1000, max: 3000 },
          total_estimated: { min: 10000, max: 40000 }
        },
        itinerary_suggestions: [
          { day: 1, activities: ["Arrive and check-in", "Explore local area", "Dinner at local restaurant"] },
          { day: 2, activities: ["Visit main attractions", "Lunch break", "Evening cultural activities"] },
          { day: 3, activities: ["Morning sightseeing", "Shopping", "Departure"] }
        ],
        travel_tips: ["Carry valid ID", "Book accommodation in advance", "Try local cuisine", "Stay hydrated"],
        safety_info: "Keep valuables safe, follow local guidelines",
        best_for: ["Families", "Couples", "Solo travelers", "Friends"]
      }
    }

    return NextResponse.json(travelInfo)
  } catch (error) {
    console.error('Error generating travel info:', error)
    return NextResponse.json(
      { error: 'Failed to generate travel information' },
      { status: 500 }
    )
  }
}