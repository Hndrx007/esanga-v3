'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useUser } from '../../lib/useUser'  // Assuming you have this hook

interface CostItem {
  id: number;
  user_id: string;
  description: string;
  amount: number;
  created_at: string;
}

export default function CostReportPage() {
  const [costs, setCosts] = useState<CostItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading } = useUser()

  useEffect(() => {
    if (user && !loading) {
      fetchCosts()
    }
  }, [user, loading])

  async function fetchCosts() {
    if (!user) return
    setIsLoading(true)
    const { data, error } = await supabase
      .from('costs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching costs:', error)
      setError('Failed to fetch costs. Please try again later.')
    } else {
      setCosts(data || [])
    }
    setIsLoading(false)
  }

  function formatCurrency(amount: number): string {
    return `TZS ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cost Report</h1>
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Description</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {costs.map((cost) => (
                <tr key={cost.id}>
                  <td>{new Date(cost.created_at).toLocaleDateString()}</td>
                  <td>{cost.description}</td>
                  <td className="text-right">{formatCurrency(cost.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center">
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}