import { supabase } from './supabase'

export interface Sale {
  id: number
  user_id: string
  description: string
  quantity: number
  price: number
  created_at: string
}

export interface Cost {
  id: number
  user_id: string
  description: string
  amount: number
  created_at: string
}

export interface Report {
  id: number
  user_id: string
  total_sales: number
  total_costs: number
  profit_loss: number
  created_at: string
  sales_count: number
  costs_count: number
  updated_at: string
}

export async function getSales(userId: string): Promise<Sale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function addSale(sale: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> {
  const { data, error } = await supabase
    .from('sales')
    .insert(sale)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getCosts(userId: string): Promise<Cost[]> {
  const { data, error } = await supabase
    .from('costs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function addCost(cost: Omit<Cost, 'id' | 'created_at'>): Promise<Cost> {
  const { data, error } = await supabase
    .from('costs')
    .insert(cost)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getReport(userId: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateReport(report: Omit<Report, 'created_at'>): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .upsert(report)
    .select()
    .single()

  if (error) throw error
  return data
}