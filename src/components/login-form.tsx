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
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setEmailError("")
    setPasswordError("")

    const form = event.currentTarget
    const emailInput = form.querySelector<HTMLInputElement>("#email")
    const passwordInput = form.querySelector<HTMLInputElement>("#password")

    const email = emailInput?.value.trim() || ""
    const password = passwordInput?.value || ""

    // Validasi email
    if (!email) {
      setEmailError(t("emailRequired"))
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError(t("emailInvalid"))
      return
    }

    // Validasi password
    if (!password) {
      setPasswordError(t("passwordRequired"))
      return
    }
    if (password.length < 6) {
      setPasswordError(t("passwordMinLength"))
      return
    }

    setIsLoading(true)

    try {
      // 🔍 Cek tabel users (ADMIN)
      const { data: userAdmin, error: adminError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single()

      if (userAdmin && !adminError) {
        console.log("✅ Admin login:", userAdmin.email)

        login({
          id: userAdmin.id,
          email: userAdmin.email,
          role: userAdmin.role,
        })

        router.push("/admin")
        return
      }

      // 🔍 Cek tabel members (TEAM)
      const { data: userTeam, error: teamError } = await supabase
        .from("members")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single()

      if (userTeam && !teamError) {
        console.log("✅ Team login:", userTeam.email)

        login({
          id: userTeam.id,
          email: userTeam.email,
          role: userTeam.role || "team",
        })

        // Kalau role-nya team → ke /team
        // Kalau role lain (misal guest) → ke /all
        if (userTeam.role === "team") {
          router.push("/team")
        } else {
          router.push("/all")
        }
        return
      }

      // ❌ Kalau dua-duanya gagal
      setError(t("emailOrPasswordWrong"))
    } catch (error) {
      console.error("Login error:", error)
      setError(t("loginError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{t("loginToAccount")}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t("enterEmailToLogin")}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            className={emailError ? "border-red-500 focus:ring-red-500" : ""}
            required
          />
          {emailError && (
            <p className="text-xs text-red-500 mt-1">{emailError}</p>
          )}
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              className={passwordError ? "border-red-500 focus:ring-red-500" : ""}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {passwordError && (
            <p className="text-xs text-red-500 mt-1">{passwordError}</p>
          )}
        </Field>

        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t("loggingIn") : t("login")}
          </Button>
        </Field>

        <Link href="/all">
          <Field className="gap-1 py-0 text-blue-500">
            <Button type="button">{t("continueAsGuest")}</Button>
          </Field>
        </Link>
      </FieldGroup>
    </form>
  )
}
