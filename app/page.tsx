'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUser } from '@/lib/useUser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {user.role === 'admin' ? 'Admin Dashboard' : 'Esanga Stationery System'}
          </h1>
          <div>
            <span className="mr-4">Role: {user.role}</span>
            <Button variant="destructive" onClick={async () => {
              await supabase.auth.signOut()
              router.push('/login')
            }}>Logout</Button>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Regular user options */}
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
            {/* Admin-only options */}
            {user.role === 'admin' && (
              <>
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
                <Link href="/user-management" className="transform transition-transform hover:scale-105">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage system users</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}