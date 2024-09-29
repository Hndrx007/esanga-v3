'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useUser } from '../../lib/useUser'

interface CostItem {
  id: number;
  user_id: string;
  description: string;
  amount: number;
  created_at: string;
}

export default function CostEntryPage() {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dailyCosts, setDailyCosts] = useState<CostItem[]>([])
  const [recentCosts, setRecentCosts] = useState<CostItem[]>([])
  const { toast } = useToast()
  const { user, loading } = useUser()

  useEffect(() => {
    if (user && !loading) {
      fetchDailyCosts()
      fetchRecentCosts()
    }
  }, [user, loading])

  async function fetchDailyCosts() {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('costs')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', today)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching daily costs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch daily costs. Please try again.",
        variant: "destructive",
      })
    } else {
      setDailyCosts(data || [])
    }
  }

  async function fetchRecentCosts() {
    if (!user) return
    const { data, error } = await supabase
      .from('costs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching recent costs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch recent costs. Please try again.",
        variant: "destructive",
      })
    } else {
      setRecentCosts(data || [])
    }
  }

  function formatCurrency(amount: number): string {
    return `TZS ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const newCost = {
      user_id: user.id,
      description,
      amount: parseFloat(amount),
    }

    const { data, error } = await supabase
      .from('costs')
      .insert(newCost)
      .select()
      .single()

    if (error) {
      console.error('Error adding cost:', error)
      toast({
        title: "Error",
        description: "Failed to add cost. Please try again.",
        variant: "destructive",
      })
    } else {
      setDailyCosts([data, ...dailyCosts])
      setRecentCosts([data, ...recentCosts.slice(0, 9)])
      setDescription('')
      setAmount('')
      toast({
        title: "Cost Added",
        description: "The cost has been successfully recorded.",
      })
    }
  }

  const deleteCost = async (id: number, isDaily: boolean) => {
    const { error } = await supabase
      .from('costs')
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id)

    if (error) {
      console.error('Error deleting cost:', error)
      toast({
        title: "Error",
        description: "Failed to delete cost. Please try again.",
        variant: "destructive",
      })
    } else {
      if (isDaily) {
        setDailyCosts(dailyCosts.filter(cost => cost.id !== id))
      }
      setRecentCosts(recentCosts.filter(cost => cost.id !== id))
      toast({
        title: "Cost Deleted",
        description: "The cost has been removed from the list.",
      })
    }
  }

  const submitDailyReport = async () => {
    if (!user) return
    console.log('Submitting daily cost report:', dailyCosts)
    toast({
      title: "Daily Cost Report Submitted",
      description: `${dailyCosts.length} cost entries have been submitted.`,
    })
    setDailyCosts([])
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cost Entry</h1>
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <Input
                id="description"
                type="text"
                placeholder="Enter cost description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full">Add Cost</Button>
          </form>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Today's Costs</h2>
          {dailyCosts.length > 0 ? (
            <ul className="space-y-4">
              {dailyCosts.map((cost) => (
                <li key={cost.id} className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0">
                  <div>
                    <span className="font-medium">{cost.description}</span>
                    <span className="ml-4">{formatCurrency(cost.amount)}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteCost(cost.id, true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No costs recorded today.</p>
          )}
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Costs</h2>
          {recentCosts.length > 0 ? (
            <ul className="space-y-4">
              {recentCosts.map((cost) => (
                <li key={cost.id} className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0">
                  <div>
                    <span className="font-medium">{cost.description}</span>
                    <span className="ml-4">{formatCurrency(cost.amount)}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteCost(cost.id, false)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent costs recorded.</p>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <Button onClick={submitDailyReport} disabled={dailyCosts.length === 0}>
            Submit Daily Report
          </Button>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}