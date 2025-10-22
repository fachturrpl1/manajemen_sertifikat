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
  const [showFilter, setShowFilter] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [filterCategory, setFilterCategory] = useState<string>("")
  const [filterFrom, setFilterFrom] = useState<string>("") // yyyy-mm-dd
  const [filterTo, setFilterTo] = useState<string>("")   // yyyy-mm-dd
  const [filterQ, setFilterQ] = useState<string>("")
  const router = useRouter()
  const { t, locale, setLocale } = useI18n()

  useEffect(() => {
    // Load categories (deduped) from certificates
    (async () => {
      const { data } = await supabase
        .from('certificates')
        .select('category')
        .limit(1000)
      const set = new Set<string>()
      data?.forEach((row: any) => {
        const c = String(row?.category || '').trim()
        if (c) set.add(c)
      })
      setCategories(Array.from(set).sort((a, b) => a.localeCompare(b)))
    })()
  }, [])

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

  async function applyFilters() {
    // Build query by selected filters; also include typed number as exact filter if provided
    let query = supabase
      .from('certificates')
      .select('number,preview_image,category,issued_at,title,description')
      .limit(48)

    if (no.trim()) {
      query = query.eq('number', no.trim())
    }
    if (filterCategory) {
      query = query.eq('category', filterCategory)
    }
    if (filterFrom) {
      query = query.gte('issued_at', filterFrom)
    }
    if (filterTo) {
      // add one day to include end date time if DB stores timestamps
      query = query.lte('issued_at', filterTo)
    }
    if (filterQ.trim()) {
      const q = `%${filterQ.trim()}%`
      query = query.or(
        `title.ilike.${q},description.ilike.${q},number.ilike.${q}`
      )
    }

    const { data } = await query
    setMatches((data as any[])?.map(d => ({ number: d.number, preview_image: d.preview_image })) || [])
    setShowFilter(false)
  }

  function resetFilters() {
    setFilterCategory("")
    setFilterFrom("")
    setFilterTo("")
    setFilterQ("")
    setMatches([])
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
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500"
          >
            {t('verify')}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowFilter((v) => !v)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              Filter
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-2 w-[22rem] rounded-xl border border-gray-200 bg-white p-4 text-left shadow-lg dark:border-white/10 dark:bg-[#0e1930] z-20">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-black dark:text-white">Filter Certificates</div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs mb-1 text-black/70 dark:text-white/70">Category</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm dark:border-white/10 dark:bg-[#0b1220]"
                      >
                        <option value="">All</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs mb-1 text-black/70 dark:text-white/70">From date</label>
                        <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm dark:border-white/10 dark:bg-[#0b1220]" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-black/70 dark:text-white/70">To date</label>
                        <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm dark:border-white/10 dark:bg-[#0b1220]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-black/70 dark:text-white/70">Keyword</label>
                      <input
                        value={filterQ}
                        onChange={(e) => setFilterQ(e.target.value)}
                        placeholder="Title/Description/Number"
                        className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm dark:border-white/10 dark:bg-[#0b1220]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button onClick={resetFilters} className="text-xs text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white">Reset all</button>
                    <div className="space-x-2">
                      <button onClick={() => setShowFilter(false)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">Cancel</button>
                      <button onClick={applyFilters} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium hover:bg-blue-500">Apply Filters</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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


