"use client"

import { TeamNavbar } from "@/components/team-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function TeamPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<Array<{ id: string; name?: string | null; number?: string | null; category?: string | null }>>([])
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    let ignore = false
    const search = async () => {
      setIsSearching(true)
      let data: any[] | null = null
      let error: any = null
      if (query && query.trim().length > 0) {
        const orFilter = `name.ilike.%${query}%,number.ilike.%${query}%,category.ilike.%${query}%`
        const res = await supabase
          .from("certificates")
          .select("id,name,number,category")
          .or(orFilter)
          .limit(10)
        data = res.data
        error = res.error
      } else {
        const res = await supabase
          .from("certificates")
          .select("id,name,number,category")
          .order('name', { ascending: true })
          .limit(10)
        data = res.data
        error = res.error
      }
      if (!ignore) {
        if (error) {
          console.error("certificates search error:", error)
          setResults([])
        } else {
          setResults((data ?? []).map(r => ({ id: r.id as string, name: (r as any).name ?? null, number: (r as any).number ?? null, category: (r as any).category ?? null })))
        }
        setIsSearching(false)
      }
    }
    const t = setTimeout(search, 300)
    return () => { ignore = true; clearTimeout(t) }
  }, [query])

  function goCreateNew() {
    router.push("/team/edit?new=1")
  }

  function goEdit(id: string) {
    router.push(`/team/edit?id=${id}`)
  }
  return (
    <ProtectedRoute allowedRoles={['team']}>
      <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
        <TeamNavbar />
        <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <section className="rounded-xl border border-white/10 bg-[#0d172b] p-6 shadow-xl shadow-blue-500/10">
          <h2 className="text-3xl font-bold text-blue-400 mb-4">{t('howToUse')}</h2>
          <ol className="space-y-3 text-white/80 list-decimal pl-5">
            <li>{t('step1')}</li>
            <li>{t('step2')}</li>
            <li>{t('step3')}</li>
            <li>{t('step4')}</li>
            <li>{t('step5')}</li>
            <li>{t('step6')}</li>
          </ol>
        </section>

        <aside className="rounded-xl border border-white/10 bg-[#0d172b] p-5 space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">{t('searchCertificate')}</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/50"
            />
            <div className="mt-2 max-h-64 overflow-auto rounded-md border border-white/10 bg-[#0f1c35]">
              {isSearching ? (
                <div className="px-3 py-2 text-sm text-white/60">{t('loading')}</div>
              ) : results.length === 0 ? (
                <div className="px-3 py-2 text-sm text-white/60">{t('noData')}</div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {results.map((r) => (
                    <li key={r.id} className="px-3 py-2 flex items-center justify-between gap-3 hover:bg-white/5">
                      <div className="min-w-0">
                        <div className="truncate text-white text-sm font-medium">{r.name || t('noName')}</div>
                        <div className="truncate text-white/60 text-xs">No: {r.number || "-"} • {t('category')}: {r.category || "-"}</div>
                      </div>
                      <div className="shrink-0 flex gap-2">
                        <button onClick={() => goEdit(r.id)} className="rounded-md border border-white/10 bg-white/5 p-1 hover:bg-white/10" aria-label="Edit">
                          <Pencil className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="pt-1">
            <button onClick={goCreateNew} className="w-full rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-medium">{t('createNew')}</button>
          </div>
        </aside>
        </main>
      </div>
    </ProtectedRoute>
  )
}


