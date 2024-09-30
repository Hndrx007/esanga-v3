import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { useUser } from './useUser'

interface SummaryData {
  totalSales: number
  totalCosts: number
  salesCount: number
  costsCount: number
}

export function useSummaryData() {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalSales: 0,
    totalCosts: 0,
    salesCount: 0,
    costsCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()

  const fetchSummaryData = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const [{ data: salesData, error: salesError }, { data: costsData, error: costsError }] = await Promise.all([
        supabase
          .from('sales')
          .select('price, quantity')
          .eq('user_id', user.id),
        supabase
          .from('costs')
          .select('amount')
          .eq('user_id', user.id)
      ])

      if (salesError) throw salesError
      if (costsError) throw costsError

      const totalSales = salesData?.reduce((sum, sale) => sum + (sale.price * sale.quantity), 0) || 0
      const totalCosts = costsData?.reduce((sum, cost) => sum + cost.amount, 0) || 0

      setSummaryData({
        totalSales,
        totalCosts,
        salesCount: salesData?.length || 0,
        costsCount: costsData?.length || 0,
      })
    } catch (error) {
      console.error('Error fetching summary data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchSummaryData()
    }
  }, [user])

  return { summaryData, isLoading, refetch: fetchSummaryData }
}