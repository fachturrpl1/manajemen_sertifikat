"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import { Globe, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import ThemeToggle from "@/components/theme-toggle"

export default function PublicVerifyPage() {
  const [no, setNo] = useState("")
  const [matches, setMatches] = useState<Array<{ number: string; preview_image: string | null }>>([])
  const router = useRouter()
  const { t, locale, setLocale } = useI18n()


  async function submit() {
    const raw = no.trim()
    if (!raw) return
    // If user pasted a URL (e.g., Supabase public preview_image), try to resolve to certificate number
    if (/^https?:\/\//i.test(raw)) {
      setMatches([])
      const url = raw
      // First, exact/equivalent match
      const { data: exactData } = await supabase
        .from("certificates")
        .select("number,preview_image")
        .or(`preview_image.eq.${url},preview_image.ilike.%${url}%`)
        .limit(1)
        .maybeSingle()
      if (exactData?.number) {
        router.push(`/cek/${encodeURIComponent(String(exactData.number))}`)
        return
      }
      // Fallback: match by filename segment (strip query)
      try {
        const u = new URL(url)
        const file = u.pathname.split('/').pop() || ''
        const fname = file.split('?')[0]
        if (fname) {
          const { data: byFile } = await supabase
            .from("certificates")
            .select("number,preview_image")
            .ilike("preview_image", `%${fname}%`)
            .limit(1)
            .maybeSingle()
          if (byFile?.number) {
            router.push(`/cek/${encodeURIComponent(String(byFile.number))}`)
            return
          }
        }
      } catch {}
      // As last resort, open the URL directly (keeps current behavior intuitive)
      if (typeof window !== 'undefined') window.open(url, '_blank')
      return
    }
    // Default: treat as certificate number: show results below
    const { data } = await supabase
      .from('certificates')
      .select('number,preview_image')
      .eq('number', raw)
      .limit(24)
    setMatches(data || [])
  }


  return (
    <div className="min-h-svh relative flex items-center justify-center bg-white text-black dark:bg-[#0b1220] dark:text-white">
      <div className="absolute right-6 top-6 z-20 flex items-center gap-4">
        <Link href="/login" className="text-sm text-blue-600 hover:text-black dark:text-blue-400 dark:hover:text-white">{t('login')}</Link>
        {/* Language Toggle Button */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
          className="flex items-center gap-2 rounded-md border border-black/10 bg-black/5 px-3 py-1.5 text-sm hover:bg-black/10 transition-colors dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          title={locale === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium">{locale === 'en' ? 'EN' : 'ID'}</span>
        </button>
        <ThemeToggle />
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
            <span className="text-black dark:text-white">Sertiku</span>
            <span className="text-blue-600 dark:text-blue-400">.co.id</span>
          </span>
        </div>
        </Link>

        <h1 className="mb-4 text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400">
          {t('certificateVerification')}
        </h1>
        <p className="mb-6 text-black/70 dark:text-white/80">{t('enterCertificateNumber')}</p>

        <div className="mx-auto flex max-w-xl items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-black/50 dark:text-white/50" />
            <input
              value={no}
              onChange={(e) => setNo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={t('typeCertificateNumber')}
              className="w-full rounded-lg border border-gray-300 bg-white text-black pl-10 pr-4 py-3 text-base outline-none ring-1 ring-transparent focus:ring-blue-500/60 placeholder:text-black/50 dark:border-blue-900/60 dark:bg-[#0e1930] dark:text-white dark:placeholder:text-white/50"
            />
          </div>
          <button
            onClick={submit}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500"
          >
            {t('verify')}
          </button>
        </div>
        {matches.length > 0 && (
          <div className="mx-auto mt-6 max-w-3xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {matches.map((m, idx) => (
                <button
                  key={`${m.number}-${idx}`}
                  onClick={() => router.push(`/cek/${encodeURIComponent(String(m.number))}`)}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5"
                >
                  {m.preview_image ? (
                    <img
                      src={m.preview_image}
                      alt={`Certificate ${m.number}`}
                      className="h-36 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-36 grid place-items-center text-xs text-black/60 dark:text-white/60">No preview</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


