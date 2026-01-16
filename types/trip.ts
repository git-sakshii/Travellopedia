// Trip and Itinerary Types

export interface Trip {
  _id?: string
  userId: string
  name: string
  destination: string
  startDate: Date
  endDate: Date
  budget?: number
  currency: string
  coverImage?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Activity {
  _id?: string
  tripId: string
  dayIndex: number // 0 = Day 1, 1 = Day 2, etc.
  timeSlot: 'morning' | 'afternoon' | 'evening'
  title: string
  description?: string
  location?: string
  estimatedCost?: number
  duration?: number // in minutes
  order: number
  completed: boolean
}

export interface Expense {
  _id?: string
  tripId: string
  category: ExpenseCategory
  amount: number
  currency: string
  description: string
  date: Date
  paidBy?: string
  splitWith?: string[]
  createdAt: Date
}

export type ExpenseCategory = 
  | 'flights'
  | 'accommodation'
  | 'food'
  | 'transport'
  | 'activities'
  | 'shopping'
  | 'other'

export interface PackingItem {
  _id?: string
  tripId: string
  category: PackingCategory
  name: string
  quantity: number
  packed: boolean
}

export type PackingCategory =
  | 'clothing'
  | 'toiletries'
  | 'electronics'
  | 'documents'
  | 'medicine'
  | 'other'

export interface TripWithDetails extends Trip {
  activities: Activity[]
  expenses: Expense[]
  packingItems: PackingItem[]
  totalSpent: number
  daysCount: number
}
