"use client"

import { useMemo, useRef, useState } from "react"
import * as XLSX from "xlsx"
import { Eye, Pencil, Trash2, X } from "lucide-react"
import { ModalOverlay, ModalContent } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { useEffect } from "react"
import jsPDF from "jspdf"
import { useToast } from "@/components/ui/toast"

type CertificateRow = {
  id?: string
  name?: string
  number?: string
  category?: string
  issuer?: string
  issuedAt?: string
  expiresAt?: string
}

type ManageContentProps = {
  role?: "admin" | "team"
}

export function ManageContent({ role = "admin" }: ManageContentProps) {
  const [rows, setRows] = useState<CertificateRow[]>([])
  const [query, setQuery] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draft, setDraft] = useState<CertificateRow | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingCertificate, setViewingCertificate] = useState<CertificateRow | null>(null)
  const [certificateData, setCertificateData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { showToast, ToastContainer } = useToast()

  // Helper function untuk menghitung posisi yang sama dengan halaman edit
  const calculatePosition = (x: number, y: number, containerWidth: number, containerHeight: number) => {
    const margin = 20
    const maxX = Math.max(0, containerWidth - margin)
    const maxY = Math.max(0, containerHeight - margin)
    return {
      x: Math.max(margin, Math.min(x, maxX)),
      y: Math.max(margin, Math.min(y, maxY))
    }
  }

  useEffect(() => {
    // Initial data fetch
    const fetchData = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("certificates")
        .select("id,name,number,category,recipient_org,issuer,issued_at,expires_at")
      if (error) {
        console.error("Supabase certificates fetch error:", error)
        setIsLoading(false)
        return
      }
      const mapped: CertificateRow[] = (data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string | undefined,
        name: r.name as string | undefined,
        number: r.number as string | undefined,
        category: r.category as string | undefined,
        issuer: r.issuer as string | undefined,
        issuedAt: r.issued_at as string | undefined,
        expiresAt: r.expires_at as string | undefined,
      }))
      console.log("Mapped certificate rows:", mapped) // Debug log
      setRows(mapped)
      setIsLoading(false)
    }

    fetchData()

    // Set up real-time subscription
    const channel = supabase
      .channel('certificates-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'certificates' },
        async () => {
          // Refetch data when any change occurs
          const { data, error } = await supabase
            .from("certificates")
            .select("id,name,number,category,issuer,issued_at,expires_at")
          if (error) {
            console.error("Supabase certificates fetch error:", error)
            return
          }
          const mapped: CertificateRow[] = (data ?? []).map((r: any) => ({
            id: r.id,
            name: r.name,
            number: r.number,
            category: r.category,
            issuer: r.issuer,
            issuedAt: r.issued_at ?? undefined,
            expiresAt: r.expires_at ?? undefined,
          }))
          setRows(mapped)
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredRows = useMemo(() => {
    if (!query) return rows
    const q = query.toLowerCase()
    return rows.filter((r) =>
      [r.name, r.number, r.category, r.issuer]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [rows, query])

  // Pagination logic
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRows = filteredRows.slice(startIndex, endIndex)

  // Reset to page 1 when query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function parseDate(value: unknown): string | undefined {
    if (value == null || value === "") return undefined
    if (typeof value === "number") {
      try {
        const jsDate = XLSX.SSF.parse_date_code(value)
        if (jsDate) {
          const d = new Date(jsDate.y, jsDate.m - 1, jsDate.d)
          return d.toISOString().slice(0, 10)
        }
      } catch {
      }
    }
    const d = new Date(String(value))
    return isNaN(d.getTime()) ? String(value) : d.toISOString().slice(0, 10)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: "array" })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      })

      const mapped: CertificateRow[] = json.map((r) => ({
        name: (r["NAMA"] ?? r["NAME"]) as string,
        number: (r["NOMOR"] ?? r["NUMBER"]) as string,
        category: (r["KATEGORI"] ?? r["CATEGORY"]) as string,
        issuer: (r["PENERBIT"] ?? r["ISSUER"]) as string,
        issuedAt: parseDate(r["TANGGAL TERBIT"] ?? r["ISSUED AT"]),
        expiresAt: parseDate(r["TANGGAL KADALUARSA"] ?? r["EXPIRES AT"]),
      }))
      setRows(mapped)
      // upsert to supabase by unique number
      ;(async () => {
        const payload = mapped.map((m) => ({
          name: m.name ?? null,
          number: m.number ?? null,
          category: m.category ?? null,
          issuer: m.issuer ?? null,
          issued_at: m.issuedAt ?? null,
          expires_at: m.expiresAt ?? null,
        }))
        const { error } = await supabase
          .from("certificates")
          .upsert(payload, { onConflict: "number" })
        if (error) {
          console.error("certificates upsert error:", {
            message: (error as Error)?.message,
            details: (error as Error & { details?: string })?.details,
            hint: (error as Error & { hint?: string })?.hint,
            code: (error as Error & { code?: string })?.code,
          })
          return
        }
        // refresh from db to get ids
        const { data } = await supabase
          .from("certificates")
          .select("id,name,number,category,issuer,issued_at,expires_at")
        const mappedDb: CertificateRow[] = (data ?? []).map((r: Record<string, unknown>) => ({
          id: r.id as string | undefined,
          name: r.name as string | undefined,
          number: r.number as string | undefined,
          category: r.category as string | undefined,
          issuer: r.issuer as string | undefined,
          issuedAt: r.issued_at as string | undefined,
          expiresAt: r.expires_at as string | undefined,
        }))
        setRows(mappedDb)
      })()
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ""
  }

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Member</h1>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => {
            setDraft({
              name: "",
              number: "",
              category: "",
              issuer: "",
              issuedAt: "",
              expiresAt: ""
            })
            setShowAddModal(true)
          }}
          className="rounded-md border border-blue-600/50 bg-blue-600/10 px-3 py-2 text-sm hover:bg-blue-600/20"
        >
          + Baru
        </button>
        <button onClick={handleImportClick} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
          Import Excel
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileChange}
          className="hidden"
        />
        <div className="ml-2 flex-1">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pencarian"
              className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
            />
            <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-white/5" />
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-[#0d172b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-white/70">
                <th className="px-4 py-3 font-medium">NAMA</th>
                <th className="px-4 py-3 font-medium">NOMOR</th>
                <th className="px-4 py-3 font-medium">KATEGORI</th>
                <th className="px-4 py-3 font-medium">PENERBIT</th>
                <th className="px-4 py-3 font-medium">TANGGAL TERBIT</th>
                <th className="px-4 py-3 font-medium">TANGGAL KADALUARSA</th>
                <th className="px-4 py-3 font-medium">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/50">
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/50">
                    Belum ada data untuk ditampilkan
                  </td>
                </tr>
              ) : (
                paginatedRows.map((r) => {
                  const idx = rows.indexOf(r)
                  return (
                    <tr key={idx} className="border-t border-white/5">
                      <td className="px-4 py-2">{r.name}</td>
                      <td className="px-4 py-2">{r.number}</td>
                      <td className="px-4 py-2">{r.category}</td>
                      <td className="px-4 py-2">{r.issuer}</td>
                      <td className="px-4 py-2">{r.issuedAt}</td>
                      <td className="px-4 py-2">{r.expiresAt}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2 text-xs">
                              <button 
                                aria-label="View" 
                                title="View" 
                                 className="rounded-md border border-white/10 bg-white/5 px-2 py-1 opacity-50 cursor-not-allowed"
                                 disabled
                              >
                                <Eye className="h-4 w-4 text-white" />
                              </button>
                              <button
                                aria-label="Edit"
                                title="Edit"
                                className="rounded-md border border-white/10 bg-white/5 px-2 py-1"
                                onClick={() => { 
                                  // Redirect ke halaman edit sertifikat
                                  window.location.href = `/admin/edit?id=${r.id}`
                                }}
                              >
                                <Pencil className="h-4 w-4 text-white" />
                              </button>
                              {role === "admin" && (
                              <button
                                  aria-label="Delete"
                                  title="Delete"
                                  className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-300"
                                  onClick={() => {
                                  const doDelete = async () => {
                                    if (r.id) {
                                      const { error } = await supabase.from("certificates").delete().eq("id", r.id)
                                      if (error) {
                                        console.error(error)
                                        return
                                      }
                                    }
                                    const copy = rows.slice()
                                    copy.splice(idx, 1)
                                    setRows(copy)
                                  }
                                  doDelete()
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-white" />
                                </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-sm">
          <div className="text-white/50">
            Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredRows.length)} dari {filteredRows.length} 
            {filteredRows.length !== rows.length && ` (${rows.length} total)`}
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 disabled:opacity-40 hover:bg-white/10" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              {"<<"}
            </button>
            <button 
              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 disabled:opacity-40 hover:bg-white/10" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              {"<"}
            </button>
            <span className="inline-flex min-w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 py-1 text-white">
              {currentPage}
            </span>
            <button 
              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 disabled:opacity-40 hover:bg-white/10" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              {">"}
            </button>
            <button 
              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 disabled:opacity-40 hover:bg-white/10" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              {">>"}
            </button>
          </div>
        </div>
      </section>
      {showModal && draft && (
        <>
          <ModalOverlay onClick={() => setShowModal(false)} />
          <ModalContent>
            <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#0d1223] p-4 text-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold">Perbarui Sertifikat</div>
                <button onClick={() => setShowModal(false)} className="rounded-md border border-white/10 bg-white/5 p-1" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 text-white/70">Nama</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div>
                  <div className="mb-2 text-white/70">Nomor</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.number ?? ""} onChange={(e) => setDraft({ ...draft, number: e.target.value })} />
                </div>
                <div>
                  <div className="mb-2 text-white/70">Penerbit</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.issuer ?? ""} onChange={(e) => setDraft({ ...draft, issuer: e.target.value })} />
                </div>
                <div>
                  <div className="mb-2 text-white/70">Tanggal Terbit</div>
                  <input type="date" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.issuedAt ?? ""} onChange={(e) => setDraft({ ...draft, issuedAt: e.target.value })} />
                </div>
                <div>
                  <div className="mb-2 text-white/70">Tanggal Kadaluarsa</div>
                  <input type="date" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.expiresAt ?? ""} onChange={(e) => setDraft({ ...draft, expiresAt: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <div className="mb-2 text-white/70">Kategori</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.category ?? ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
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
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button"
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Reset draft ke data asli tanpa menyimpan perubahan
                    if (editingIndex !== null) {
                      setDraft(rows[editingIndex])
                    }
                    setShowModal(false)
                    setUpdateMessage("")
                    setIsUpdating(false)
                    setEditingIndex(null)
                    setDraft(null)
                  }}
                  disabled={isUpdating}
                >
                  Batal
                </button>
                <button
                  className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                      if (editingIndex == null || !draft) return
                    
                    setIsUpdating(true)
                    setUpdateMessage("")
                    
                    try {
                      const row = draft
                      if (row.id) {
                        // Check if number already exists for another record
                        if (row.number) {
                          const { data: existingRecord, error: checkError } = await supabase
                            .from("certificates")
                            .select("id, number")
                            .eq("number", row.number)
                            .neq("id", row.id)
                            .single()
                          
                          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
                            console.error("Check error:", checkError)
                            setUpdateMessage("Gagal memeriksa nomor sertifikat")
                            return
                          }
                          
                          if (existingRecord) {
                            setUpdateMessage("Nomor sertifikat sudah digunakan oleh record lain")
                            return
                          }
                        }
                        
                        // Update existing record
                        const { error } = await supabase
                          .from("certificates")
                          .update({
                            name: row.name ?? null,
                            number: row.number ?? null,
                            category: row.category ?? null,
                            issuer: row.issuer ?? null,
                            issued_at: row.issuedAt ?? null,
                            expires_at: row.expiresAt ?? null,
                          })
                          .eq("id", row.id)
                        
                        if (error) {
                          console.error("Update error:", error)
                          setUpdateMessage("Gagal memperbarui data: " + error.message)
                          return
                        }
                      } else {
                        // Check if number already exists for new record
                        if (row.number) {
                          const { data: existingRecord, error: checkError } = await supabase
                            .from("certificates")
                            .select("id, number")
                            .eq("number", row.number)
                            .single()
                          
                          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
                            console.error("Check error:", checkError)
                            setUpdateMessage("Gagal memeriksa nomor sertifikat")
                            return
                          }
                          
                          if (existingRecord) {
                            setUpdateMessage("Nomor sertifikat sudah digunakan")
                            return
                          }
                        }
                        
                        // Insert new record
                        const { data, error } = await supabase
                          .from("certificates")
                          .insert({
                            name: row.name ?? null,
                            number: row.number ?? null,
                            category: row.category ?? null,
                            issuer: row.issuer ?? null,
                            issued_at: row.issuedAt ?? null,
                            expires_at: row.expiresAt ?? null,
                          })
                          .select("id")
                          .single()
                        
                        if (error) {
                          console.error("Insert error:", error)
                          setUpdateMessage("Gagal menambahkan data: " + error.message)
                          return
                        }
                        row.id = data?.id
                      }
                      
                      // Update local state immediately
                      const copy = rows.slice()
                      copy[editingIndex] = row
                      setRows(copy)
                      
                      setUpdateMessage("Data berhasil diperbarui!")
                      
                      // Close modal after a short delay to show success message
                      setTimeout(() => {
                      setEditingIndex(null)
                      setDraft(null)
                      setShowModal(false)
                        setUpdateMessage("")
                        setIsUpdating(false)
                      }, 1500)
                      
                    } catch (error) {
                      console.error("Unexpected error:", error)
                      setUpdateMessage("Terjadi kesalahan yang tidak terduga")
                    } finally {
                      setIsUpdating(false)
                    }
                  }}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Memproses..." : "Kirim"}
                </button>
              </div>
            </div>
          </ModalContent>
        </>
      )}

      {/* Add Certificate Modal */}
      {showAddModal && draft && (
        <>
          <ModalOverlay onClick={() => setShowAddModal(false)} />
          <ModalContent>
            <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#0d1223] p-4 text-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold">Tambah Sertifikat Baru</div>
                <button onClick={() => setShowAddModal(false)} className="rounded-md border border-white/10 bg-white/5 p-1" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 text-white/70">Nama</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Nomor</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.number ?? ""} onChange={(e) => setDraft({ ...draft, number: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Penerbit</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.issuer ?? ""} onChange={(e) => setDraft({ ...draft, issuer: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Tanggal Terbit</div>
                  <input type="date" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.issuedAt ?? ""} onChange={(e) => setDraft({ ...draft, issuedAt: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Tanggal Kadaluarsa</div>
                  <input type="date" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.expiresAt ?? ""} onChange={(e) => setDraft({ ...draft, expiresAt: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <div className="mb-1 text-white/70">Kategori</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.category ?? ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
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
                <button className="rounded-md border border-white/10 bg-white/5 px-3 py-2" onClick={() => setShowAddModal(false)}>Batal</button>
                <button
                  className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-green-300"
                  onClick={() => {
                    const doAdd = async () => {
                      if (!draft) return
                      
                      setIsUpdating(true)
                      setUpdateMessage("")
                      
                      try {
                        const { data, error } = await supabase
                          .from("certificates")
                          .insert({
                            name: draft.name ?? null,
                            number: draft.number ?? null,
                            category: draft.category ?? null,
                            issuer: draft.issuer ?? null,
                            issued_at: draft.issuedAt ?? null,
                            expires_at: draft.expiresAt ?? null,
                          })
                          .select("id")
                          .single()
                        
                        if (error) {
                          console.error("Insert error:", error)
                          setUpdateMessage("Gagal menambahkan data: " + error.message)
                          return
                        }
                        
                        // Add to local state
                        const newRow = { ...draft, id: data?.id }
                        setRows([...rows, newRow])
                        
                        setUpdateMessage("Sertifikat berhasil ditambahkan!")
                        
                        // Close modal after a short delay
                        setTimeout(() => {
                          setShowAddModal(false)
                          setUpdateMessage("")
                          setIsUpdating(false)
                        }, 1500)
                        
                      } catch (error) {
                        console.error("Unexpected error:", error)
                        setUpdateMessage("Terjadi kesalahan yang tidak terduga")
                      } finally {
                        setIsUpdating(false)
                      }
                    }
                    doAdd()
                  }}
                >
                  {isUpdating ? "Memproses..." : "Tambah"}
                </button>
              </div>
            </div>
          </ModalContent>
        </>
      )}

      {/* View Certificate Modal */}
      {showViewModal && viewingCertificate && (
        <>
          <ModalOverlay onClick={() => setShowViewModal(false)} />
          <ModalContent>
            <div className="w-full max-w-4xl rounded-xl border border-white/10 bg-[#0d1223] p-6 text-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="font-semibold">Pratinjau Sertifikat</div>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="rounded-md border border-white/10 bg-white/5 p-1" 
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {certificateData ? (
                <div className="space-y-4">
                  {/* Cek apakah sertifikat sudah diedit atau ada data dasar */}
                  {(certificateData.title || certificateData.name) || certificateData.description || certificateData.template_path || certificateData.issued_at ? (
                    <div className="space-y-4">
                      {/* Pratinjau Visual Sertifikat */}
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <h3 className="mb-3 font-medium">Pratinjau Sertifikat</h3>
                        <div className="relative bg-white rounded-lg overflow-hidden" style={{ 
                          aspectRatio: '4/3', 
                           maxHeight: '300px',
                           maxWidth: '450px',
                          position: 'relative',
                          contain: 'layout style paint',
                          willChange: 'transform'
                        }} data-preview-container="modal">
                          {/* Template Background */}
                          {certificateData.template_path ? (
                            <img 
                              src={`/${certificateData.template_path}`} 
                              alt="Certificate Template" 
                              className="absolute inset-0 w-full h-full object-contain"
                              data-preview-image
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-gray-600 text-lg font-semibold mb-2">SERTIFIKAT</div>
                                <div className="text-gray-500 text-sm">Template tidak tersedia</div>
                              </div>
                            </div>
                          )}
                          
                          {/* Overlay Text Container - Menggunakan posisi yang sama dengan halaman edit */}
                          <div className="absolute inset-0" style={{ position: 'relative' }}>
                            {/* Title */}
                            {(certificateData.title || certificateData.name) && (
                              <div 
                                className="absolute font-bold text-black"
                                style={{
                                  left: `${certificateData.title_x || 370}px`, 
                                  top: `${certificateData.title_y || 180}px`, 
                                  width: "calc(100% - 40px)", 
                                  transform: certificateData.title_align === "center" ? "translateX(-50%)" : certificateData.title_align === "right" ? "translateX(-100%)" : undefined, 
                                  textAlign: certificateData.title_align as "left"|"center"|"right" || "center", 
                                  fontFamily: certificateData.title_font || "Inter, ui-sans-serif, system-ui", 
                                  fontSize: `${certificateData.title_size || 32}px`, 
                                  color: certificateData.title_color || "#000000",
                                  position: 'absolute',
                                  zIndex: 10,
                                  willChange: 'transform',
                                  backfaceVisibility: 'hidden',
                                  WebkitBackfaceVisibility: 'hidden',
                                  pointerEvents: 'none',
                                  whiteSpace: 'nowrap'
                                }}
                                data-overlay="text"
                              >
                                {certificateData.title || certificateData.name}
                              </div>
                            )}
                            
                            {/* Description */}
                            {certificateData.description && (
                              <div 
                                className="absolute text-black"
                                style={{
                                  left: `${certificateData.desc_x || 360}px`, 
                                  top: `${certificateData.desc_y || 235}px`, 
                                  width: "calc(100% - 40px)", 
                                  transform: certificateData.desc_align === "center" ? "translateX(-50%)" : certificateData.desc_align === "right" ? "translateX(-100%)" : undefined, 
                                  textAlign: certificateData.desc_align as "left"|"center"|"right" || "center", 
                                  fontFamily: certificateData.desc_font || "Inter, ui-sans-serif, system-ui", 
                                  fontSize: `${certificateData.desc_size || 15}px`, 
                                  color: certificateData.desc_color || "#000000",
                                  whiteSpace: 'pre-line',
                                  position: 'absolute',
                                  zIndex: 10,
                                  willChange: 'transform',
                                  backfaceVisibility: 'hidden',
                                  WebkitBackfaceVisibility: 'hidden',
                                  pointerEvents: 'none',
                                  maxWidth: '300px'
                                }}
                              >
                                {certificateData.description}
                              </div>
                            )}
                            
                            {/* Date */}
                            {certificateData.issued_at && (
                              <div 
                                className="absolute text-black"
                                style={{
                                  left: `${certificateData.date_x || 50}px`, 
                                  top: `${certificateData.date_y || 110}px`, 
                                  width: "calc(100% - 40px)", 
                                  transform: certificateData.title_align === "center" ? "translateX(-50%)" : certificateData.title_align === "right" ? "translateX(-100%)" : undefined, 
                                  textAlign: certificateData.title_align as "left"|"center"|"right" || "center", 
                                  fontFamily: certificateData.date_font || "Inter, ui-sans-serif, system-ui", 
                                  fontSize: `${certificateData.date_size || 14}px`, 
                                  color: certificateData.date_color || "#000000",
                                  position: 'absolute',
                                  zIndex: 10,
                                  willChange: 'transform',
                                  backfaceVisibility: 'hidden',
                                  WebkitBackfaceVisibility: 'hidden',
                                  pointerEvents: 'none',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {certificateData.issued_at}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Detail Info */}
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4 relative">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium">Detail Sertifikat</h3>
                          <button
                            onClick={async () => {
                              try {
                                // Get the preview container
                                const previewContainer = document.querySelector('[data-preview-container="modal"]') as HTMLElement
                                if (!previewContainer) {
                                  alert('Preview container not found')
                                  return
                                }

                                // Get the template image
                                const templateImg = document.querySelector('[data-preview-image]') as HTMLImageElement
                                if (!templateImg) {
                                  alert('Template image not found')
                                  return
                                }

                                // Wait for image to load
                                await new Promise((resolve) => {
                                  if (templateImg.complete) {
                                    resolve(true)
                                  } else {
                                    templateImg.onload = () => resolve(true)
                                  }
                                })

                                // Get container dimensions
                                const containerRect = previewContainer.getBoundingClientRect()
                                
                                // Calculate image dimensions and position within container
                                const imageRatio = templateImg.naturalWidth / templateImg.naturalHeight
                                const containerRatio = containerRect.width / containerRect.height
                                
                                let imageWidth, imageHeight, imageX, imageY
                                
                                if (containerRatio > imageRatio) {
                                  // Container is wider, image is constrained by height
                                  imageHeight = containerRect.height
                                  imageWidth = imageHeight * imageRatio
                                  imageX = (containerRect.width - imageWidth) / 2
                                  imageY = 0
                                } else {
                                  // Container is taller, image is constrained by width
                                  imageWidth = containerRect.width
                                  imageHeight = imageWidth / imageRatio
                                  imageX = 0
                                  imageY = (containerRect.height - imageHeight) / 2
                                }

                                // Create canvas with original image dimensions
                                const canvas = document.createElement('canvas')
                                const ctx = canvas.getContext('2d')
                                if (!ctx) return

                                canvas.width = templateImg.naturalWidth
                                canvas.height = templateImg.naturalHeight

                                // Draw the template image
                                ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height)

                                // Calculate scale factors for text positioning
                                const scaleX = canvas.width / imageWidth
                                const scaleY = canvas.height / imageHeight

                                // Helper function to draw text
                                const drawText = (text: string, x: number, y: number, size: number, color: string, align: string, font: string, bold = false) => {
                                  if (!text) return
                                  
                                  ctx.fillStyle = color
                                  ctx.font = `${bold ? 'bold ' : ''}${size * scaleX}px ${font}`
                                  ctx.textAlign = align as CanvasTextAlign
                                  ctx.textBaseline = 'top'
                                  
                                  // Convert preview coordinates to canvas coordinates
                                  const canvasX = (x - imageX) * scaleX
                                  const canvasY = (y - imageY) * scaleY
                                  
                                  ctx.fillText(text, canvasX, canvasY)
                                }

                                // Draw title
                                if (certificateData.title || certificateData.name) {
                                  drawText(
                                    certificateData.title || certificateData.name,
                                    certificateData.title_x || 370,
                                    certificateData.title_y || 180,
                                    certificateData.title_size || 32,
                                    certificateData.title_color || "#000000",
                                    certificateData.title_align || "center",
                                    certificateData.title_font || "Inter, ui-sans-serif, system-ui",
                                    true
                                  )
                                }

                                // Draw description
                                if (certificateData.description) {
                                  drawText(
                                    certificateData.description,
                                    certificateData.desc_x || 360,
                                    certificateData.desc_y || 235,
                                    certificateData.desc_size || 15,
                                    certificateData.desc_color || "#000000",
                                    certificateData.desc_align || "center",
                                    certificateData.desc_font || "Inter, ui-sans-serif, system-ui"
                                  )
                                }

                                // Draw date
                                if (certificateData.issued_at) {
                                  drawText(
                                    certificateData.issued_at,
                                    certificateData.date_x || 50,
                                    certificateData.date_y || 110,
                                    certificateData.date_size || 14,
                                    certificateData.date_color || "#000000",
                                    certificateData.title_align || "center",
                                    certificateData.date_font || "Inter, ui-sans-serif, system-ui"
                                  )
                                }

                                // Convert canvas to blob
                                const blob = await new Promise<Blob>((resolve) => {
                                  canvas.toBlob((blob) => {
                                    if (blob) resolve(blob)
                                  }, 'image/jpeg', 0.8)
                                })
                                
                                // Convert blob to base64
                                const base64 = await new Promise<string>((resolve) => {
                                  const reader = new FileReader()
                                  reader.onload = () => {
                                    const result = String(reader.result || "")
                                    const comma = result.indexOf(",")
                                    resolve(comma >= 0 ? result.slice(comma + 1) : result)
                                  }
                                  reader.readAsDataURL(blob)
                                })
                                
                                // Upload to Supabase Storage
                                const fileName = `certificate_${viewingCertificate.id}_${Date.now()}.jpg`
                                const { data: uploadData, error: uploadError } = await supabase.storage
                                  .from('sertifikat')
                                  .upload(fileName, blob, {
                                    contentType: 'image/jpeg',
                                    upsert: false
                                  })
                                
                                if (uploadError) {
                                  throw new Error('Failed to upload to storage: ' + uploadError.message)
                                }
                                
                                // Get public URL
                                const { data: publicUrlData } = supabase.storage
                                  .from('sertifikat')
                                  .getPublicUrl(fileName)
                                
                                const publicUrl = publicUrlData.publicUrl
                                
                                // Copy the public URL to clipboard
                                await navigator.clipboard.writeText(publicUrl)
                                
                                // Show success toast
                                showToast('Gambar sertifikat berhasil disimpan dan link disalin ke clipboard!', 'success')
                                
                              } catch (error) {
                                console.error('Copy failed:', error)
                                showToast('Gagal menyalin gambar: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error')
                              }
                            }}
                            className="p-1 rounded-md hover:bg-white/10 transition-colors"
                            title="Copy certificate image with text"
                          >
                            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(certificateData.title || certificateData.name) && (
                            <div>
                              <span className="text-white/70">Title:</span> {certificateData.title || certificateData.name}
                            </div>
                          )}
                          {certificateData.description && (
                            <div>
                              <span className="text-white/70">Description:</span> {certificateData.description}
                            </div>
                          )}
                          {certificateData.issued_at && (
                            <div>
                              <span className="text-white/70">Tanggal:</span> {certificateData.issued_at}
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <a 
                            href={`/admin/edit?id=${viewingCertificate.id}`}
                            className="inline-block rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm"
                          >
                            Edit Sertifikat
                          </a>
                          <button
                            onClick={async () => {
                              try {
                                // Get the preview container
                                const previewContainer = document.querySelector('[data-preview-container="modal"]') as HTMLElement
                                if (!previewContainer) {
                                  alert('Preview container not found')
                                  return
                                }

                                // Get the template image
                                const templateImg = document.querySelector('[data-preview-image]') as HTMLImageElement
                                if (!templateImg) {
                                  alert('Template image not found')
                                  return
                                }

                                // Wait for image to load
                                await new Promise((resolve) => {
                                  if (templateImg.complete) {
                                    resolve(true)
                                  } else {
                                    templateImg.onload = () => resolve(true)
                                  }
                                })

                                // Get container dimensions
                                const containerRect = previewContainer.getBoundingClientRect()
                                
                                // Calculate image dimensions and position within container
                                const imageRatio = templateImg.naturalWidth / templateImg.naturalHeight
                                const containerRatio = containerRect.width / containerRect.height
                                
                                let imageWidth, imageHeight, imageX, imageY
                                
                                if (containerRatio > imageRatio) {
                                  // Container is wider, image is constrained by height
                                  imageHeight = containerRect.height
                                  imageWidth = imageHeight * imageRatio
                                  imageX = (containerRect.width - imageWidth) / 2
                                  imageY = 0
                                } else {
                                  // Container is taller, image is constrained by width
                                  imageWidth = containerRect.width
                                  imageHeight = imageWidth / imageRatio
                                  imageX = 0
                                  imageY = (containerRect.height - imageHeight) / 2
                                }

                                // Create canvas with original image dimensions
                                const canvas = document.createElement('canvas')
                                const ctx = canvas.getContext('2d')
                                if (!ctx) return

                                canvas.width = templateImg.naturalWidth
                                canvas.height = templateImg.naturalHeight

                                // Draw the template image
                                ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height)

                                // Calculate scale factors for text positioning
                                const scaleX = canvas.width / imageWidth
                                const scaleY = canvas.height / imageHeight

                                // Helper function to draw text
                                const drawText = (text: string, x: number, y: number, size: number, color: string, align: string, font: string, bold = false) => {
                                  if (!text) return
                                  
                                  ctx.fillStyle = color
                                  ctx.font = `${bold ? 'bold ' : ''}${size * scaleX}px ${font}`
                                  ctx.textAlign = align as CanvasTextAlign
                                  ctx.textBaseline = 'top'
                                  
                                  // Convert preview coordinates to canvas coordinates
                                  const canvasX = (x - imageX) * scaleX
                                  const canvasY = (y - imageY) * scaleY
                                  
                                  ctx.fillText(text, canvasX, canvasY)
                                }

                                // Draw title
                                if (certificateData.title || certificateData.name) {
                                  drawText(
                                    certificateData.title || certificateData.name,
                                    certificateData.title_x || 370,
                                    certificateData.title_y || 180,
                                    certificateData.title_size || 32,
                                    certificateData.title_color || "#000000",
                                    certificateData.title_align || "center",
                                    certificateData.title_font || "Inter, ui-sans-serif, system-ui",
                                    true
                                  )
                                }

                                // Draw description
                                if (certificateData.description) {
                                  drawText(
                                    certificateData.description,
                                    certificateData.desc_x || 360,
                                    certificateData.desc_y || 235,
                                    certificateData.desc_size || 15,
                                    certificateData.desc_color || "#000000",
                                    certificateData.desc_align || "center",
                                    certificateData.desc_font || "Inter, ui-sans-serif, system-ui"
                                  )
                                }

                                // Draw date
                                if (certificateData.issued_at) {
                                  drawText(
                                    certificateData.issued_at,
                                    certificateData.date_x || 50,
                                    certificateData.date_y || 110,
                                    certificateData.date_size || 14,
                                    certificateData.date_color || "#000000",
                                    certificateData.title_align || "center",
                                    certificateData.date_font || "Inter, ui-sans-serif, system-ui"
                                  )
                                }

                                // Convert canvas to PDF
                                const imgData = canvas.toDataURL('image/png', 1.0)
                                
                                // Create PDF
                                const pdf = new jsPDF({
                                  orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
                                  unit: 'px',
                                  format: [canvas.width, canvas.height]
                                })

                                // Add image to PDF
                                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)

                                // Download PDF
                                pdf.save(`certificate_${viewingCertificate.id}.pdf`)

                               } catch (error) {
                                 console.error('Export failed:', error)
                                 showToast('Failed to export PDF: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error')
                               }
                            }}
                            className="inline-block rounded-md bg-green-600 hover:bg-green-500 px-4 py-2 text-sm"
                          >
                            Export PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-6 text-center">
                      <div className="text-yellow-300 font-medium mb-2">Sertifikat Belum Dibuat</div>
                      <p className="text-white/70 mb-4">
                        Sertifikat ini belum memiliki template atau konten yang diedit.
                      </p>
                      <a 
                        href={`/admin/edit?id=${viewingCertificate.id}`}
                        className="inline-block rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm"
                      >
                        Buat Sertifikat
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
                  <div className="text-white/70">Memuat data sertifikat...</div>
                </div>
              )}
            </div>
          </ModalContent>
        </>
      )}
       
       {/* Toast Container */}
       <ToastContainer />
    </main>
  )
}


