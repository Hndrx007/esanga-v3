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
import { DailyReportsCard } from '@/components/DailyReportsCard'
import { useSummaryData } from '@/lib/useSummaryData'

export default function Dashboard() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [isMenuHovered, setIsMenuHovered] = useState(false)
  const { summaryData, isLoading: isSummaryLoading, refetch: refetchSummary } = useSummaryData()

  const handleResize = useCallback(() => {
    const newIsDesktop = window.innerWidth >= 768
    setIsDesktop(newIsDesktop)
    if (newIsDesktop) {
      setIsSideMenuOpen(false)
    }
  }, [])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'REFETCH_SUMMARY') {
        refetchSummary()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [refetchSummary])

  const toggleMenu = () => setIsSideMenuOpen(!isSideMenuOpen)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleMouseEnter = () => setIsMenuHovered(true)
  const handleMouseLeave = () => setIsMenuHovered(false)

  if (userLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Side Menu */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-background border-r transform transition-transform duration-300 ease-in-out z-50 ${
          isDesktop
            ? isMenuHovered
              ? 'translate-x-0'
              : '-translate-x-60'
            : isSideMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <nav className="p-4 space-y-2">
          <Link href="/" className="block p-2 hover:bg-accent rounded-md">Dashboard</Link>
          <Link href="/sales" className="block p-2 hover:bg-accent rounded-md">Sales</Link>
          <Link href="/costs" className="block p-2 hover:bg-accent rounded-md">Costs</Link>
          <Link href="/sales-report" className="block p-2 hover:bg-accent rounded-md">Sales Report</Link>
          <Link href="/costs-report" className="block p-2 hover:bg-accent rounded-md">Costs Report</Link>
        </nav>
      </aside>

      {/* Backdrop for mobile */}
      {!isDesktop && isSideMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        ></div>
      )}

      {/* Main Content */}
      <main className={`p-4 sm:p-6 md:p-8 space-y-8 ${isDesktop ? 'ml-4' : ''} transition-all duration-300`}>
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
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Sales"
            icon={<DollarSignIcon className="h-4 w-4 text-muted-foreground" />}
            value={isSummaryLoading ? 'Loading...' : `TZS ${summaryData.totalSales.toLocaleString()}`}
            subtitle={`${summaryData.salesCount} sales recorded`}
          />
          <SummaryCard
            title="Total Costs"
            icon={<LineChartIcon className="h-4 w-4 text-muted-foreground" />}
            value={isSummaryLoading ? 'Loading...' : `TZS ${summaryData.totalCosts.toLocaleString()}`}
            subtitle={`${summaryData.costsCount} costs recorded`}
          />
          <ActionCard
            title="New Sale Entry"
            icon={<PlusCircleIcon className="h-4 w-4 text-muted-foreground" />}
            href="/sales"
            buttonText="Add New Sale"
          />
          <ActionCard
            title="New Cost Entry"
            icon={<PlusCircleIcon className="h-4 w-4 text-muted-foreground" />}
            href="/costs"
            buttonText="Add New Cost"
            variant="outline"
          />
        </section>

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
      </main>
    </div>
  )
}

interface SummaryCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  subtitle: string;
}

function SummaryCard({ title, icon, value, subtitle }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

interface ActionCardProps {
  title: string;
  icon: React.ReactNode;
  href: string;
  buttonText: string;
  variant?: 'default' | 'outline';
}

function ActionCard({ title, icon, href, buttonText, variant = 'default' }: ActionCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <Link href={{ pathname: href, query: { refetchSummary: 'true' } }}>
          <Button className="w-full" variant={variant}>{buttonText}</Button>
        </Link>
      </CardContent>
    </Card>
  )
}