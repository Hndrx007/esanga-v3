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
  const [costs, setCosts] = useState<CostItem[]>([])
  const { toast } = useToast()
  const { user, loading } = useUser()

  useEffect(() => {
    if (user && !loading) {
      fetchCosts()
    }
  }, [user, loading])

  function formatCurrency(amount: number): string {
    return `TZS ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  async function fetchCosts() {
    if (!user) return
    const { data, error } = await supabase
      .from('costs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching costs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch costs. Please try again.",
        variant: "destructive",
      })
    } else {
      setCosts(data || [])
    }
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
      setCosts([data, ...costs])
      setDescription('')
      setAmount('')
      toast({
        title: "Cost Added",
        description: "The cost has been successfully recorded.",
      })
    }
  }

  const deleteCost = async (id: number) => {
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
      setCosts(costs.filter(cost => cost.id !== id))
      toast({
        title: "Cost Deleted",
        description: "The cost has been removed from the list.",
      })
    }
  }

  const submitDailyReport = async () => {
    if (!user) return
    // Here you would typically update the reports table
    // For now, we'll just log the costs
    console.log('Submitting daily cost report:', costs)
    toast({
      title: "Daily Cost Report Submitted",
      description: `${costs.length} cost entries have been submitted.`,
    })
    // Optionally, clear the costs list after submission
    // setCosts([])
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
          <h2 className="text-xl font-semibold mb-4">Recent Costs</h2>
          {costs.length > 0 ? (
            <ul className="space-y-4">
              {costs.map((cost) => (
                <li key={cost.id} className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0">
                  <div>
                    <span className="font-medium">{cost.description}</span>
                    <span className="ml-4">{formatCurrency(cost.amount)}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteCost(cost.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No costs recorded yet.</p>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <Button onClick={submitDailyReport} disabled={costs.length === 0}>
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