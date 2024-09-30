'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeftIcon, ArrowUpIcon, ArrowDownIcon, DownloadIcon, FileIcon } from "lucide-react"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useUser } from '../../lib/useUser'
import { stringify } from 'csv-stringify/sync'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

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
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const [filterDate, setFilterDate] = useState('')
  const [filterDescription, setFilterDescription] = useState('')

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

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    })
  }

  const filteredCosts = costs.filter(cost => 
    new Date(cost.created_at).toLocaleDateString().includes(filterDate) &&
    cost.description.toLowerCase().includes(filterDescription.toLowerCase())
  )

  const sortedCosts = [...filteredCosts].sort((a, b) => {
    if (a[sortConfig.key as keyof CostItem] < b[sortConfig.key as keyof CostItem]) return sortConfig.direction === 'asc' ? -1 : 1
    if (a[sortConfig.key as keyof CostItem] > b[sortConfig.key as keyof CostItem]) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const totalCosts = sortedCosts.reduce((sum, cost) => sum + cost.amount, 0)

  const handleExportCSV = () => {
    const csvData = stringify(sortedCosts.map(cost => ({
      Date: new Date(cost.created_at).toLocaleDateString(),
      Description: cost.description,
      Amount: formatCurrency(cost.amount)
    })), { header: true })

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'costs_report.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.text('Costs Report', 14, 15)
    doc.autoTable({
      head: [['Date', 'Description', 'Amount']],
      body: sortedCosts.map(cost => [
        new Date(cost.created_at).toLocaleDateString(),
        cost.description,
        formatCurrency(cost.amount)
      ]),
      startY: 20
    })
    doc.save('costs_report.pdf')
  }

  function formatCurrency(amount: number): string {
    return `TZS ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cost Report</h1>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCosts)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Export Report</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button className="flex-1" onClick={handleExportCSV}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button className="flex-1" onClick={handleExportPDF}>
              <FileIcon className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Filter by date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Filter by description"
                value={filterDescription}
                onChange={(e) => setFilterDescription(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Select onValueChange={(value) => handleSort(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <Button variant="ghost" onClick={() => handleSort('created_at')}>
                      Date
                      {sortConfig.key === 'created_at' && (
                        sortConfig.direction === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : <ArrowDownIcon className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('description')}>
                      Description
                      {sortConfig.key === 'description' && (
                        sortConfig.direction === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : <ArrowDownIcon className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => handleSort('amount')}>
                      Amount
                      {sortConfig.key === 'amount' && (
                        sortConfig.direction === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : <ArrowDownIcon className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCosts.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>{new Date(cost.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{cost.description}</TableCell>
                    <TableCell className="text-right">{formatCurrency(cost.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}