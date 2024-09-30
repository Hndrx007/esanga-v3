'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useUser } from '../../lib/useUser'
import { useSearchParams } from 'next/navigation'

interface SaleItem {
  id: number;
  user_id: string;
  description: string;
  quantity: number;
  price: number;
  created_at: string;
}

export default function SalesEntryPage() {
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [dailySales, setDailySales] = useState<SaleItem[]>([])
  const [recentSales, setRecentSales] = useState<SaleItem[]>([])
  const { toast } = useToast()
  const { user, loading } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()
  const shouldRefetchSummary = searchParams.get('refetchSummary') === 'true'

  useEffect(() => {
    if (user && !loading) {
      fetchDailySales()
      fetchRecentSales()
    }
  }, [user, loading])

  useEffect(() => {
    if (shouldRefetchSummary) {
      // Implement a method to communicate with the parent Dashboard component
      // This could be through a custom event, global state, or other means
      window.postMessage({ type: 'REFETCH_SUMMARY' }, '*')
    }
  }, [shouldRefetchSummary])

  async function fetchDailySales() {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', today)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching daily sales:', error)
      toast({
        title: "Error",
        description: "Failed to fetch daily sales. Please try again.",
        variant: "destructive",
      })
    } else {
      setDailySales(data || [])
    }
  }

  async function fetchRecentSales() {
    if (!user) return
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching recent sales:', error)
      toast({
        title: "Error",
        description: "Failed to fetch recent sales. Please try again.",
        variant: "destructive",
      })
    } else {
      setRecentSales(data || [])
    }
  }

  function formatCurrency(amount: number): string {
    return `TZS ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const newSale = {
      user_id: user.id,
      description,
      quantity: parseInt(quantity),
      price: parseFloat(price),
    }

    const { data, error } = await supabase
      .from('sales')
      .insert(newSale)
      .select()
      .single()

    if (error) {
      console.error('Error adding sale:', error)
      toast({
        title: "Error",
        description: "Failed to add sale. Please try again.",
        variant: "destructive",
      })
    } else {
      setDailySales([data, ...dailySales])
      setRecentSales([data, ...recentSales.slice(0, 9)])
      setDescription('')
      setQuantity('')
      setPrice('')
      toast({
        title: "Sale Added",
        description: "The sale has been successfully recorded.",
      })
      if (shouldRefetchSummary) {
        window.postMessage({ type: 'REFETCH_SUMMARY' }, '*')
      }
    }
  }

  const deleteSale = async (id: number, isDaily: boolean) => {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id)

    if (error) {
      console.error('Error deleting sale:', error)
      toast({
        title: "Error",
        description: "Failed to delete sale. Please try again.",
        variant: "destructive",
      })
    } else {
      if (isDaily) {
        setDailySales(dailySales.filter(sale => sale.id !== id))
      }
      setRecentSales(recentSales.filter(sale => sale.id !== id))
      toast({
        title: "Sale Deleted",
        description: "The sale has been removed from the list.",
      })
      if (shouldRefetchSummary) {
        window.postMessage({ type: 'REFETCH_SUMMARY' }, '*')
      }
    }
  }

  const submitDailyReport = async () => {
    if (!user) return
    console.log('Submitting daily sales report:', dailySales)
    toast({
      title: "Daily Sales Report Submitted",
      description: `${dailySales.length} sales entries have been submitted.`,
    })
    setDailySales([])
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sales Entry</h1>
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <Input
                id="description"
                type="text"
                placeholder="Enter sale description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
              <Input
                id="price"
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full">Add Sale</Button>
          </form>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Today's Sales</h2>
          {dailySales.length > 0 ? (
            <ul className="space-y-4">
              {dailySales.map((sale) => (
                <li key={sale.id} className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0">
                  <div>
                    <span className="font-medium">{sale.description}</span>
                    <span className="ml-4">Qty: {sale.quantity}, Price: {formatCurrency(sale.price)}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteSale(sale.id, true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No sales recorded today.</p>
          )}
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
          {recentSales.length > 0 ? (
            <ul className="space-y-4">
              {recentSales.map((sale) => (
                <li key={sale.id} className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0">
                  <div>
                    <span className="font-medium">{sale.description}</span>
                    <span className="ml-4">Qty: {sale.quantity}, Price: {formatCurrency(sale.price)}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteSale(sale.id, false)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent sales recorded.</p>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <Button onClick={submitDailyReport} disabled={dailySales.length === 0}>
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