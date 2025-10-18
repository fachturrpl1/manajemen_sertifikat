"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import { Globe } from "lucide-react"

export default function PublicVerifyPage() {
  const [no, setNo] = useState("")
  const router = useRouter()
  const { t, locale, setLocale } = useI18n()

  function submit() {
    if (!no.trim()) return
    router.push(`/cek/${encodeURIComponent(no.trim())}`)
  }

  return (
    <div className="min-h-svh relative flex items-center justify-center bg-[#0b1220] text-white">
      <div className="absolute right-6 top-6 z-20 flex items-center gap-4">
        {/* Language Toggle Button */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
          className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 transition-colors"
          title={locale === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium">{locale === 'en' ? 'EN' : 'ID'}</span>
        </button>
        
        <Link href="/login" className="text-sm text-blue-400 hover:text-white">{t('login')}</Link>
      </div>
      {/* grid background overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.08)_1px,_transparent_1px)] [background-size:28px_28px] opacity-60"
      />

      <div className="relative z-10 w-full max-w-2xl px-6 text-center">
        {/* Logo */}
        <Link href="/">        
        <div className="mx-auto mb-6 inline-flex items-center gap-2">
          <div className="h-10 w-10 size-7 rounded-md bg-blue-600 text-white grid place-items-center font-bold">
            S
          </div>
          <span className="text-3xl font-semibold tracking-wide">
            <span className="text-white">Sertiku</span>
            <span className="text-blue-400">.co.id</span>
          </span>
        </div>
        </Link>

        <h1 className="mb-4 text-4xl md:text-5xl font-extrabold text-blue-400">
          {t('certificateVerification')}
        </h1>
        <p className="mb-6 text-white/80">{t('enterCertificateNumber')}</p>

        <div className="mx-auto flex max-w-xl items-stretch gap-3">
          <input
            value={no}
            onChange={(e) => setNo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={t('typeCertificateNumber')}
            className="flex-1 rounded-lg border border-blue-900/60 bg-[#0e1930] px-4 py-3 text-base outline-none ring-1 ring-transparent focus:ring-blue-500/60 placeholder:text-white/50"
          />
          <button
            onClick={submit}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500"
          >
            {t('verify')}
          </button>
        </div>
      </div>
    </div>
  )
}


