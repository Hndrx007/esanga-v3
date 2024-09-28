'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useUser } from '../../lib/useUser' // Updated import path

interface SaleItem {
  id: number;
  user_id: string;
  description: string;
  quantity: number;
  price: number;
  created_at: string;
}

export default function SalesReportPage() {
  const [sales, setSales] = useState<SaleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading } = useUser()

  useEffect(() => {
    if (user && !loading) {
      fetchSales()
    }
  }, [user, loading])

  async function fetchSales() {
    if (!user) return
    setIsLoading(true)
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sales:', error)
      setError('Failed to fetch sales. Please try again later.')
    } else {
      setSales(data || [])
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sales Report</h1>
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Description</th>
                <th className="text-right">Quantity</th>
                <th className="text-right">Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                  <td>{sale.description}</td>
                  <td className="text-right">{sale.quantity}</td>
                  <td className="text-right">{formatCurrency(sale.price)}</td>
                  <td className="text-right">{formatCurrency(sale.quantity * sale.price)}</td>
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