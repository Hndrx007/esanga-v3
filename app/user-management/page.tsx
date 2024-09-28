'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useUser } from '../../lib/useUser'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string;
  email: string;
  role: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { user, loading } = useUser()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/')
      } else {
        fetchUsers()
      }
    }
  }, [user, loading, router])

  async function fetchUsers() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')

    if (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      })
    } else {
      setUsers(data || [])
    }
    setIsLoading(false)
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({
      email: newUserEmail,
      password: newUserPassword,
    })

    if (error) {
      console.error('Error adding user:', error)
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "User added successfully.",
      })
      setNewUserEmail('')
      setNewUserPassword('')
      fetchUsers()
    }
  }

  async function updateUserRole(userId: string, newRole: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user role:', error)
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "User role updated successfully.",
      })
      fetchUsers()
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>
        
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New User</h2>
          <form onSubmit={addUser} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              required
            />
            <Button type="submit">Add User</Button>
          </form>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">User List</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left">Email</th>
                <th className="text-left">Role</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <Button
                      onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                      variant="outline"
                      size="sm"
                    >
                      {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="text-center">
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}