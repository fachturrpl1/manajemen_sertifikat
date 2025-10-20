"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
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
  recipientOrg?: string
  issuer?: string
  issuedAt?: string
  expiresAt?: string
}

type ManageContentProps = {
  role?: "admin" | "team"
}

export function ManageContent({ role = "admin" }: ManageContentProps) {
  const router = useRouter()
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

  // Preview helpers (samakan dengan editor)
  const previewContainerRef = useRef<HTMLDivElement | null>(null)
  const previewImgRef = useRef<HTMLImageElement | null>(null)
  const [natW, setNatW] = useState<number>(0)
  const [natH, setNatH] = useState<number>(0)

  function getMetrics() {
    const cont = previewContainerRef.current
    if (!cont || !natW || !natH) return { offX: 0, offY: 0, dispW: 0, dispH: 0, scaleX: 1, scaleY: 1 }
    const cW = cont.clientWidth
    const cH = cont.clientHeight
    const ratioImg = natW / natH
    const ratioCont = cW / cH
    let dispW = cW, dispH = cH
    if (ratioCont > ratioImg) {
      dispH = cH
      dispW = Math.round(cH * ratioImg)
    } else {
      dispW = cW
      dispH = Math.round(cW / ratioImg)
    }
    const offX = Math.round((cW - dispW) / 2)
    const offY = Math.round((cH - dispH) / 2)
    return { offX, offY, dispW, dispH, scaleX: dispW / natW, scaleY: dispH / natH }
  }

  function imgToScreen(x: number, y: number) {
    const m = getMetrics()
    return { x: Math.round(m.offX + x * m.scaleX), y: Math.round(m.offY + y * m.scaleY) }
  }

  // PNG preview untuk modal (render seperti editor -> ke canvas ukuran natural)
  const [previewModalSrc, setPreviewModalSrc] = useState<string>("")
  async function generateModalPreview(row: any) {
    try {
      if (!row) { setPreviewModalSrc(""); return }
      // Pakai preview_image jika sudah tersedia agar 100% sama dengan cek/edit
      if (row.preview_image) {
        const url: string = String(row.preview_image)
        const v = (row.updated_at || row.modified_at || row.issued_at || row.id || Date.now()).toString().replace(/\s+/g,'-')
        setPreviewModalSrc(url + (url.includes('?') ? '&' : '?') + 'v=' + v)
        return
      }
      if (!row.template_path) { setPreviewModalSrc(""); return }
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const im = new Image(); im.crossOrigin = 'anonymous';
        im.onload = () => resolve(im); im.onerror = reject; im.src = `/${row.template_path}`
      })
      const W = img.naturalWidth || 1200
      const H = img.naturalHeight || 900
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = W; canvas.height = H
      ctx.drawImage(img, 0, 0, W, H)

      const drawText = async (text: string, x: number, y: number, size: number, color: string, align: string, font: string, bold = false, maxWidth?: number, forceLeftAnchor = false) => {
        if (!text) return
        ctx.fillStyle = color || '#000'
        const weight = bold ? '700' : '400'
        const baseFamily = (font || '').split(',')[0]?.replace(/['"]/g, '').trim() || 'Inter'
        try {
          // Muat font utama agar metrik sama seperti editor/cek
          await (document as any).fonts?.load?.(`${weight} ${size}px '${baseFamily}'`)
          const ready: any = (document as any).fonts?.ready
          if (ready && typeof ready.then === 'function') { await ready }
        } catch {}
        // Pakai baseFamily dikutip + fallback persis seperti editor
        ctx.font = `${weight} ${size}px '${baseFamily}', ui-sans-serif, system-ui`
        ctx.textBaseline = 'top'
        const singleLine = !maxWidth
        const blockWidth = maxWidth ?? Math.max(0, W - x - 20)
        let anchorX = x
        if (forceLeftAnchor) {
          ctx.textAlign = 'left'
        } else if (align === 'center') {
          ctx.textAlign = 'center'
          anchorX = Math.round(x + blockWidth / 2)
        } else if (align === 'right') {
          ctx.textAlign = 'right'
          anchorX = Math.round(x + blockWidth)
        } else {
          ctx.textAlign = 'left'
        }

        const dx = anchorX
        const dy = y
        if (!singleLine) {
          const words = String(text).split(/\s+/)
          let line = ''
          let yy = dy
          for (let i = 0; i < words.length; i++) {
            const test = line ? line + ' ' + words[i] : words[i]
            const w = ctx.measureText(test).width
            if (w > blockWidth && i > 0) {
              ctx.fillText(line, dx, yy)
              yy += Math.round(size * 1.4)
              line = words[i]
            } else {
              line = test
            }
          }
          if (line) ctx.fillText(line, dx, yy)
        } else {
          ctx.fillText(text, dx, dy)
        }
      }

      // Title / Name
      await drawText(row.title || row.name || '', row.title_x ?? 370, row.title_y ?? 180, row.title_size ?? 32, row.title_color || '#000000', row.title_align || 'center', row.title_font || 'Inter, ui-sans-serif, system-ui', true, undefined, true)
      // Description
      await drawText(row.description || '', row.desc_x ?? 360, row.desc_y ?? 235, row.desc_size ?? 15, row.desc_color || '#000000', row.desc_align || 'center', row.desc_font || 'Inter, ui-sans-serif, system-ui', false, Math.max(0, W - (row.desc_x ?? 360) - 40))
      // Date
      if (row.issued_at) {
        const text = new Date(row.issued_at).toLocaleDateString('id-ID')
        await drawText(text, row.date_x ?? 50, row.date_y ?? 110, row.date_size ?? 14, row.date_color || '#000000', row.date_align || 'center', row.date_font || 'Inter, ui-sans-serif, system-ui')
      }
      // Number
      if (row.number) {
        await drawText(row.number, row.number_x ?? 370, row.number_y ?? 300, row.number_size ?? 14, row.number_color || '#000000', row.number_align || 'center', row.number_font || 'Inter, ui-sans-serif, system-ui')
      }
      // Expired
      if (row.expires_at) {
        const text = new Date(row.expires_at).toLocaleDateString('id-ID')
        await drawText(text, row.expires_x ?? 370, row.expires_y ?? 360, row.expires_size ?? 12, row.expires_color || '#000000', row.expires_align || 'center', row.expires_font || 'Inter, ui-sans-serif, system-ui')
      }

      setPreviewModalSrc(canvas.toDataURL('image/png', 1.0))
    } catch (e) {
      console.error('generateModalPreview failed:', e)
      setPreviewModalSrc("")
    }
  }

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
        recipientOrg: r.recipient_org as string | undefined,
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
            .select("id,name,number,category,recipient_org,issuer,issued_at,expires_at")
          if (error) {
            console.error("Supabase certificates fetch error:", error)
            return
          }
          const mapped: CertificateRow[] = (data ?? []).map((r: any) => ({
            id: r.id,
            name: r.name,
            number: r.number,
            category: r.category,
            recipientOrg: r.recipient_org,
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
      [r.name, r.number, r.category, r.recipientOrg, r.issuer]
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
        recipientOrg: (r["INSTANSI PENERIMA"] ?? r["RECIPIENT ORGANIZATION"]) as string,
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
          recipient_org: m.recipientOrg ?? null,
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
          .select("id,name,number,category,recipient_org,issuer,issued_at,expires_at")
        const mappedDb: CertificateRow[] = (data ?? []).map((r: Record<string, unknown>) => ({
          id: r.id as string | undefined,
          name: r.name as string | undefined,
          number: r.number as string | undefined,
          category: r.category as string | undefined,
          recipientOrg: r.recipient_org as string | undefined,
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
              recipientOrg: "",
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
                {/* <th className="px-4 py-3 font-medium">INSTANSI PENERIMA</th> */}
                {/* <th className="px-4 py-3 font-medium">PENERBIT</th> */}
                <th className="px-4 py-3 font-medium">TANGGAL TERBIT</th>
                <th className="px-4 py-3 font-medium">TANGGAL KADALUARSA</th>
                <th className="px-4 py-3 font-medium">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-white/50">
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-white/50">
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
                      {/* <td className="px-4 py-2">{r.recipientOrg}</td> */}
                      {/* <td className="px-4 py-2">{r.issuer}</td> */}
                      <td className="px-4 py-2">{r.issuedAt}</td>
                      <td className="px-4 py-2">{r.expiresAt}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2 text-xs">
                              <button 
                                aria-label="View" 
                                title="View" 
                                className="rounded-md border border-white/10 bg-white/5 px-2 py-1 hover:bg-white/10"
                                onClick={async () => {
                                  if (!r.id) return
                                  setViewingCertificate(r)
                                  setShowViewModal(true)
                                  // Fetch full certificate row for preview
                                  const { data, error } = await supabase
                                    .from("certificates")
                                    .select("*")
                                    .eq("id", r.id)
                                    .single()
                                  if (!error) {
                                    setCertificateData(data)
                                    await generateModalPreview(data)
                                  } else {
                                    console.error('Load certificate failed:', error)
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4 text-white" />
                              </button>
                              <button
                                aria-label="Edit"
                                title="Edit"
                                className="rounded-md border border-white/10 bg-white/5 px-2 py-1"
                                onClick={() => {
                                  if (!r.id) return
                                  const target = role === 'team' ? '/team/edit' : '/admin/edit'
                                  router.push(`${target}?id=${r.id}`)
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
                  <div className="mb-2 text-white/70">Instansi Penerima</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.recipientOrg ?? ""} onChange={(e) => setDraft({ ...draft, recipientOrg: e.target.value })} />
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
                            recipient_org: row.recipientOrg ?? null,
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
                            recipient_org: row.recipientOrg ?? null,
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
                  <div className="mb-1 text-white/70">Instansi Penerima</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.recipientOrg ?? ""} onChange={(e) => setDraft({ ...draft, recipientOrg: e.target.value })} />
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
                            recipient_org: draft.recipientOrg ?? null,
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
                  {(certificateData.title || certificateData.name) || certificateData.template_path || certificateData.issued_at ? (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <h3 className="mb-3 font-medium">Preview</h3>
                        <div className="relative bg-white rounded-lg overflow-hidden flex items-center justify-center" style={{
                          maxHeight: '360px',
                          maxWidth: '600px'
                        }}>
                          {previewModalSrc ? (
                            <img src={previewModalSrc} alt="Certificate Preview" className="w-full h-auto max-h-[360px] object-contain" />
                          ) : (
                            <div className="text-white/60 text-sm">Generating preview...</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-6 text-center">
                      <div className="text-yellow-300 font-medium mb-2">Sertifikat Belum Dibuat</div>
                      <p className="text-white/70 mb-4">Sertifikat ini belum memiliki template atau konten yang diedit.</p>
                      <a href={`/admin/edit?id=${viewingCertificate.id}`} className="inline-block rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm">Buat Sertifikat</a>
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


