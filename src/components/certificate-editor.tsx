"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function CertificateEditor() {
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
  const [titleColor, setTitleColor] = useState<string>("#000000")

  const [descX, setDescX] = useState<number>(360)
  const [descY, setDescY] = useState<number>(235)
  const [descSize, setDescSize] = useState<number>(15)
  const [descColor, setDescColor] = useState<string>("#000000")

  const [dateX, setDateX] = useState<number>(50)
  const [dateY, setDateY] = useState<number>(110)
  const [dateSize, setDateSize] = useState<number>(14)
  const [dateColor, setDateColor] = useState<string>("#000000")

  // Align & font per elemen
  const [titleAlign, setTitleAlign] = useState<"left" | "center" | "right">("center")
  const [descAlign, setDescAlign] = useState<"left" | "center" | "right">("center")
  const [dateAlign, setDateAlign] = useState<"left" | "center" | "right">("center")
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

  const categoryOptions = useMemo(
    () => [
      { value: "kunjungan_industri", label: "Kunjungan Industri" },
      { value: "magang", label: "Magang" },
      { value: "mou", label: "MoU" },
      { value: "pelatihan", label: "Pelatihan" },
    ],
    []
  )

  // Ambil data sertifikat lengkap
  useEffect(() => {
    if (!certificateId) return
    ;(async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("category, template_path, title, description, issued_at, name, title_x, title_y, title_size, title_color, title_align, title_font, desc_x, desc_y, desc_size, desc_color, desc_align, desc_font, date_x, date_y, date_size, date_color, date_font, date_align")
        .eq("id", certificateId)
        .single()
      if (!error && data) {
        const row = data as any
        setCategory(row.category || "")
        
        // Set title/name - prioritize 'name' field, fallback to 'title' field
        const certificateTitle = row.name || row.title || ""
        setTitle(certificateTitle)
        
        // Set other fields
        setDescription(row.description || "")
        setIssuedAt(row.issued_at || "")
        
        // Set positioning and styling with fallback values
        setTitleX(row.title_x ?? 370)
        setTitleY(row.title_y ?? 180)
        setTitleSize(row.title_size ?? 32)
        setTitleColor(row.title_color ?? "#000000")
        setTitleAlign(row.title_align ?? "center")
        setTitleFont(row.title_font ?? "Inter, ui-sans-serif, system-ui")
        
        setDescX(row.desc_x ?? 360)
        setDescY(row.desc_y ?? 235)
        setDescSize(row.desc_size ?? 15)
        setDescColor(row.desc_color ?? "#000000")
        setDescAlign(row.desc_align ?? "center")
        setDescFont(row.desc_font ?? "Inter, ui-sans-serif, system-ui")
        
        // Use saved values if available, otherwise use defaults
        setDateX(row.date_x ?? 50)
        setDateY(row.date_y ?? 110)
        setDateSize(row.date_size ?? 14)
        setDateColor(row.date_color ?? "#000000")
        setDateAlign(row.date_align ?? "center")
        setDateFont(row.date_font ?? "Inter, ui-sans-serif, system-ui")
        
        // Set template
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
        dateAlign={dateAlign}
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
              <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='title'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('title')}>Nama</button>
              <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='description'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('description')}>Deskripsi</button>
              <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='date'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('date')}>Tanggal</button>
            </div>
          </div>
          {activeElement === 'title' && (
            <div>
              <label className="block text-sm text-white/70 mb-1">Nama Peserta</label>
              <input
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                value={title}
                onChange={async (e) => {
                  const v = e.target.value; setTitle(v)
                  if (certificateId) {
                    // Update both title and name fields to ensure consistency
                    await supabase.from("certificates").update({ 
                      title: v,
                      name: v 
                    }).eq("id", certificateId)
                  }
                }}
                placeholder="Nama peserta"
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
                placeholder={getDescriptionPlaceholder(category)}
              />
            </div>
          )}
          {activeElement === 'date' && (
            <div>
              <label className="block text-sm text-white/70 mb-1">Tanggal Sertifikat</label>
              <div className="space-y-3">
                {/* Input tanggal */}
                <input 
                  type="date" 
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" 
                  value={issuedAt || ""}
                  onChange={async (e) => {
                    const v = e.target.value
                    
                    // Validasi tanggal
                    if (v) {
                      const selectedDate = new Date(v)
                      const today = new Date()
                      
                      // Cek apakah tanggal tidak lebih dari hari ini
                      if (selectedDate > today) {
                        alert('Tanggal tidak boleh lebih dari hari ini')
                        return
                      }
                      
                      // Cek apakah tanggal tidak terlalu lama (misal lebih dari 10 tahun)
                      const tenYearsAgo = new Date()
                      tenYearsAgo.setFullYear(today.getFullYear() - 10)
                      
                      if (selectedDate < tenYearsAgo) {
                        alert('Tanggal tidak boleh lebih dari 10 tahun yang lalu')
                        return
                      }
                    }
                    
                    setIssuedAt(v)
                    if (certificateId) {
                      try {
                        const { error } = await supabase.from("certificates").update({ issued_at: v || null }).eq("id", certificateId)
                        if (error) {
                          console.error('Error updating date:', error)
                          alert('Gagal menyimpan tanggal: ' + error.message)
                        }
                      } catch (err) {
                        console.error('Unexpected error:', err)
                        alert('Terjadi kesalahan saat menyimpan tanggal')
                      }
                    }
                  }}
                />
                
                {/* Status tanggal */}
                <div className="w-full rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-white/90 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {issuedAt ? new Date(issuedAt).toLocaleDateString('id-ID') : 'Belum diatur'}
                  </span>
                  <span className="text-xs text-blue-400/70 font-medium">
                    {issuedAt ? 'Manual' : 'Kosong'}
                  </span>
                </div>
                
                {/* Info */}
                <div className="text-xs text-white/60 bg-white/5 rounded px-2 py-1">
                  <span className="text-blue-400">ℹ</span> Tanggal akan ditampilkan pada sertifikat
                </div>
              </div>
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
          {activeElement === 'title' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">Justify (Nama)</label>
                <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={titleAlign}
                  onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setTitleAlign(v); queueSave({ title_align: v }) }}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Font (Nama)</label>
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
                <label className="block text-sm text-white/70 mb-1">Justify (Tanggal)</label>
                <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={dateAlign}
                  onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setDateAlign(v); queueSave({ date_align: v }) }}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
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
                  onChange={(e)=>{ const v=e.target.value; const hv=normalizeHex(v); if(activeElement==='title'){ setTitleColor(hv); queueSave({ title_color: hv }) } else if(activeElement==='description'){ setDescColor(hv); queueSave({ desc_color: hv }) } else { const hvd=normalizeHex(v); setDateColor(hvd) } }} />
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
                  date_align: dateAlign,
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
          </div>
        </div>
      </aside>
    </main>
  )
}

