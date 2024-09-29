import { NextResponse } from 'next/server'
import { supabaseAdmin, getServerSupabase, isSupabaseAdminInitialized } from '@/lib/supabaseServer'
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: Request) {
  try {
    if (!isSupabaseAdminInitialized()) {
      console.error('Supabase admin client not initialized. Environment variables:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set'
      })
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = getServerSupabase()

    const body = await request.json()
    const result = userSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.issues }, { status: 400 })
    }

    const { email, password } = result.data

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not initialized');
    }

    // Create user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      console.error('Error creating user:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 500 })
    }

    // Insert user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: authData.user.id, email: authData.user.email, role: 'user' })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error creating user:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}