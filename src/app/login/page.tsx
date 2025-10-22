"use client"

import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import { Globe } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const { t, locale, setLocale } = useI18n()
  return (
    <div className="relative min-h-svh bg-blue-50/30 text-black dark:bg-gradient-to-b dark:from-[#0b1220] dark:to-[#0f1c35] dark:text-white">
      <div className="absolute left-6 top-6 z-20">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <div className="bg-blue-600 font-bold text-white flex size-7 items-center justify-center rounded-md">
            S
          </div>
          <span className="text-lg font-semibold tracking-wide">
            <span className="text-black dark:text-white">Sertiku</span>
            <span className="text-blue-600 dark:text-blue-400">.co.id</span>
          </span>
        </Link>
      </div>
      <div className="absolute right-6 top-6 z-20">
        {/* Language Toggle Button */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-black/5 px-3 py-1.5 text-sm hover:bg-black/10 transition-colors dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          title={locale === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium">{locale === 'en' ? 'EN' : 'ID'}</span>
        </button>
      </div>
      <div className="flex min-h-svh items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md rounded-xl border-2 border-blue-100 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-[#0d172b] dark:shadow-xl dark:shadow-blue-500/10">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
