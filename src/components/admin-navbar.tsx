"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/useAuth"
import { useI18n } from "@/lib/i18n"
import { Globe } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"

export function AdminNavbar() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const { locale, setLocale, t } = useI18n()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
      <div className="flex items-center gap-8">
      <Link href="/admin">
      <div className="mx-auto m-1 inline-flex items-center gap-2">
        <div className="h-7 w-7 size-7 rounded-md bg-blue-600 text-white grid place-items-center font-bold">
          S
        </div>
        <span className="text-lg   font-semibold tracking-wide">
          <span className="text-black dark:text-white">Sertiku</span>
          <span className="text-blue-600 dark:text-blue-400">.co.id</span>
        </span>
      </div>
      </Link>
        <nav className="hidden md:flex items-center gap-10 text-sm">
          <Link 
            className={`transition-colors hover:text-black dark:hover:text-white ${
              pathname === '/admin' ? 'text-black font-medium dark:text-white' : 'text-black/70 dark:text-white/70'
            }`} 
            href="/admin"
          >
            {t('dashboard')}
          </Link>
          <Link 
            className={`transition-colors hover:text-black dark:hover:text-white ${
              pathname === '/admin/manage' ? 'text-black font-medium dark:text-white' : 'text-black/70 dark:text-white/70'
            }`} 
            href="/admin/manage"
          >
            {t('manage')}
          </Link>
          <Link 
            className={`transition-colors hover:text-black dark:hover:text-white ${
              pathname === '/admin/faq' ? 'text-black font-medium dark:text-white' : 'text-black/70 dark:text-white/70'
            }`} 
            href="/admin/faq"
          >
            {t('faq')}
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-black/70 dark:text-white/70">{t('welcome')}, {user?.email}</span>
        <button onClick={() => setShowLogoutConfirm(true)} className="text-sm text-blue-600 hover:text-black dark:text-blue-400 dark:hover:text-white">{t('logout')}</button>
        {/* Language Toggle Button */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-black/5 px-3 py-1.5 text-sm hover:bg-black/10 transition-colors dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          title={locale === 'en' ? t('switchToIndonesian') : t('switchToEnglish')}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium">{locale === 'en' ? 'EN' : 'ID'}</span>
        </button>
        <ThemeToggle />
      </div>
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 animate-in fade-in duration-200"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200 dark:border-white/10 dark:bg-[#0d172b]">
            <h3 className="text-lg font-semibold mb-1 text-black dark:text-white">{t('confirmLogoutTitle')}</h3>
            <p className="mb-4 text-black/70 dark:text-white/70">{t('confirmLogoutMessage')}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="rounded-md border border-gray-300 bg-black/5 px-4 py-2 text-sm text-black hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">{t('cancel')}</button>
              <button onClick={() => { setShowLogoutConfirm(false); router.push('/login') }} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">{t('logout')}</button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}


