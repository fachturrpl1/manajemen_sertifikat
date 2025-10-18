"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useEffect, useMemo, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function AdminPage() {
  const params = useSearchParams()
  const certificateId = params.get("id") || undefined
  const [category, setCategory] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uiSaving, setUiSaving] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [previewSrc, setPreviewSrc] = useState<string>("")
  // Text/editor settings
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [issuedAt, setIssuedAt] = useState<string>("")

  // Per-element styles & positions
  const [activeElement, setActiveElement] = useState<"title" | "description" | "date">("title")
  const [titleX, setTitleX] = useState<number>(370)
  const [titleY, setTitleY] = useState<number>(180)
  const [titleSize, setTitleSize] = useState<number>(32)
  const [titleColor, setTitleColor] = useState<string>("#000")

  const [descX, setDescX] = useState<number>(360)
  const [descY, setDescY] = useState<number>(235)
  const [descSize, setDescSize] = useState<number>(15)
  const [descColor, setDescColor] = useState<string>("#000")

  const [dateX, setDateX] = useState<number>(50)
  const [dateY, setDateY] = useState<number>(110)
  const [dateSize, setDateSize] = useState<number>(14)
  const [dateColor, setDateColor] = useState<string>("#000")

  // Align & font per elemen
  const [titleAlign, setTitleAlign] = useState<"left" | "center" | "right">("center")
  const [descAlign, setDescAlign] = useState<"left" | "center" | "right">("center")
  const [titleFont, setTitleFont] = useState("Inter, ui-sans-serif, system-ui")
  const [descFont, setDescFont] = useState("Inter, ui-sans-serif, system-ui")
  const [dateFont, setDateFont] = useState("Inter, ui-sans-serif, system-ui")

  // Helper: queue save with debounce to Supabase
  function queueSave(update: Record<string, unknown>) {
    if (!certificateId) return
    setUiSaving(true)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await supabase.from("certificates").update(update).eq("id", certificateId)
      setUiSaving(false)
    }, 500)
  }

  // Opsi kategori (samakan dengan kategori pada sistem)
  const categoryOptions = useMemo(
    () => [
      { value: "kunjungan industri", label: "Kunjungan Industri" },
      { value: "magang", label: "Magang" },
      { value: "mou", label: "MoU" },
      { value: "pelatihan", label: "Pelatihan" },
    ],
    []
  )

  // Ambil kategori & template saat ini untuk record yang dipilih (minimize fields to avoid select errors)
  useEffect(() => {
    if (!certificateId) return
    ;(async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("category, template_path")
        .eq("id", certificateId)
        .single()
      if (!error && data) {
        const row = data as { category: string | null; template_path?: string | null }
        setCategory(row.category || "")
        if (row.template_path) {
          setSelectedTemplate(row.template_path)
          setPreviewSrc(`/${row.template_path}`)
        } else if (row.category) {
          const first = getTemplates(row.category)[0]
          if (first) {
            setSelectedTemplate(first)
            setPreviewSrc(`/${first}`)
            await supabase.from("certificates").update({ template_path: first }).eq("id", certificateId)
          }
        }
      }
    })()
  }, [certificateId])

  async function saveCategory(newVal: string) {
    if (!certificateId) {
      setMessage("Pilih data sertifikat terlebih dahulu")
      return
    }
    try {
      setSaving(true)
      setMessage("")
        const { error } = await supabase
          .from("certificates")
        .update({ category: newVal || null })
        .eq("id", certificateId)
      if (error) {
        setMessage("Gagal menyimpan kategori: " + error.message)
        return
      }
      setMessage("Kategori tersimpan")
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(""), 1500)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!certificateId) {
      setMessage("Pilih data sertifikat terlebih dahulu")
      return
    }
    try {
      setUploading(true)
      setMessage("")
      // Baca file sebagai base64 untuk disimpan di tabel
      const toBase64 = (f: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const res = String(reader.result || "")
          // data:[mime];base64,XXXX => ambil bagian base64 saja
          const comma = res.indexOf(",")
          resolve(comma >= 0 ? res.slice(comma + 1) : res)
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(f)
      })

      const base64 = await toBase64(file)
      const payload = {
        certificate_id: certificateId,
        filename: file.name,
        mimetype: file.type || null,
        size: file.size,
        data_base64: base64,
      }
      const { error } = await supabase.from("certificate_files").insert(payload)
      if (error) {
        setMessage("Gagal menyimpan file ke tabel: " + error.message)
        return
      }
      // Tampilkan pratinjau langsung (untuk gambar). Untuk PDF dapat ditangani dengan <object>
      if (file.type.startsWith("image/")) {
        setPreviewSrc(`data:${file.type};base64,${base64}`)
      } else {
        setPreviewSrc("")
      }
      setMessage("File berhasil disimpan ke tabel")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setMessage("Gagal memproses file: " + message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
        <AdminNavbar />
        <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <PreviewPanel
          category={category}
          previewSrc={previewSrc}
          title={title}
          description={description}
          titlePos={{ x: titleX, y: titleY, size: titleSize, color: titleColor }}
          descPos={{ x: descX, y: descY, size: descSize, color: descColor }}
          datePos={{ x: dateX, y: dateY, size: dateSize, color: dateColor }}
          titleAlign={titleAlign}
          descAlign={descAlign}
          titleFont={titleFont}
          descFont={descFont}
          dateFont={dateFont}
          issuedAt={issuedAt}
          active={activeElement}
          onDragPosition={(nx, ny) => {
            if (activeElement === "title") { setTitleX(nx); setTitleY(ny) }
            else if (activeElement === "description") { setDescX(nx); setDescY(ny) }
            else { setDateX(nx); setDateY(ny) }
          }}
          onCommitPosition={(nx, ny) => {
            if (activeElement === "title") {
              queueSave({ title_x: nx, title_y: ny })
            } else if (activeElement === "description") {
              queueSave({ desc_x: nx, desc_y: ny })
            }
          }}
        />
        <aside className="rounded-xl border border-white/10 bg-[#0d172b] p-5 space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Kategori Sertifikat</label>
            <select
              value={category}
              onChange={async (e) => {
                const val = e.target.value
                setCategory(val)
                await saveCategory(val)
              }}
              className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm text-white"
              disabled={saving}
            >
              <option value="">Pilih kategori</option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {message && (
              <div className="mt-2 text-xs text-white/70">{message}</div>
            )}
          </div>
          <TemplateChooser
            category={category}
            onChoose={async (path) => {
              setSelectedTemplate(path)
              setPreviewSrc(`/${path}`)
              if (certificateId) {
                await supabase.from("certificates").update({ template_path: path }).eq("id", certificateId)
              }
            }}
          />
          <div className="text-center text-white/70 mb-1">atau</div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Upload Certificate (PNG, JPG, PDF)</label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFileUpload}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
              disabled={uploading}
            />
            {uploading && (
              <div className="mt-2 text-xs text-white/70">Mengunggah...</div>
            )}
          </div>
          {/* Text controls */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            {/* Pilih elemen yang sedang diedit */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Edit Elemen</label>
              <div className="grid grid-cols-3 gap-2">
                <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='title'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('title')}>Title</button>
                <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='description'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('description')}>Deskripsi</button>
                <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='date'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('date')}>Tanggal</button>
              </div>
            </div>
            {activeElement === 'title' && (
            <div>
              <label className="block text-sm text-white/70 mb-1">Title</label>
              <input
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                value={title}
                onChange={async (e) => {
                  const v = e.target.value; setTitle(v)
                  if (certificateId) await supabase.from("certificates").update({ title: v }).eq("id", certificateId)
                }}
                placeholder="Judul sertifikat"
              />
            </div>
            )}
            {activeElement === 'description' && (
            <div>
              <label className="block text-sm text-white/70 mb-1">Description</label>
              <textarea
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                rows={3}
                value={description}
                onChange={async (e) => {
                  const v = e.target.value; setDescription(v)
                  if (certificateId) await supabase.from("certificates").update({ description: v }).eq("id", certificateId)
                }}
                placeholder="Deskripsi singkat"
              />
            </div>
            )}
            {activeElement === 'date' && (
              <div>
                <label className="block text-sm text-white/70 mb-1">Tanggal (terintegrasi)</label>
                <input type="date" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" value={issuedAt || ""}
                  onChange={async (e)=>{ const v=e.target.value; setIssuedAt(v); if (certificateId) await supabase.from("certificates").update({ issued_at: v || null }).eq("id", certificateId)}} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">Posisi X</label>
                <input type="number" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" value={activeElement==='title'?titleX:activeElement==='description'?descX:dateX}
                  onChange={(e) => { const n = Math.max(0, Number(e.target.value)||0); if(activeElement==='title'){ setTitleX(n); queueSave({ title_x: n }) } else if(activeElement==='description'){ setDescX(n); queueSave({ desc_x: n }) } else { setDateX(n) } }} />
            </div>
            <div>
                <label className="block text-sm text-white/70 mb-1">Posisi Y</label>
                <input type="number" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" value={activeElement==='title'?titleY:activeElement==='description'?descY:dateY}
                  onChange={(e) => { const n = Math.max(0, Number(e.target.value)||0); if(activeElement==='title'){ setTitleY(n); queueSave({ title_y: n }) } else if(activeElement==='description'){ setDescY(n); queueSave({ desc_y: n }) } else { setDateY(n) } }} />
              </div>
            </div>
            {/* Justify & Font per elemen */}
            {activeElement === 'title' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Justify (Title)</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={titleAlign}
                    onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setTitleAlign(v); queueSave({ title_align: v }) }}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Font (Title)</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={titleFont}
                    onChange={(e)=>{ const v=e.target.value; setTitleFont(v); queueSave({ title_font: v }) }}>
                    <option value="Inter, ui-sans-serif, system-ui">Inter</option>
                    <option value="Arial, Helvetica, sans-serif">Arial</option>
                    <option value="Times New Roman, Times, serif">Times New Roman</option>
                    <option value="Georgia, serif">Georgia</option>
                  </select>
                </div>
              </div>
            )}
            {activeElement === 'description' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                  <label className="block text-sm text-white/70 mb-1">Justify (Deskripsi)</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={descAlign}
                    onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setDescAlign(v); queueSave({ desc_align: v }) }}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
            </div>
            <div>
                  <label className="block text-sm text-white/70 mb-1">Font (Deskripsi)</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={descFont}
                    onChange={(e)=>{ const v=e.target.value; setDescFont(v); queueSave({ desc_font: v }) }}>
                    <option value="Inter, ui-sans-serif, system-ui">Inter</option>
                    <option value="Arial, Helvetica, sans-serif">Arial</option>
                    <option value="Times New Roman, Times, serif">Times New Roman</option>
                    <option value="Georgia, serif">Georgia</option>
                  </select>
                </div>
              </div>
            )}
            {activeElement === 'date' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Font (Tanggal)</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={dateFont}
                    onChange={(e)=>{ const v=e.target.value; setDateFont(v); queueSave({ date_font: v }) }}>
                  <option value="Inter, ui-sans-serif, system-ui">Inter</option>
                  <option value="Arial, Helvetica, sans-serif">Arial</option>
                  <option value="Times New Roman, Times, serif">Times New Roman</option>
                  <option value="Georgia, serif">Georgia</option>
                </select>
              </div>
            </div>
            )}
            <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-sm text-white/70 mb-1">Font Size</label>
                <input type="number" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" value={activeElement==='title'?titleSize:activeElement==='description'?descSize:dateSize}
                  onChange={(e)=>{ const n=Number(e.target.value)||12; if(activeElement==='title'){ setTitleSize(n); queueSave({ title_size: n }) } else if(activeElement==='description'){ setDescSize(n); queueSave({ desc_size: n }) } else { setDateSize(n) } }} />
            </div>
            <div>
                <label className="block text-sm text-white/70 mb-1">Warna</label>
                <input type="color" className="h-10 w-full rounded-md border border-white/10 bg-white/5 p-1" value={activeElement==='title'?titleColor:activeElement==='description'?descColor:dateColor}
                  onChange={(e)=>{ const v=e.target.value; if(activeElement==='title'){ setTitleColor(v); queueSave({ title_color: v }) } else if(activeElement==='description'){ setDescColor(v); queueSave({ desc_color: v }) } else { setDateColor(v) } }} />
              </div>
            </div>
            <div className="text-right text-xs text-white/50 h-4">{uiSaving ? "Menyimpan..." : "Tersimpan"}</div>
            <div className="flex justify-end gap-2">
              <button
                className="rounded-md border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm hover:bg-blue-500/20 disabled:opacity-50"
                onClick={async () => {
                  if (!certificateId) return
                  if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null }
                  setSavingAll(true)
                  const payload = {
                    title: title || null,
                    description: description || null,
                    issued_at: issuedAt || null,
                    title_align: titleAlign,
                    desc_align: descAlign,
                    title_font: titleFont,
                    desc_font: descFont,
                    date_font: dateFont,
                    title_x: titleX,
                    title_y: titleY,
                    title_size: titleSize,
                    title_color: titleColor,
                    desc_x: descX,
                    desc_y: descY,
                    desc_size: descSize,
                    desc_color: descColor,
                    date_x: dateX,
                    date_y: dateY,
                    date_size: dateSize,
                    date_color: dateColor,
                  }
                  const { error } = await supabase.from('certificates').update(payload).eq('id', certificateId)
                  if (error) {
                    setMessage('Gagal menyimpan: ' + error.message)
                  } else {
                    setMessage('Perubahan disimpan')
                    setTimeout(() => setMessage(''), 1500)
                  }
                  setSavingAll(false)
                }}
                disabled={!certificateId || savingAll || uiSaving}
              >
                {savingAll ? 'Menyimpan...' : 'Save'}
              </button>
              <button
                className="rounded-md border border-purple-500/40 bg-purple-500/10 px-3 py-2 text-sm hover:bg-purple-500/20 disabled:opacity-50"
                onClick={async () => {
                  if (!certificateId) return
                  const container = document.querySelector('[data-preview-container="1"]') as HTMLElement | null
                  if (!container) return
                  const rect = container.getBoundingClientRect()
                  const scale = 2
                  const cw = Math.max(1, Math.round(rect.width)) * scale
                  const ch = Math.max(1, Math.round(rect.height)) * scale
                  const canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')!
                  canvas.width = cw
                  canvas.height = ch
                  // background putih
                  ctx.fillStyle = '#ffffff'
                  ctx.fillRect(0,0,cw,ch)
                  // gambar template
                  if (previewSrc) {
                    const img = await new Promise<HTMLImageElement>((res, rej) => {
                      const i = new Image()
                      i.crossOrigin = 'anonymous'
                      i.onload = () => res(i)
                      i.onerror = rej
                      i.src = `/${previewSrc}`
                    })
                    const ratio = Math.min(cw / img.width, ch / img.height)
                    const w = img.width * ratio
                    const h = img.height * ratio
                    const ox = (cw - w) / 2
                    const oy = (ch - h) / 2
                    ctx.drawImage(img, ox, oy, w, h)
                  }
                  // helper
                  const toAlign = (a: string): CanvasTextAlign => (a as any) as CanvasTextAlign
                  const drawText = (text: string, x: number, y: number, size: number, color: string, align: string, font: string, bold=false) => {
                    ctx.fillStyle = color
                    ctx.textAlign = toAlign(align)
                    ctx.textBaseline = 'top'
                    ctx.font = `${bold?'700 ':''}${Math.round(size*scale)}px ${font}`
                    ctx.fillText(text, Math.round(x*scale), Math.round(y*scale))
                  }
                  // tulis teks
                  drawText(title || '', titleX, titleY, titleSize, titleColor, titleAlign, titleFont, true)
                  drawText(description || '', descX, descY, descSize, descColor, descAlign, descFont, false)
                  if (issuedAt) {
                    drawText(issuedAt, dateX, dateY, dateSize, dateColor, titleAlign, dateFont, false)
                  }
                  // ke PDF
                  const imgData = canvas.toDataURL('image/png', 1.0)
                  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
                  const pw = pdf.internal.pageSize.getWidth(); const ph = pdf.internal.pageSize.getHeight()
                  const r = Math.min(pw / cw, ph / ch); const rw=cw*r; const rh=ch*r; const x=(pw-rw)/2; const y=(ph-rh)/2
                  pdf.addImage(imgData, 'PNG', x, y, rw, rh)
                  const pdfBlob = pdf.output('blob')
                  // Unduh lokal
                  const dlUrl = URL.createObjectURL(pdfBlob)
                  const a = document.createElement('a')
                  a.href = dlUrl
                  a.download = `certificate_${certificateId}.pdf`
                  document.body.appendChild(a)
                  a.click()
                  a.remove()
                  URL.revokeObjectURL(dlUrl)
                  const ab = await pdfBlob.arrayBuffer()
                  const base64 = btoa(String.fromCharCode(...new Uint8Array(ab)))
                  const payload = {
                    certificate_id: certificateId,
                    filename: `certificate_${certificateId}.pdf`,
                    mimetype: 'application/pdf',
                    size: pdfBlob.size,
                    data_base64: base64,
                  }
                  const { error } = await supabase.from('certificate_files').insert(payload)
                  if (error) setMessage('Gagal menyimpan PDF: ' + error.message)
                  else { setMessage('PDF berhasil diunduh & disimpan'); setTimeout(()=>setMessage(''),1500) }
                }}
                disabled={!certificateId}
              >
                Export PDF (Canvas)
              </button>
            </div>
          </div>
        </aside>
        </main>
      </div>
    </ProtectedRoute>
  )
}

