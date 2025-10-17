"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export type User = {
  id: string
  email: string
  role: 'admin' | 'team' | 'public'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Cek apakah ada data user di localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    router.push('/login')
  }

  const isAdmin = user?.role === 'admin'
  const isTeam = user?.role === 'team'
  const isAuthenticated = !!user

  return {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isTeam,
    isAuthenticated
  }
}
