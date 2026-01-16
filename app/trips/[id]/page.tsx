'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { format, differenceInDays, addDays } from 'date-fns'
import { 
  ArrowLeft, MapPin, Calendar, Wallet, Package, 
  Plane, Plus, Trash2, Check, Loader2, Sparkles,
  Sun, CloudSun, Moon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FloatingOrbs } from '@/components/floating-orbs'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

const EXPENSE_CATEGORIES = [
  { value: 'flights', label: '✈️ Flights', color: 'bg-blue-500' },
  { value: 'accommodation', label: '🏨 Accommodation', color: 'bg-purple-500' },
  { value: 'food', label: '🍽️ Food', color: 'bg-orange-500' },
  { value: 'transport', label: '🚗 Transport', color: 'bg-green-500' },
  { value: 'activities', label: '🎭 Activities', color: 'bg-pink-500' },
  { value: 'shopping', label: '🛍️ Shopping', color: 'bg-yellow-500' },
  { value: 'other', label: '💰 Other', color: 'bg-gray-500' },
]

const PACKING_CATEGORIES = [
  { value: 'clothing', label: '👕 Clothing' },
  { value: 'toiletries', label: '🧴 Toiletries' },
  { value: 'electronics', label: '📱 Electronics' },
  { value: 'documents', label: '📄 Documents' },
  { value: 'medicine', label: '💊 Medicine' },
  { value: 'other', label: '📦 Other' },
]

