"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import { Globe } from "lucide-react"
import Image from "next/image"

export default function AuPage() {
  const { t, locale, setLocale } = useI18n()
  return (
    <div className="relative min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
      <div className="absolute left-6 top-6 z-20">
        <a href="#" className="flex items-center gap-2 font-medium">
          <div className="bg-blue-600 text-primary-white flex size-7 items-center justify-center rounded-md">
            S
          </div>
          <span className="text-lg font-semibold tracking-wide">
            <span className="text-white">Sertiku</span>
            <span className="text-blue-400">.co.id</span>
          </span>
        </a>
      </div>
      <div className="absolute right-6 top-6 z-20 flex items-center gap-4">
        <Link href="/login" className="text-sm text-blue-400 hover:text-white">{t('login')}</Link>
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
    
      {/* subtle pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10)_1px,_transparent_1px)] [background-size:28px_28px] opacity-60"
      />

      <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              {t('creatorAndManagement')}
            </h1>
            <p className="mt-4 max-w-2xl text-white/80">
              {t('designDescription')}
            </p>

          <div className="mt-8 flex items-center gap-3">
            <a
              href="/all"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500"
            >
              {t('tryPublicVerification')}
            </a>
          </div>

          <p className="mt-3 text-xs text-white/50">* {t('noCreditCard')}</p>
        </div>

        <div className="relative">
          {/* mock preview area */}
          <div className="rounded-2xl border border-white/10 bg-[#0d172b] p-4 shadow-xl shadow-blue-500/10">
            <div className="aspect-[16/10] w-full rounded-lg bg-white/5 relative overflow-hidden box-content">
              <Image
                src="/root.jpg"
                alt="Preview"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/70">
              <div className="rounded-md border border-white/10 bg-white/5 p-2">{t('feature1')}</div>
              <div className="rounded-md border border-white/10 bg-white/5 p-2">{t('feature2')}</div>
              <div className="rounded-md border border-white/10 bg-white/5 p-2">{t('feature3')}</div>
              <div className="rounded-md border border-white/10 bg-white/5 p-2">{t('feature4')}</div>
              <div className="rounded-md border border-white/10 bg-white/5 p-2">{t('feature5')}</div>
              <div className="rounded-md border border-white/10 bg-white/5 p-2">{t('feature6')}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


