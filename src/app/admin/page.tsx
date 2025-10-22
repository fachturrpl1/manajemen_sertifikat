"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Pencil, X, Search } from "lucide-react"
import { ModalOverlay, ModalContent } from "@/components/ui/separator"
import { useI18n } from "@/lib/i18n"

export default function AdminPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [results, setResults] = useState<Array<{ id: string; name?: string | null; number?: string | null; category?: string | null }>>([])
  const router = useRouter()
  const { t } = useI18n()
  type Draft = { name?: string; number?: string; category?: string; recipientOrg?: string; issuer?: string; issuedAt?: string; expiresAt?: string }
  const [showAddModal, setShowAddModal] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")

  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    let ignore = false
    const search = async () => {
      setIsSearching(true)
      type CertRow = { id: string; name?: string | null; number?: string | null; category?: string | null }
      let data: CertRow[] | null = null
      let error: unknown = null
      if (query && query.trim().length > 0) {
        const orFilter = `name.ilike.%${query}%,number.ilike.%${query}%,category.ilike.%${query}%`
        let rq = supabase
          .from("certificates")
          .select("id,name,number,category")
          .or(orFilter)
          .limit(10)
        if (categoryFilter) rq = rq.eq('category', categoryFilter)
        const res = await rq
        data = res.data as unknown as CertRow[] | null
        error = res.error as unknown
      } else {
        let rq = supabase
          .from("certificates")
          .select("id,name,number,category")
          .order('name', { ascending: true })
          .limit(10)
        if (categoryFilter) rq = rq.eq('category', categoryFilter)
        const res = await rq
        data = res.data as unknown as CertRow[] | null
        error = res.error as unknown
      }
      if (!ignore) {
        if (error) {
          console.error("certificates search error:", error)
          setResults([])
        } else {
          setResults((data ?? []).map((r) => ({ id: r.id, name: r.name ?? null, number: r.number ?? null, category: r.category ?? null })))
        }
        setIsSearching(false)
      }
    }
    const t = setTimeout(search, 300)
    return () => { ignore = true; clearTimeout(t) }
  }, [query, categoryFilter, refreshTick])

  useEffect(() => {
    const channel = supabase
      .channel('certificates-changes-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, () => {
        setRefreshTick((x) => x + 1)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  function goCreateNew() {
    setDraft({ name: "", number: "", category: "", recipientOrg: "", issuer: "", issuedAt: "", expiresAt: "" })
    setShowAddModal(true)
  }

  function goEdit(id: string) {
    router.push(`/admin/edit?id=${id}`)
  }
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
        <AdminNavbar />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full rounded-md border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm placeholder:text-white/50"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/60"
              >
                <option value="">{t('allCategories')}</option>
                <option value="kunjungan industri">{t('industrialVisit')}</option>
                <option value="magang">{t('internship')}</option>
                <option value="mou">{t('mou')}</option>
                <option value="pelatihan">{t('training')}</option>
              </select>
            </div>
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
        {showAddModal && draft && (
          <>
            <ModalOverlay onClick={() => setShowAddModal(false)} />
            <ModalContent>
              <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#0d1223] p-4 text-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-semibold">{t('addNewCertificate')}</div>
                  <button onClick={() => setShowAddModal(false)} className="rounded-md border border-white/10 bg-white/5 p-1" aria-label="Close">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="mb-1 text-white/70">{t('name')}</div>
                    <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                  </div>
                  <div>
                    <div className="mb-1 text-white/70">{t('number')}</div>
                    <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.number ?? ""} onChange={(e) => setDraft({ ...draft, number: e.target.value })} />
                  </div>
                  <div>
                    <div className="mb-1 text-white/70">{t('issuer')}</div>
                    <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.issuer ?? ""} onChange={(e) => setDraft({ ...draft, issuer: e.target.value })} />
                  </div>
                  <div>
                    <div className="mb-1 text-white/70">{t('recipientOrganization')}</div>
                    <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.recipientOrg ?? ""} onChange={(e) => setDraft({ ...draft, recipientOrg: e.target.value })} />
                  </div>
                  <div>
                    <div className="mb-1 text-white/70">{t('issuedDate')}</div>
                    <input type="date" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.issuedAt ?? ""} onChange={(e) => setDraft({ ...draft, issuedAt: e.target.value })} />
                  </div>
                  <div>
                    <div className="mb-1 text-white/70">{t('expiredDate')}</div>
                    <input type="date" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.expiresAt ?? ""} onChange={(e) => setDraft({ ...draft, expiresAt: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-1 text-white/70">{t('category')}</div>
                    <select
                      className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2"
                      value={draft.category ?? ""}
                      onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    >
                      <option value="" disabled>{t('selectCategory')}</option>
                      <option value="kunjungan industri">{t('industrialVisit')}</option>
                      <option value="magang">{t('internship')}</option>
                      <option value="mou">{t('mou')}</option>
                      <option value="pelatihan">{t('training')}</option>
                    </select>
                  </div>
                </div>
                {updateMessage && (
                  <div className={`mb-6 mt-6 rounded-md p-4 text-sm ${
                    updateMessage.includes('berhasil') 
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {updateMessage}
                  </div>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <button className="rounded-md border border-white/10 bg-white/5 px-3 py-2" onClick={() => setShowAddModal(false)}>{t('cancel')}</button>
                  <button
                    className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-green-300"
                    onClick={async () => {
                      if (!draft) return
                      setIsUpdating(true)
                      setUpdateMessage("")
                      try {
                        const { error } = await supabase
                          .from("certificates")
                          .insert({
                            name: draft.name ?? null,
                            number: draft.number ?? null,
                            category: draft.category ?? null,
                            recipient_org: draft.recipientOrg ?? null,
                            issuer: draft.issuer ?? null,
                            issued_at: draft.issuedAt ?? null,
                            expires_at: draft.expiresAt ?? null,
                          })
                        if (error) {
                          setUpdateMessage("Gagal menambahkan data: " + (error.message || ''))
                          return
                        }
                        setUpdateMessage("Sertifikat berhasil ditambahkan!")
                        setTimeout(() => { setShowAddModal(false); setUpdateMessage(""); setIsUpdating(false) }, 1200)
                      } catch (e) {
                        setUpdateMessage("Terjadi kesalahan yang tidak terduga")
                      } finally {
                        setIsUpdating(false)
                      }
                    }}
                    disabled={isUpdating}
                  >
                    {isUpdating ? t('saving') : t('add')}
                  </button>
                </div>
              </div>
            </ModalContent>
          </>
        )}
        <style jsx global>{`
          select option { background-color: #0f1c35; color: #ffffff; }
          select { color-scheme: dark; }
        `}</style>
      </div>
    </ProtectedRoute>
  )
}