const TIME_SLOTS = [
  { value: 'morning', label: 'Morning', icon: Sun },
  { value: 'afternoon', label: 'Afternoon', icon: CloudSun },
  { value: 'evening', label: 'Evening', icon: Moon },
]

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('itinerary')
  
  // Dialog states
  const [activityDialog, setActivityDialog] = useState(false)
  const [expenseDialog, setExpenseDialog] = useState(false)
  const [packingDialog, setPackingDialog] = useState(false)
  const [selectedDay, setSelectedDay] = useState(0)
  const [generatingPacking, setGeneratingPacking] = useState(false)
  
  // Form states
  const [newActivity, setNewActivity] = useState({ title: '', timeSlot: 'morning', location: '', estimatedCost: 0 })
  const [newExpense, setNewExpense] = useState({ category: 'food', amount: 0, description: '' })
  const [newPackingItem, setNewPackingItem] = useState({ category: 'clothing', name: '', quantity: 1 })

  useEffect(() => {
    if (params.id) fetchTrip()
  }, [params.id])

  const fetchTrip = async () => {
    try {
      const res = await fetch(`/api/trips/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setTrip(data)
      } else {
        router.push('/trips')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load trip', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const addActivity = async () => {
    if (!newActivity.title) return
    try {
      const res = await fetch(`/api/trips/${params.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newActivity, dayIndex: selectedDay }),
      })
      if (res.ok) {
        const activity = await res.json()
        setTrip({ ...trip, activities: [...trip.activities, activity] })
        setNewActivity({ title: '', timeSlot: 'morning', location: '', estimatedCost: 0 })
        setActivityDialog(false)
        toast({ title: 'Added', description: 'Activity added to itinerary' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add activity', variant: 'destructive' })
    }
  }

  const addExpense = async () => {
    if (!newExpense.amount || !newExpense.description) return
    try {
      const res = await fetch(`/api/trips/${params.id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      })
      if (res.ok) {
        const expense = await res.json()
        setTrip({ 
          ...trip, 
          expenses: [...trip.expenses, expense],
          totalSpent: trip.totalSpent + expense.amount 
        })
        setNewExpense({ category: 'food', amount: 0, description: '' })
        setExpenseDialog(false)
        toast({ title: 'Added', description: 'Expense recorded' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add expense', variant: 'destructive' })
    }
  }

  const addPackingItem = async () => {
    if (!newPackingItem.name) return
    try {
      const res = await fetch(`/api/trips/${params.id}/packing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPackingItem),
      })
      if (res.ok) {
        const item = await res.json()
        setTrip({ ...trip, packingItems: [...trip.packingItems, item] })
        setNewPackingItem({ category: 'clothing', name: '', quantity: 1 })
        setPackingDialog(false)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add item', variant: 'destructive' })
    }
  }

  const generatePackingList = async () => {
    setGeneratingPacking(true)
    try {
      const res = await fetch(`/api/trips/${params.id}/packing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateAI: true }),
      })
      if (res.ok) {
        const items = await res.json()
        setTrip({ ...trip, packingItems: [...trip.packingItems, ...items] })
        toast({ title: 'Generated!', description: `Added ${items.length} items to your packing list` })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate list', variant: 'destructive' })
    } finally {
      setGeneratingPacking(false)
    }
  }

  const togglePackingItem = async (itemId: string, packed: boolean) => {
    try {
      await fetch(`/api/trips/${params.id}/packing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, packed }),
      })
      setTrip({
        ...trip,
        packingItems: trip.packingItems.map((item: any) =>
          item._id === itemId ? { ...item, packed } : item
        ),
      })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
    }
  }

  const deleteExpense = async (expenseId: string) => {
    try {
      await fetch(`/api/trips/${params.id}/expenses?expenseId=${expenseId}`, {
        method: 'DELETE',
      })
      const expense = trip.expenses.find((e: any) => e._id === expenseId)
      setTrip({
        ...trip,
        expenses: trip.expenses.filter((e: any) => e._id !== expenseId),
        totalSpent: trip.totalSpent - (expense?.amount || 0),
      })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!trip) return null

  const days = Array.from({ length: trip.daysCount }, (_, i) => i)
  const budgetPercent = trip.budget > 0 ? Math.min((trip.totalSpent / trip.budget) * 100, 100) : 0
  const countdown = differenceInDays(new Date(trip.startDate), new Date())

  return (
    <div className="min-h-screen gradient-bg">
      <FloatingOrbs count={2} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <Link href="/trips" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Trips
            </Link>
            <h1 className="text-3xl font-bold">{trip.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-primary" />
                {trip.destination}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          
          {countdown > 0 && (
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{countdown}</div>
              <div className="text-sm text-muted-foreground">days to go</div>
            </div>
          )}
        </div>

        {/* Budget Overview */}
        {trip.budget > 0 && (
          <Card className="glass p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="font-medium">Budget</span>
              </span>
              <span className="text-lg font-bold">
                ₹{trip.totalSpent.toLocaleString()} / ₹{trip.budget.toLocaleString()}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${budgetPercent > 90 ? 'bg-destructive' : 'bg-primary'}`}
                initial={{ width: 0 }}
                animate={{ width: `${budgetPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-right text-sm text-muted-foreground mt-1">
              ₹{(trip.budget - trip.totalSpent).toLocaleString()} remaining
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glass mb-6">
            <TabsTrigger value="itinerary" className="gap-2">
              <Calendar className="h-4 w-4" />
              Itinerary
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <Wallet className="h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="packing" className="gap-2">
              <Package className="h-4 w-4" />
              Packing
            </TabsTrigger>
          </TabsList>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary">
            <div className="space-y-6">
              {days.map((dayIndex) => {
                const dayDate = addDays(new Date(trip.startDate), dayIndex)
                const dayActivities = trip.activities.filter((a: any) => a.dayIndex === dayIndex)
                
                return (
                  <Card key={dayIndex} className="glass p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold">Day {dayIndex + 1}</h3>
                        <p className="text-sm text-muted-foreground">{format(dayDate, 'EEEE, MMMM d')}</p>
                      </div>
                      <Dialog open={activityDialog && selectedDay === dayIndex} onOpenChange={(open) => {
                        setActivityDialog(open)
                        if (open) setSelectedDay(dayIndex)
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Plus className="h-4 w-4" />
                            Add
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass">
                          <DialogHeader>
                            <DialogTitle>Add Activity - Day {dayIndex + 1}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <Label>Activity</Label>
                              <Input 
                                placeholder="Visit Eiffel Tower"
                                value={newActivity.title}
                                onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label>Time</Label>
                              <Select value={newActivity.timeSlot} onValueChange={v => setNewActivity({...newActivity, timeSlot: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map(slot => (
                                    <SelectItem key={slot.value} value={slot.value}>{slot.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Location (optional)</Label>
                              <Input 
                                placeholder="Champ de Mars"
                                value={newActivity.location}
                                onChange={e => setNewActivity({...newActivity, location: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label>Estimated Cost (₹)</Label>
                              <Input 
                                type="number"
                                value={newActivity.estimatedCost || ''}
                                onChange={e => setNewActivity({...newActivity, estimatedCost: Number(e.target.value)})}
                              />
                            </div>
                            <Button onClick={addActivity} className="w-full">Add Activity</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {dayActivities.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No activities planned</p>
                    ) : (
                      <div className="space-y-3">
                        {TIME_SLOTS.map(slot => {
                          const slotActivities = dayActivities.filter((a: any) => a.timeSlot === slot.value)
                          if (slotActivities.length === 0) return null
                          
                          const Icon = slot.icon
                          return (
                            <div key={slot.value}>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Icon className="h-4 w-4" />
                                {slot.label}
                              </div>
                              {slotActivities.map((activity: any) => (
                                <div key={activity._id} className="bg-white/5 rounded-lg p-3 mb-2">
                                  <div className="font-medium">{activity.title}</div>
                                  {activity.location && (
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {activity.location}
                                    </div>
                                  )}
                                  {activity.estimatedCost > 0 && (
                                    <div className="text-sm text-primary">₹{activity.estimatedCost}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Expenses</h3>
                <Dialog open={expenseDialog} onOpenChange={setExpenseDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass">
                    <DialogHeader>
                      <DialogTitle>Add Expense</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Category</Label>
                        <Select value={newExpense.category} onValueChange={v => setNewExpense({...newExpense, category: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {EXPENSE_CATEGORIES.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Amount (₹)</Label>
                        <Input 
                          type="number"
                          value={newExpense.amount || ''}
                          onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input 
                          placeholder="Lunch at cafe"
                          value={newExpense.description}
                          onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                        />
                      </div>
                      <Button onClick={addExpense} className="w-full">Add Expense</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Category Breakdown */}
              {trip.expenses.length > 0 && (
                <Card className="glass p-4">
                  <h4 className="font-medium mb-3">By Category</h4>
                  <div className="space-y-2">
                    {EXPENSE_CATEGORIES.map(cat => {
                      const catExpenses = trip.expenses.filter((e: any) => e.category === cat.value)
                      const total = catExpenses.reduce((sum: number, e: any) => sum + e.amount, 0)
                      if (total === 0) return null
                      const percent = (total / trip.totalSpent) * 100
                      
                      return (
                        <div key={cat.value} className="flex items-center gap-3">
                          <span className="w-32 text-sm">{cat.label}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${cat.color}`} style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-sm font-medium w-24 text-right">₹{total.toLocaleString()}</span>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}

              {/* Expense List */}
              <div className="space-y-2">
                {trip.expenses.length === 0 ? (
                  <Card className="glass p-8 text-center">
                    <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No expenses recorded yet</p>
                  </Card>
                ) : (
                  trip.expenses.map((expense: any) => {
                    const cat = EXPENSE_CATEGORIES.find(c => c.value === expense.category)
                    return (
                      <Card key={expense._id} className="glass p-4 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-8 rounded ${cat?.color || 'bg-gray-500'}`} />
                          <div>
                            <div className="font-medium">{expense.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {cat?.label} • {format(new Date(expense.date), 'MMM d')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">₹{expense.amount.toLocaleString()}</span>
                          <button
                            onClick={() => deleteExpense(expense._id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </Card>
                    )
                  })
                )}
              </div>
            </div>
          </TabsContent>

          {/* Packing Tab */}
          <TabsContent value="packing">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Packing List</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={generatePackingList}
                    disabled={generatingPacking}
                  >
                    {generatingPacking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    AI Generate
                  </Button>
                  <Dialog open={packingDialog} onOpenChange={setPackingDialog}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass">
                      <DialogHeader>
                        <DialogTitle>Add Packing Item</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>Category</Label>
                          <Select value={newPackingItem.category} onValueChange={v => setNewPackingItem({...newPackingItem, category: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {PACKING_CATEGORIES.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Item Name</Label>
                          <Input 
                            placeholder="T-shirts"
                            value={newPackingItem.name}
                            onChange={e => setNewPackingItem({...newPackingItem, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input 
                            type="number"
                            value={newPackingItem.quantity}
                            onChange={e => setNewPackingItem({...newPackingItem, quantity: Number(e.target.value)})}
                          />
                        </div>
                        <Button onClick={addPackingItem} className="w-full">Add Item</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Progress */}
              {trip.packingItems.length > 0 && (
                <Card className="glass p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>Packing Progress</span>
                    <span className="font-bold">
                      {trip.packingItems.filter((i: any) => i.packed).length} / {trip.packingItems.length}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ 
                        width: `${(trip.packingItems.filter((i: any) => i.packed).length / trip.packingItems.length) * 100}%` 
                      }}
                    />
                  </div>
                </Card>
              )}

              {/* Packing List by Category */}
              {trip.packingItems.length === 0 ? (
                <Card className="glass p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-4">No packing list yet</p>
                  <Button onClick={generatePackingList} disabled={generatingPacking}>
                    {generatingPacking ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {PACKING_CATEGORIES.map(cat => {
                    const catItems = trip.packingItems.filter((i: any) => i.category === cat.value)
                    if (catItems.length === 0) return null
                    
                    return (
                      <Card key={cat.value} className="glass p-4">
                        <h4 className="font-medium mb-3">{cat.label}</h4>
                        <div className="space-y-2">
                          {catItems.map((item: any) => (
                            <div 
                              key={item._id} 
                              className={`flex items-center gap-3 p-2 rounded ${item.packed ? 'opacity-60' : ''}`}
                            >
                              <Checkbox 
                                checked={item.packed}
                                onCheckedChange={(checked) => togglePackingItem(item._id, !!checked)}
                              />
                              <span className={item.packed ? 'line-through' : ''}>
                                {item.name} {item.quantity > 1 && `(${item.quantity})`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
