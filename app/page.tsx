'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, DollarSignIcon, LineChartIcon, PlusCircleIcon, MenuIcon, UserIcon, LogOutIcon } from "lucide-react"
import { useUser } from '@/lib/useUser'
import { supabase } from '@/lib/supabase'
import { DailyReportsCard } from './components/DailyReportsCard'

export default function Dashboard() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  const handleResize = useCallback(() => {
    setIsDesktop(window.innerWidth >= 768)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  const handleMouseEnter = () => {
    if (isDesktop) {
      setIsSideMenuOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (isDesktop) {
      setIsSideMenuOpen(false)
    }
  }

  const toggleMenu = () => {
    if (!isDesktop) {
      setIsSideMenuOpen(!isSideMenuOpen)
    }
  }

  if (loading || !user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Side Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-background border-r transform transition-transform duration-300 ease-in-out z-50 ${
          isSideMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Menu</h2>
          <nav className="space-y-2">
            <Link href="/" className="block p-2 hover:bg-accent rounded-md">Dashboard</Link>
            <Link href="/sales" className="block p-2 hover:bg-accent rounded-md">Sales</Link>
            <Link href="/costs" className="block p-2 hover:bg-accent rounded-md">Costs</Link>
            <Link href="/sales-report" className="block p-2 hover:bg-accent rounded-md">Sales Report</Link>
            <Link href="/costs-report" className="block p-2 hover:bg-accent rounded-md">Costs Report</Link>
          </nav>
        </div>
      </div>

      {/* Hover area for desktop */}
      {isDesktop && (
        <div
          className="fixed top-0 left-0 w-16 h-full z-40"
          onMouseEnter={handleMouseEnter}
        />
      )}

      {/* Main Content */}
      <div className="p-4 sm:p-6 md:p-8 space-y-8">
        <header className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMenu}
            >
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt={user.email} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">TZS 2,001,600</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
              <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">TZS 239,200</div>
              <p className="text-xs text-muted-foreground">+4% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Sale Entry</CardTitle>
              <PlusCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link href="/sales">
                <Button className="w-full">Add New Sale</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Cost Entry</CardTitle>
              <PlusCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link href="/costs">
                <Button className="w-full" variant="outline">Add New Cost</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList>
            <TabsTrigger value="daily">Daily Reports</TabsTrigger>
            <TabsTrigger value="summary">Today's Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="space-y-4">
            <DailyReportsCard />
          </TabsContent>
          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Summary of today's activities will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Link href="/sales-report">
            <Button variant="outline" className="w-full sm:w-auto">View Full Sales Report</Button>
          </Link>
          <Link href="/costs-report">
            <Button variant="outline" className="w-full sm:w-auto">View Full Costs Report</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}