function PreviewPanel({ category, previewSrc, title, description, titlePos, descPos, datePos, titleAlign, descAlign, titleFont, descFont, dateFont, issuedAt, active, onDragPosition, onCommitPosition }: { category: string; previewSrc?: string; title?: string; description?: string; titlePos: { x: number; y: number; size: number; color: string }; descPos: { x: number; y: number; size: number; color: string }; datePos: { x: number; y: number; size: number; color: string }; titleAlign: "left"|"center"|"right"; descAlign: "left"|"center"|"right"; titleFont: string; descFont: string; dateFont: string; issuedAt?: string; active: "title"|"description"|"date"; onDragPosition?: (x: number, y: number) => void; onCommitPosition?: (x: number, y: number) => void }) {
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [imageRatio, setImageRatio] = useState<number | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setContainerSize({ width: el.clientWidth, height: el.clientHeight })
    update()
    let ro: ResizeObserver | undefined
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update)
      ro.observe(el)
    }
    window.addEventListener('resize', update)
    return () => {
      if (ro) ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  // Hitung rasio gambar yang dipilih (jika bukan PDF)
  useEffect(() => {
    if (!previewSrc || previewSrc.endsWith('.pdf')) { setImageRatio(null); return }
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) setImageRatio(img.naturalWidth / img.naturalHeight)
    }
    img.src = previewSrc
  }, [previewSrc])

  const margin = 20
  // Hitung area konten (gambar) di dalam container untuk clamp yang akurat
  const getContentRect = () => {
    if (!imageRatio || containerSize.width === 0 || containerSize.height === 0) {
      return { left: 0, top: 0, width: containerSize.width, height: containerSize.height }
    }
    const containerRatio = containerSize.width / containerSize.height
    if (containerRatio > imageRatio) {
      // dibatasi tinggi
      const height = containerSize.height
      const width = Math.round(height * imageRatio)
      const left = Math.round((containerSize.width - width) / 2)
      return { left, top: 0, width, height }
    } else {
      // dibatasi lebar
      const width = containerSize.width
      const height = Math.round(width / imageRatio)
      const top = Math.round((containerSize.height - height) / 2)
      return { left: 0, top, width, height }
    }
  }

  const clampX = (x: number) => {
    const rect = getContentRect()
    const min = rect.left + margin
    const max = rect.left + Math.max(0, rect.width - margin)
    return Math.max(min, Math.min(x, max))
  }
  const clampY = (y: number) => {
    const rect = getContentRect()
    const min = rect.top + margin
    const max = rect.top + Math.max(0, rect.height - margin)
    return Math.max(min, Math.min(y, max))
  }
  // Untuk saat ini, muat preview berbasis kategori dari /public/certificate
  // Anda bisa mengganti dengan komponen templating sebenarnya
  return (
    <section className="rounded-xl border border-white/10 bg-[#0d172b] p-6 shadow-xl shadow-blue-500/10 min-h-[420px]">
      <h2 className="text-3xl font-bold text-blue-400 mb-4">Pratinjau Sertifikat</h2>
      <div className="text-white/80 text-sm">{category ? `Kategori dipilih: ${category}` : "Belum ada kategori yang dipilih"}</div>
      <div
        className={`mt-4 h-[420px] rounded-lg border border-white/10 bg-white/5 relative overflow-hidden ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        ref={containerRef}
        style={{
          position: 'relative',
          contain: 'layout style paint',
          willChange: 'transform'
        }}
        data-preview-container="1"
        onMouseDown={(e) => {
          // Mulai drag hanya saat menekan pada overlay teks
          const overlay = (e.currentTarget as HTMLDivElement).querySelector('[data-overlay="text"]') as HTMLElement | null
          if (!overlay) return
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
          const base = active === 'title' ? titlePos : active === 'description' ? descPos : datePos
          const ox = base.x - Math.round(e.clientX - rect.left)
          const oy = base.y - Math.round(e.clientY - rect.top)
          setDragging(true)
          const onMove = (ev: MouseEvent) => {
            const nx = Math.round(ev.clientX - rect.left) + ox
            const ny = Math.round(ev.clientY - rect.top) + oy
            onDragPosition?.(clampX(nx), clampY(ny))
          }
          const onUp = (ev: MouseEvent) => {
            setDragging(false)
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
            const baseNow = active === 'title' ? titlePos : active === 'description' ? descPos : datePos
            const nx = clampX(baseNow.x)
            const ny = clampY(baseNow.y)
            onCommitPosition?.(nx, ny)
          }
          window.addEventListener('mousemove', onMove)
          window.addEventListener('mouseup', onUp)
        }}
        title="Klik tahan dan seret teks untuk memindahkan posisi"
      >
        {previewSrc ? (
          previewSrc.endsWith(".pdf") ? (
            <object data={previewSrc} type="application/pdf" className="w-full h-full" />
          ) : (
            <img src={previewSrc} alt="Preview" className="absolute inset-0 w-full h-full object-contain" />
          )
        ) : null}
        {/* Overlay text - title */}
        <div
          className="absolute"
          style={{ 
            left: `${clampX(titlePos.x)}px`, 
            top: `${clampY(titlePos.y)}px`, 
            width: "calc(100% - 40px)", 
            transform: titleAlign === "center" ? "translateX(-50%)" : titleAlign === "right" ? "translateX(-100%)" : undefined, 
            textAlign: titleAlign as "left"|"center"|"right", 
            fontFamily: titleFont, 
            fontSize: `${titlePos.size}px`, 
            color: titlePos.color,
            position: 'absolute',
            zIndex: 10,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
          data-overlay="text"
        >
          <div className="font-bold">{title}</div>
        </div>
        {/* Overlay text - description */}
        <div
          className="absolute"
          style={{ 
            left: `${clampX(descPos.x)}px`, 
            top: `${clampY(descPos.y)}px`, 
            width: "calc(100% - 40px)", 
            transform: descAlign === "center" ? "translateX(-50%)" : descAlign === "right" ? "translateX(-100%)" : undefined, 
            textAlign: descAlign as "left"|"center"|"right", 
            fontFamily: descFont, 
            fontSize: `${descPos.size}px`, 
            color: descPos.color,
            whiteSpace: 'pre-line',
            position: 'absolute',
            zIndex: 10,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <div className="opacity-90">{description}</div>
        </div>
        {/* Overlay text - date */}
        {issuedAt && (
          <div
            className="absolute"
            style={{ 
              left: `${clampX(datePos.x)}px`, 
              top: `${clampY(datePos.y)}px`, 
              width: "calc(100% - 40px)", 
              transform: titleAlign === "center" ? "translateX(-50%)" : titleAlign === "right" ? "translateX(-100%)" : undefined, 
              textAlign: titleAlign as "left"|"center"|"right", 
              fontFamily: dateFont, 
              fontSize: `${datePos.size}px`, 
              color: datePos.color,
              position: 'absolute',
              zIndex: 10,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <div className="mt-1 opacity-80">{issuedAt}</div>
          </div>
        )}
        {!previewSrc && (
          <div className="absolute inset-0 grid place-items-center text-white/60">Pilih template atau unggah file untuk pratinjau</div>
        )}
      </div>
    </section>
  )
}

// Peta template per kategori (public/certificate/<kategori>/...)
const TEMPLATE_MAP: Record<string, string[]> = {
  "kunjungan industri": [
    "certificate/kunjungan_industri/industri1.png",
    "certificate/kunjungan_industri/industri2.png",
  ],
  magang: [
    "certificate/magang/magang1.png",
  ],
  mou: [
    "certificate/mou/mou1.png",
  ],
  pelatihan: [
    "certificate/pelatihan/pelatihan1.png",
  ],
}

function getTemplates(category: string) {
  return category ? TEMPLATE_MAP[category] || [] : []
}

function TemplateChooser({ category, onChoose }: { category: string; onChoose?: (path: string, url: string) => void }) {
  // Render daftar template singkat; untuk saat ini placeholder.
  // Production: baca daftar template dari struktur /public/certificate/<kategori>/ atau tabel template.
  // Hardcode contoh mapping; tambahkan sesuai folder di public/certificate
  const list = getTemplates(category)
  return (
    <div>
      <label className="block text-sm text-white/70 mb-2">Pilih Template</label>
      {(!category || list.length === 0) ? (
        <div className="text-white/60 text-sm">Pilih kategori untuk melihat template</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {list.map((path) => {
            const url = `/${path}`
            return (
              <button
                key={path}
                onClick={onChoose ? () => onChoose(path, url) : undefined}
                className="rounded-md border border-white/10 bg-white/5 hover:bg-white/10 p-1"
                title={path}
              >
                <img src={url} alt={path} className="aspect-video object-cover rounded" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}


