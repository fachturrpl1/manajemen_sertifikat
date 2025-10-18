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
import { useI18n } from "@/lib/i18n"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const { login } = useAuth()
  const { t } = useI18n()
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
      // Query ke tabel users di Supabase
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single()

      if (userError || !user) {
        console.error("Login error:", userError)
        setError(t('emailOrPasswordWrong'))
        return
      }

      console.log("Login successful:", user.email)

      // Simpan data user menggunakan hook
      login({
        id: user.id,
        email: user.email,
        role: user.role
      })

      // Redirect berdasarkan role
      if (user.role === 'admin') {
        router.push("/admin")
      } else if (user.role === 'team') {
        router.push("/team")
      } else {
        router.push("/all")
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(t('loginError'))
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t('loginToAccount')}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t('enterEmailToLogin')}
          </p>
        </div>
        {error && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
            {error}
          </div>
        )}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder={t('emailPlaceholder')} required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder={t('passwordPlaceholder')} 
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
            {isLoading ? t('loggingIn') : t('login')}
          </Button>
        </Field>
        <Link href="/all">
          <Field className="gap-1 py-0 text-blue-500">
            <Button type="submit">{t('continueAsGuest')}</Button>
          </Field>
        </Link>
      </FieldGroup>
    </form>
  )
}