function PreviewPanel({ category, previewSrc, title, description, titlePos, descPos, datePos, titleAlign, descAlign, dateAlign, titleFont, descFont, dateFont, issuedAt, active, onDragPosition, onCommitPosition }: { category: string; previewSrc?: string; title?: string; description?: string; titlePos: { x: number; y: number; size: number; color: string }; descPos: { x: number; y: number; size: number; color: string }; datePos: { x: number; y: number; size: number; color: string }; titleAlign: "left"|"center"|"right"; descAlign: "left"|"center"|"right"; dateAlign: "left"|"center"|"right"; titleFont: string; descFont: string; dateFont: string; issuedAt?: string; active: "title"|"description"|"date"; onDragPosition?: (x: number, y: number) => void; onCommitPosition?: (x: number, y: number) => void }) {
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

  useEffect(() => {
    if (!previewSrc || previewSrc.endsWith('.pdf')) { setImageRatio(null); return }
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) setImageRatio(img.naturalWidth / img.naturalHeight)
    }
    img.src = previewSrc
  }, [previewSrc])

  const margin = 20
  const getContentRect = () => {
    if (!imageRatio || containerSize.width === 0 || containerSize.height === 0) {
      return { left: 0, top: 0, width: containerSize.width, height: containerSize.height }
    }
    const containerRatio = containerSize.width / containerSize.height
    if (containerRatio > imageRatio) {
      const height = containerSize.height
      const width = Math.round(height * imageRatio)
      const left = Math.round((containerSize.width - width) / 2)
      return { left, top: 0, width, height }
    } else {
      const width = containerSize.width
      const height = Math.round(width / imageRatio)
      const top = Math.round((containerSize.height - height) / 2)
      return { left: 0, top, width, height }
    }
  }

  const clampX = (x: number) => {
    // Return original position without clamping to match edit mode
    return x
  }
  const clampY = (y: number) => {
    // Return original position without clamping to match edit mode
    return y
  }
  return (
    <section className="rounded-xl border border-white/10 bg-[#0d172b] p-6 shadow-xl shadow-blue-500/10 min-h-[420px]">
      <h2 className="text-3xl font-bold text-blue-400 mb-4">Pratinjau Sertifikat</h2>
      <div className="text-white/80 text-sm">{category ? `Kategori dipilih: ${category}` : "Belum ada kategori yang dipilih"}</div>
      <div
        className={`mt-4 h-[420px] rounded-lg border border-white/10 bg-white/5 relative overflow-hidden ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        ref={containerRef}
        data-preview-container="1"
        onMouseDown={(e) => {
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
            <img src={previewSrc} alt="Preview" className="absolute inset-0 w-full h-full object-contain" data-preview-image />
          )
        ) : null}
        <div
          className="absolute"
          style={{ 
            left: `${clampX(titlePos.x)}px`, 
            top: `${clampY(titlePos.y)}px`, 
            width: "auto", 
            maxWidth: "calc(100% - 40px)",
            textAlign: titleAlign, 
            fontFamily: titleFont, 
            fontSize: `${titlePos.size}px`, 
            color: titlePos.color 
          }}
          data-overlay="text"
        >
          <div className="font-bold">{title}</div>
        </div>
        <div
          className="absolute"
          style={{ 
            left: `${clampX(descPos.x)}px`, 
            top: `${clampY(descPos.y)}px`, 
            width: "auto", 
            maxWidth: "calc(100% - 40px)",
            textAlign: descAlign, 
            fontFamily: descFont, 
            fontSize: `${descPos.size}px`, 
            color: descPos.color 
          }}
        >
          <div className="opacity-90">{description}</div>
        </div>
        {issuedAt && (
          <div
            className="absolute"
            style={{ 
              left: `${clampX(datePos.x)}px`, 
              top: `${clampY(datePos.y)}px`, 
              width: "auto", 
              maxWidth: "calc(100% - 40px)",
              textAlign: dateAlign, 
              fontFamily: dateFont, 
              fontSize: `${datePos.size}px`, 
              color: datePos.color 
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

const TEMPLATE_MAP: Record<string, string[]> = {
  kunjungan_industri: [
    "certificate/kunjungan_industri/industri1.png",
    "certificate/kunjungan_industri/industri2.png",
  ],
  magang: [
    "certificate/magang/magang1.png",
    "certificate/magang/magang2.png",
  ],
  mou: [
    "certificate/mou/mou1.png",
    "certificate/mou/mou2.png",
  ],
  pelatihan: [
    "certificate/pelatihan/pelatihan1.png",
    "certificate/pelatihan/pelatihan2.png",
  ],
}

function getTemplates(category: string) {
  return category ? TEMPLATE_MAP[category] || [] : []
}

function TemplateChooser({ category, onChoose }: { category: string; onChoose?: (path: string, url: string) => void }) {
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

function getDescriptionPlaceholder(category: string): string {
  const key = normalizeCategory(category)
  switch (key) {
    case "mou":
      return "Sebagai tanda telah terjalinnya kerja sama antara PT Universal Big Data dan pihak terkait dalam mendukung kegiatan yang bertujuan meningkatkan kolaborasi, pengembangan, serta implementasi teknologi informasi dan data secara berkelanjutan.";
    case "magang":
      return "Sebagai tanda telah menyelesaikan kegiatan Praktik Kerja Lapangan (Magang) di PT Universal Big Data, serta berkontribusi dalam pengembangan keterampilan dan pemahaman di bidang teknologi informasi dan analisis data.";
    case "pelatihan":
      return "Sebagai tanda telah mengikuti dan menyelesaikan kegiatan Pelatihan yang diselenggarakan oleh PT Universal Big Data, guna meningkatkan kompetensi, pengetahuan, serta keterampilan di bidang teknologi dan inovasi digital.";
    case "kunjungan_industri":
      return "Sebagai tanda telah mengikuti kegiatan Kunjungan Industri ke PT Universal Big Data, untuk menambah wawasan mengenai penerapan teknologi informasi dan manajemen data dalam dunia industri.";
    default:
      return "Deskripsi singkat";
  }
}

function normalizeCategory(raw: string): "mou"|"magang"|"pelatihan"|"kunjungan_industri"|"other" {
  const s = (raw || "").toLowerCase()
  if (s.includes("mou")) return "mou"
  if (s.includes("magang")) return "magang"
  if (s.includes("latih")) return "pelatihan"
  if (s.includes("kunjungan") || s.includes("industri")) return "kunjungan_industri"
  if (s === "mou" || s === "magang" || s === "pelatihan" || s === "kunjungan_industri") return s as any
  return "other"
}

function normalizeHex(input: string): string {
  const v = (input || '').trim()
  if (/^#([0-9a-fA-F]{6})$/.test(v)) return v
  // e.g. #000 -> #000000
  if (/^#([0-9a-fA-F]{3})$/.test(v)) {
    const s = v.slice(1)
    return '#' + s.split('').map((c) => c + c).join('')
  }
  // fallback to black
  return '#000000'
}


