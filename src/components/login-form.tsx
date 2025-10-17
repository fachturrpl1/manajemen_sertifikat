"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/useAuth"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    
    const form = event.currentTarget
    const emailInput = form.querySelector<HTMLInputElement>("#email")
    const passwordInput = form.querySelector<HTMLInputElement>("#password")
    
    const email = emailInput?.value || ""
    const password = passwordInput?.value || ""

    try {
      // 1) Coba login sebagai admin di tabel users
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('id,email,role,password')
        .eq('email', email)
        .eq('password', password)
        .single()

      if (adminUser && !adminError) {
        console.log("Admin login successful:", adminUser.email)
        login({
          id: adminUser.id,
          email: adminUser.email,
          role: (adminUser as any).role ?? 'admin'
        })
        if (((adminUser as any).role ?? 'admin') === 'admin') {
          router.push('/admin')
        } else if ((adminUser as any).role === 'team') {
          router.push('/team')
        } else {
          router.push('/all')
        }
        return
      }

      // 2) Jika tidak ada di users, coba login sebagai member (team)
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('id,email,password')
        .eq('email', email)
        .eq('password', password)
        .single()

      if (member && !memberError) {
        console.log("Member login successful:", member.email)
        login({
          id: member.id,
          email: member.email,
          role: 'team'
        })
        router.push('/team')
        return
      }

      // Jika keduanya gagal
      console.error('Login error:', adminError ?? memberError)
      setError('Email atau password salah')
    } catch (error) {
      console.error('Login error:', error)
      setError("Terjadi kesalahan saat login")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        {error && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
            {error}
          </div>
        )}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="example@gmail .com" required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="password" 
              required 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </Field>
        <Link href="/all">
          <Field className="gap-1 py-0 text-blue-500">
            <Button type="submit">Continue as guest</Button>
          </Field>
        </Link>
      </FieldGroup>
    </form>
  )
}
