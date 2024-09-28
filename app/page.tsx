import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Esanga Stationery System</h1>
          <Button variant="destructive">Logout</Button>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/sales" className="transform transition-transform hover:scale-105">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Entry</CardTitle>
                  <CardDescription>Record new sales transactions</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/costs" className="transform transition-transform hover:scale-105">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Entry</CardTitle>
                  <CardDescription>Record new cost transactions</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/sales-report" className="transform transition-transform hover:scale-105">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Report</CardTitle>
                  <CardDescription>View sales report and analytics</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/costs-report" className="transform transition-transform hover:scale-105">
              <Card>
                <CardHeader>
                  <CardTitle>Costs Report</CardTitle>
                  <CardDescription>View costs report and analytics</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}