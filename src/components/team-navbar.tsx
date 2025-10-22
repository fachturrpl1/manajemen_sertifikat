"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/useAuth"
import { Globe } from "lucide-react"

export function TeamNavbar() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { locale, setLocale, t } = useI18n()
  const { user } = useAuth()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <div className="flex items-center gap-8">
      <Link href="/team">
      <div className="mx-auto m-1 inline-flex items-center gap-2">
        <div className="h-7 w-7 size-7 rounded-md bg-blue-600 text-white grid place-items-center font-bold">
          S
        </div>
        <span className="text-lg   font-semibold tracking-wide">
          <span className="text-white">Sertiku</span>
          <span className="text-blue-400">.co.id</span>
        </span>
      </div>
      </Link>
        <nav className="hidden md:flex items-center gap-10 text-sm">
          <Link 
            className={`hover:text-white transition-colors ${
              pathname === '/team' ? 'text-white font-medium' : 'text-white/70'
            }`} 
            href="/team"
          >
            {t('dashboard')}
          </Link>
          <Link 
            className={`hover:text-white transition-colors ${
              pathname === '/team/manage' ? 'text-white font-medium' : 'text-white/70'
            }`} 
            href="/team/manage"
          >
            {t('manage')}
          </Link>
          <Link 
            className={`hover:text-white transition-colors ${
              pathname === '/team/faq' ? 'text-white font-medium' : 'text-white/70'
            }`} 
            href="/team/faq"
          >
            {t('faq')}
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-white/70">{t('welcome')}{user?.email ? `, ${user.email}` : ''}</span>
        <button onClick={() => setShowLogoutConfirm(true)} className="text-sm text-blue-400 hover:text-white">{t('logout')}</button>
        {/* Language Toggle Button */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
          className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 transition-colors"
          title={locale === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium">{locale === 'en' ? 'EN' : 'ID'}</span>
        </button>
      </div>
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 animate-in fade-in duration-200"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-white/10 bg-[#0d172b] p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            <h3 className="text-lg font-semibold mb-1">Konfirmasi Logout</h3>
            <p className="text-white/70 mb-4">Anda yakin ingin keluar?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Batal</button>
              <button onClick={() => { setShowLogoutConfirm(false); router.push('/login') }} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500">Logout</button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}


