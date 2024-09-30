import React from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DailyReport } from '@/components/DailyReportsCard'
import { CalendarIcon, DollarSignIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react'

interface DailyReportDetailProps {
  report: DailyReport
  isOpen: boolean
  onClose: () => void
  onExportPDF: () => void
  isExporting: boolean
}

export function DailyReportDetail({ report, isOpen, onClose, onExportPDF, isExporting }: DailyReportDetailProps) {
  function formatCurrency(amount: number): string {
    return `TZS ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  const netProfit = report.totalSales - report.totalCosts
  const profitMargin = (netProfit / report.totalSales) * 100 || 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Daily Report for {report.date}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Sales:</span>
            <span className="text-lg font-bold text-green-600">{formatCurrency(report.totalSales)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Costs:</span>
            <span className="text-lg font-bold text-red-600">{formatCurrency(report.totalCosts)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm font-medium">Net Profit:</span>
            <span className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Profit Margin:</span>
            <span className={`text-lg font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(2)}%
            </span>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button onClick={onExportPDF} className="w-full sm:w-auto" disabled={isExporting}>
            <DollarSignIcon className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export as PDF'}
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}