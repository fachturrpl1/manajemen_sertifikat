"use client"

import React from "react"
import type { Role } from "./supabase"

type AuthContextValue = {
  role: Role
  setRole: (r: Role) => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = React.useState<Role>("admin")
  return (
    <AuthContext.Provider value={{ role, setRole }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function RoleGuard({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { role } = useAuth()
  if (!allow.includes(role)) {
    return <div className="p-6 text-white/80">Access denied for role: {role}</div>
  }
  return <>{children}</>
}


