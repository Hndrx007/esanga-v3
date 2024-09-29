'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'

interface DailyReport {
  date: string;
  totalSales: number;
  totalCosts: number;
}

export function DailyReportsCard() {
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchDailyReports()
    }
  }, [user])

  async function fetchDailyReports() {
    setIsLoading(true)
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('created_at, price, quantity')
      .eq('user_id', user?.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const { data: costsData, error: costsError } = await supabase
      .from('costs')
      .select('created_at, amount')
      .eq('user_id', user?.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (salesError || costsError) {
      console.error('Error fetching data:', salesError || costsError)
      setIsLoading(false)
      return
    }

    const reports: { [key: string]: DailyReport } = {}

    salesData?.forEach((sale) => {
      const date = new Date(sale.created_at).toLocaleDateString()
      if (!reports[date]) {
        reports[date] = { date, totalSales: 0, totalCosts: 0 }
      }
      reports[date].totalSales += sale.price * sale.quantity
    })

    costsData?.forEach((cost) => {
      const date = new Date(cost.created_at).toLocaleDateString()
      if (!reports[date]) {
        reports[date] = { date, totalSales: 0, totalCosts: 0 }
      }
      reports[date].totalCosts += cost.amount
    })

    setDailyReports(Object.values(reports).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setIsLoading(false)
  }

  function formatCurrency(amount: number): string {
    return `TZS ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  if (isLoading) {
    return <Card><CardContent>Loading daily reports...</CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Reports (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {dailyReports.map((report) => (
            <div key={report.date} className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
              <span className="flex-1 text-sm font-medium">{report.date}</span>
              <span className="text-sm text-muted-foreground">Sales: {formatCurrency(report.totalSales)}</span>
              <span className="ml-2 text-sm text-muted-foreground">Costs: {formatCurrency(report.totalCosts)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}