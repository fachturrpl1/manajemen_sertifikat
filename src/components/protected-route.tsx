"use client"

import { useAuth } from "@/lib/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import type { Role } from "@/lib/supabase"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export function ProtectedRoute({ children, allowedRoles = ['admin', 'team'] }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (!loading && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Redirect berdasarkan role yang dimiliki
      if (user.role === 'admin') {
        router.push('/admin')
      } else if (user.role === 'team') {
        router.push('/team')
      } else {
        router.push('/all')
      }
      return
    }
  }, [user, loading, allowedRoles, router])

  if (loading) {
    return (
      <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}



