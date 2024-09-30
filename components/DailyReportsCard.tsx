'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
import { DailyReportDetail } from '@/components/DailyReportDetail'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export interface DailyReport {
  date: string;
  totalSales: number;
  totalCosts: number;
}

export function DailyReportsCard() {
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null)
  const { user } = useUser()
  const [isExporting, setIsExporting] = useState(false)

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

  const handleCardClick = (report: DailyReport) => {
    setSelectedReport(report)
  }

  const handleCloseDetail = () => {
    setSelectedReport(null)
  }

  const handleExportPDF = async () => {
    if (!selectedReport) return

    setIsExporting(true)

    try {
      const doc = new jsPDF()
      doc.text(`Daily Report for ${selectedReport.date}`, 14, 15)
      doc.autoTable({
        head: [['Description', 'Amount']],
        body: [
          ['Total Sales', formatCurrency(selectedReport.totalSales)],
          ['Total Costs', formatCurrency(selectedReport.totalCosts)],
          ['Net Profit', formatCurrency(selectedReport.totalSales - selectedReport.totalCosts)]
        ],
        startY: 20
      })
      doc.save(`daily_report_${selectedReport.date.replace(/\//g, '-')}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return <Card><CardContent>Loading daily reports...</CardContent></Card>
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dailyReports.map((report) => (
          <Card key={report.date} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick(report)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <CalendarIcon className="mr-2 h-4 w-4 inline-block" />
                {report.date}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(report.totalSales - report.totalCosts)}</div>
              <p className="text-xs text-muted-foreground">
                Sales: {formatCurrency(report.totalSales)} | Costs: {formatCurrency(report.totalCosts)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedReport && (
        <DailyReportDetail
          report={selectedReport}
          isOpen={!!selectedReport}
          onClose={handleCloseDetail}
          onExportPDF={handleExportPDF}
          isExporting={isExporting}
        />
      )}
    </>
  )
}