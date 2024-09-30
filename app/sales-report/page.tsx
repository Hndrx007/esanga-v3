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
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const [filterDate, setFilterDate] = useState('')
  const [filterDescription, setFilterDescription] = useState('')

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

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    })
  }

  const filteredSales = sales.filter(sale => 
    new Date(sale.created_at).toLocaleDateString().includes(filterDate) &&
    sale.description.toLowerCase().includes(filterDescription.toLowerCase())
  )

  const sortedSales = [...filteredSales].sort((a, b) => {
    if (a[sortConfig.key as keyof SaleItem] < b[sortConfig.key as keyof SaleItem]) return sortConfig.direction === 'asc' ? -1 : 1
    if (a[sortConfig.key as keyof SaleItem] > b[sortConfig.key as keyof SaleItem]) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const totalSales = sortedSales.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0)
  const totalQuantity = sortedSales.reduce((sum, sale) => sum + sale.quantity, 0)

  const handleExportCSV = () => {
    const csvData = stringify(sortedSales.map(sale => ({
      Date: new Date(sale.created_at).toLocaleDateString(),
      Description: sale.description,
      Quantity: sale.quantity,
      Price: formatCurrency(sale.price),
      Total: formatCurrency(sale.quantity * sale.price)
    })), { header: true })

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'sales_report.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.text('Sales Report', 14, 15)
    doc.autoTable({
      head: [['Date', 'Description', 'Quantity', 'Price', 'Total']],
      body: sortedSales.map(sale => [
        new Date(sale.created_at).toLocaleDateString(),
        sale.description,
        sale.quantity,
        formatCurrency(sale.price),
        formatCurrency(sale.quantity * sale.price)
      ]),
      startY: 20
    })
    doc.save('sales_report.pdf')
  }

  function formatCurrency(amount: number): string {
    return `TZS ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Report</h1>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSales / sortedSales.length)}
            </div>
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
          <CardTitle>Sales Details</CardTitle>
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
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
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
                    <Button variant="ghost" onClick={() => handleSort('quantity')}>
                      Quantity
                      {sortConfig.key === 'quantity' && (
                        sortConfig.direction === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : <ArrowDownIcon className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => handleSort('price')}>
                      Price
                      {sortConfig.key === 'price' && (
                        sortConfig.direction === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : <ArrowDownIcon className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.description}</TableCell>
                    <TableCell className="text-right">{sale.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.quantity * sale.price)}</TableCell>
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