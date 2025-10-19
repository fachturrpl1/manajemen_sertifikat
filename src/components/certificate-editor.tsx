"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getTemplateConfig, TemplateConfig } from "@/lib/template-configs"
import { PreviewPanel } from "@/components/preview-panel"

export default function CertificateEditor() {
  const params = useSearchParams()
  const certificateId = params.get("id") || undefined
  const isNew = params.get("new") === "1"
  const [category, setCategory] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uiSaving, setUiSaving] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [previewSrc, setPreviewSrc] = useState<string>("")
  const [currentTemplateConfig, setCurrentTemplateConfig] = useState<TemplateConfig | null>(null)
  const [applyingTemplate, setApplyingTemplate] = useState(false)
  const [newCertificateId, setNewCertificateId] = useState<string | null>(null)
  
  // Undo/Redo state management
  const [history, setHistory] = useState<Array<{
    title: string
    description: string
    issuedAt: string
    expiresAt: string
    certificateNumber: string
    titleX: number
    titleY: number
    titleSize: number
    titleColor: string
    titleAlign: "left" | "center" | "right"
    titleFont: string
    descX: number
    descY: number
    descSize: number
    descColor: string
    descAlign: "left" | "center" | "right"
    descFont: string
    dateX: number
    dateY: number
    dateSize: number
    dateColor: string
    dateAlign: "left" | "center" | "right"
    dateFont: string
    expiredX: number
    expiredY: number
    expiredSize: number
    expiredColor: string
    expiredAlign: "left" | "center" | "right"
    expiredFont: string
    certNumberX: number
    certNumberY: number
    certNumberSize: number
    certNumberColor: string
    certNumberAlign: "left" | "center" | "right"
    certNumberFont: string
  }>>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  // Text/editor settings
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [issuedAt, setIssuedAt] = useState<string>("")
  const [expiresAt, setExpiresAt] = useState<string>("")
  const [certificateNumber, setCertificateNumber] = useState<string>("")

  // Per-element styles & positions
  const [activeElement, setActiveElement] = useState<"title" | "description" | "date" | "expired_date" | "certificate_number">("title")
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

  const [expiredX, setExpiredX] = useState<number>(50)
  const [expiredY, setExpiredY] = useState<number>(130)
  const [expiredSize, setExpiredSize] = useState<number>(14)
  const [expiredColor, setExpiredColor] = useState<string>("#000000")

  const [certNumberX, setCertNumberX] = useState<number>(50)
  const [certNumberY, setCertNumberY] = useState<number>(150)
  const [certNumberSize, setCertNumberSize] = useState<number>(14)
  const [certNumberColor, setCertNumberColor] = useState<string>("#000000")

  // Align & font per elemen
  const [titleAlign, setTitleAlign] = useState<"left" | "center" | "right">("center")
  const [descAlign, setDescAlign] = useState<"left" | "center" | "right">("center")
  const [dateAlign, setDateAlign] = useState<"left" | "center" | "right">("center")
  const [expiredAlign, setExpiredAlign] = useState<"left" | "center" | "right">("center")
  const [certNumberAlign, setCertNumberAlign] = useState<"left" | "center" | "right">("center")
  const [titleFont, setTitleFont] = useState("Inter, ui-sans-serif, system-ui")
  const [descFont, setDescFont] = useState("Inter, ui-sans-serif, system-ui")
  const [dateFont, setDateFont] = useState("Inter, ui-sans-serif, system-ui")
  const [expiredFont, setExpiredFont] = useState("Inter, ui-sans-serif, system-ui")
  const [certNumberFont, setCertNumberFont] = useState("Inter, ui-sans-serif, system-ui")

  // Fungsi untuk menyimpan state ke history
  const saveToHistory = () => {
    const currentState = {
      title,
      description,
      issuedAt,
      expiresAt,
      certificateNumber,
      titleX,
      titleY,
      titleSize,
      titleColor,
      titleAlign,
      titleFont,
      descX,
      descY,
      descSize,
      descColor,
      descAlign,
      descFont,
      dateX,
      dateY,
      dateSize,
      dateColor,
      dateAlign,
      dateFont,
      expiredX,
      expiredY,
      expiredSize,
      expiredColor,
      expiredAlign,
      expiredFont,
      certNumberX,
      certNumberY,
      certNumberSize,
      certNumberColor,
      certNumberAlign,
      certNumberFont
    }

    // Hapus semua state setelah index saat ini (jika ada)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(currentState)
    
    // Batasi history maksimal 50 state
    if (newHistory.length > 50) {
      newHistory.shift()
    } else {
      setHistoryIndex(prev => prev + 1)
    }
    
    setHistory(newHistory)
    setCanUndo(newHistory.length > 1)
    setCanRedo(false)
  }

  // Fungsi untuk undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const state = history[newIndex]
      
      setTitle(state.title)
      setDescription(state.description)
      setIssuedAt(state.issuedAt)
      setExpiresAt(state.expiresAt)
      setCertificateNumber(state.certificateNumber)
      setTitleX(state.titleX)
      setTitleY(state.titleY)
      setTitleSize(state.titleSize)
      setTitleColor(state.titleColor)
      setTitleAlign(state.titleAlign)
      setTitleFont(state.titleFont)
      setDescX(state.descX)
      setDescY(state.descY)
      setDescSize(state.descSize)
      setDescColor(state.descColor)
      setDescAlign(state.descAlign)
      setDescFont(state.descFont)
      setDateX(state.dateX)
      setDateY(state.dateY)
      setDateSize(state.dateSize)
      setDateColor(state.dateColor)
      setDateAlign(state.dateAlign)
      setDateFont(state.dateFont)
      setExpiredX(state.expiredX)
      setExpiredY(state.expiredY)
      setExpiredSize(state.expiredSize)
      setExpiredColor(state.expiredColor)
      setExpiredAlign(state.expiredAlign)
      setExpiredFont(state.expiredFont)
      setCertNumberX(state.certNumberX)
      setCertNumberY(state.certNumberY)
      setCertNumberSize(state.certNumberSize)
      setCertNumberColor(state.certNumberColor)
      setCertNumberAlign(state.certNumberAlign)
      setCertNumberFont(state.certNumberFont)
      
      setHistoryIndex(newIndex)
      setCanUndo(newIndex > 0)
      setCanRedo(true)
    }
  }, [historyIndex, history])

  // Fungsi untuk redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const state = history[newIndex]
      
      setTitle(state.title)
      setDescription(state.description)
      setIssuedAt(state.issuedAt)
      setExpiresAt(state.expiresAt)
      setCertificateNumber(state.certificateNumber)
      setTitleX(state.titleX)
      setTitleY(state.titleY)
      setTitleSize(state.titleSize)
      setTitleColor(state.titleColor)
      setTitleAlign(state.titleAlign)
      setTitleFont(state.titleFont)
      setDescX(state.descX)
      setDescY(state.descY)
      setDescSize(state.descSize)
      setDescColor(state.descColor)
      setDescAlign(state.descAlign)
      setDescFont(state.descFont)
      setDateX(state.dateX)
      setDateY(state.dateY)
      setDateSize(state.dateSize)
      setDateColor(state.dateColor)
      setDateAlign(state.dateAlign)
      setDateFont(state.dateFont)
      setExpiredX(state.expiredX)
      setExpiredY(state.expiredY)
      setExpiredSize(state.expiredSize)
      setExpiredColor(state.expiredColor)
      setExpiredAlign(state.expiredAlign)
      setExpiredFont(state.expiredFont)
      setCertNumberX(state.certNumberX)
      setCertNumberY(state.certNumberY)
      setCertNumberSize(state.certNumberSize)
      setCertNumberColor(state.certNumberColor)
      setCertNumberAlign(state.certNumberAlign)
      setCertNumberFont(state.certNumberFont)
      
      setHistoryIndex(newIndex)
      setCanUndo(true)
      setCanRedo(newIndex < history.length - 1)
    }
  }, [historyIndex, history])

  // Fungsi untuk apply template configuration
  const applyTemplate = async (templateName: string) => {
    const currentId = certificateId || newCertificateId
    if (!currentId) return
    
    setApplyingTemplate(true)
    try {
      // Get template path based on category and template name
      const templatePath = `certificate/${templateName}/${templateName}1.png`
      const config = getTemplateConfig(templatePath)
      if (!config) {
        setMessage("Template configuration not found")
        return
      }
      
      setCurrentTemplateConfig(config)
      
      // Apply template settings from defaultPositions
      const { title, description, date } = config.defaultPositions
      
      setTitleX(title.x)
      setTitleY(title.y)
      setTitleSize(title.size)
      setTitleColor(title.color)
      setTitleAlign(title.align)
      setTitleFont(title.font)
      
      setDescX(description.x)
      setDescY(description.y)
      setDescSize(description.size)
      setDescColor(description.color)
      setDescAlign(description.align)
      setDescFont(description.font)
      
      setDateX(date.x)
      setDateY(date.y)
      setDateSize(date.size)
      setDateColor(date.color)
      setDateAlign(date.align)
      setDateFont(date.font)
      
      // Set default values for expired date and certificate number
      setExpiredX(50)
      setExpiredY(130)
      setExpiredSize(14)
      setExpiredColor("#000000")
      setExpiredAlign("center")
      setExpiredFont("Inter, ui-sans-serif, system-ui")
      
      setCertNumberX(50)
      setCertNumberY(150)
      setCertNumberSize(14)
      setCertNumberColor("#000000")
      setCertNumberAlign("center")
      setCertNumberFont("Inter, ui-sans-serif, system-ui")
      
      // Save to database
      const { error } = await supabase
        .from("certificates")
        .update({
          title_x: title.x,
          title_y: title.y,
          title_size: title.size,
          title_color: title.color,
          title_align: title.align,
          title_font: title.font,
          desc_x: description.x,
          desc_y: description.y,
          desc_size: description.size,
          desc_color: description.color,
          desc_align: description.align,
          desc_font: description.font,
          date_x: date.x,
          date_y: date.y,
          date_size: date.size,
          date_color: date.color,
          date_align: date.align,
          date_font: date.font,
          expired_x: 50,
          expired_y: 130,
          expired_size: 14,
          expired_color: "#000000",
          expired_align: "center",
          expired_font: "Inter, ui-sans-serif, system-ui",
          cert_number_x: 50,
          cert_number_y: 150,
          cert_number_size: 14,
          cert_number_color: "#000000",
          cert_number_align: "center",
          cert_number_font: "Inter, ui-sans-serif, system-ui"
        })
        .eq("id", currentId)
      
      if (error) {
        console.error("Error applying template:", error)
        setMessage("Failed to apply template: " + error.message)
      } else {
        setMessage("Template applied successfully!")
        saveToHistory()
      }
    } catch (error) {
      console.error("Error applying template:", error)
      setMessage("Failed to apply template")
    } finally {
      setApplyingTemplate(false)
    }
  }

  // Helper: queue save with debounce to Supabase
  function queueSave(update: Record<string, unknown>) {
    const currentId = certificateId || newCertificateId
    if (!currentId) return
    setUiSaving(true)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await supabase.from("certificates").update(update).eq("id", currentId)
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

  // Keyboard shortcuts untuk undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        if (canRedo) redo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, undo, redo])

  // Inisialisasi history saat data dimuat
  useEffect(() => {
    if (title || description || issuedAt) {
      const initialState = {
        title,
        description,
        issuedAt,
        expiresAt,
        certificateNumber,
        titleX,
        titleY,
        titleSize,
        titleColor,
        titleAlign,
        titleFont,
        descX,
        descY,
        descSize,
        descColor,
        descAlign,
        descFont,
        dateX,
        dateY,
        dateSize,
        dateColor,
        dateAlign,
        dateFont,
        expiredX,
        expiredY,
        expiredSize,
        expiredColor,
        expiredAlign,
        expiredFont,
        certNumberX,
        certNumberY,
        certNumberSize,
        certNumberColor,
        certNumberAlign,
        certNumberFont
      }
      
      if (history.length === 0) {
        setHistory([initialState])
        setHistoryIndex(0)
        setCanUndo(false)
        setCanRedo(false)
      }
    }
  }, [title, description, issuedAt, expiresAt, certificateNumber])

  // Ambil data sertifikat lengkap atau buat baru
  useEffect(() => {
    if (!certificateId && !isNew) return
    ;(async () => {
      if (isNew) {
        // Create new certificate
        setMessage("Creating new certificate...")
        
        // Generate unique certificate number
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
        const uniqueNumber = `CERT-${timestamp}-${randomSuffix}`
        
        const { data: newCert, error: createError } = await supabase
          .from("certificates")
          .insert({
            name: "",
            title: "",
            description: "",
            category: "",
            number: uniqueNumber,
            issued_at: null,
            expires_at: null,
            issuer: ""
          })
          .select("id")
          .single()
          
        if (createError) {
          console.error("Error creating certificate:", createError)
          setMessage("Failed to create certificate: " + createError.message)
          return
        }
        
        if (newCert) {
          setNewCertificateId(newCert.id)
          setMessage("New certificate created. Fill in the details below.")
          // Set default values for new certificate
          setCategory("")
          setTitle("")
          setDescription("")
          setIssuedAt("")
          setExpiresAt("")
          setCertificateNumber(uniqueNumber)
          // Set default positioning and styling
          setTitleX(370)
          setTitleY(180)
          setTitleSize(32)
          setTitleColor("#000000")
          setTitleAlign("center")
          setTitleFont("Inter, ui-sans-serif, system-ui")
          setDescX(360)
          setDescY(235)
          setDescSize(15)
          setDescColor("#000000")
          setDescAlign("center")
          setDescFont("Inter, ui-sans-serif, system-ui")
          setDateX(50)
          setDateY(110)
          setDateSize(14)
          setDateColor("#000000")
          setDateAlign("center")
          setDateFont("Inter, ui-sans-serif, system-ui")
          setExpiredX(50)
          setExpiredY(130)
          setExpiredSize(14)
          setExpiredColor("#000000")
          setExpiredAlign("center")
          setExpiredFont("Inter, ui-sans-serif, system-ui")
          setCertNumberX(50)
          setCertNumberY(150)
          setCertNumberSize(14)
          setCertNumberColor("#000000")
          setCertNumberAlign("center")
          setCertNumberFont("Inter, ui-sans-serif, system-ui")
          return
        }
      }
      
      // Load existing certificate
      const { data, error } = await supabase
        .from("certificates")
        .select("category, template_path, title, description, issued_at, expires_at, number, name, title_x, title_y, title_size, title_color, title_align, title_font, desc_x, desc_y, desc_size, desc_color, desc_align, desc_font, date_x, date_y, date_size, date_color, date_font, date_align, expired_x, expired_y, expired_size, expired_color, expired_align, expired_font, cert_number_x, cert_number_y, cert_number_size, cert_number_color, cert_number_align, cert_number_font")
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
        setExpiresAt(row.expires_at || "")
        setCertificateNumber(row.number || "")
        
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
        
        setExpiredX(row.expired_x ?? 50)
        setExpiredY(row.expired_y ?? 130)
        setExpiredSize(row.expired_size ?? 14)
        setExpiredColor(row.expired_color ?? "#000000")
        setExpiredAlign(row.expired_align ?? "center")
        setExpiredFont(row.expired_font ?? "Inter, ui-sans-serif, system-ui")
        
        setCertNumberX(row.cert_number_x ?? 50)
        setCertNumberY(row.cert_number_y ?? 150)
        setCertNumberSize(row.cert_number_size ?? 14)
        setCertNumberColor(row.cert_number_color ?? "#000000")
        setCertNumberAlign(row.cert_number_align ?? "center")
        setCertNumberFont(row.cert_number_font ?? "Inter, ui-sans-serif, system-ui")
        
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
  }, [certificateId, isNew])

  async function saveCategory(newVal: string) {
    const currentId = certificateId || newCertificateId
    if (!currentId) {
      setMessage("Pilih data sertifikat terlebih dahulu")
      return
    }
    try {
      setSaving(true)
      setMessage("")
      const { error } = await supabase
        .from("certificates")
        .update({ category: newVal || null })
        .eq("id", currentId)
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
        expiredPos={{ x: expiredX, y: expiredY, size: expiredSize, color: expiredColor }}
        certNumberPos={{ x: certNumberX, y: certNumberY, size: certNumberSize, color: certNumberColor }}
        titleAlign={titleAlign}
        descAlign={descAlign}
        dateAlign={dateAlign}
        expiredAlign={expiredAlign}
        certNumberAlign={certNumberAlign}
        titleFont={titleFont}
        descFont={descFont}
        dateFont={dateFont}
        expiredFont={expiredFont}
        certNumberFont={certNumberFont}
        issuedAt={issuedAt}
        expiresAt={expiresAt}
        certificateNumber={certificateNumber}
        active={activeElement}
        onDragPosition={(nx, ny) => {
          if (activeElement === "title") { setTitleX(nx); setTitleY(ny) }
          else if (activeElement === "description") { setDescX(nx); setDescY(ny) }
          else if (activeElement === "date") { setDateX(nx); setDateY(ny) }
          else if (activeElement === "expired_date") { setExpiredX(nx); setExpiredY(ny) }
          else if (activeElement === "certificate_number") { setCertNumberX(nx); setCertNumberY(ny) }
        }}
        onCommitPosition={(nx, ny) => {
          const x = Math.round(nx)
          const y = Math.round(ny)
          if (activeElement === "title") {
            queueSave({ title_x: x, title_y: y })
          } else if (activeElement === "description") {
            queueSave({ desc_x: x, desc_y: y })
          } else if (activeElement === "date") {
            queueSave({ date_x: x, date_y: y })
          } else if (activeElement === "expired_date") {
            queueSave({ expired_x: x, expired_y: y })
          } else if (activeElement === "certificate_number") {
            queueSave({ cert_number_x: x, cert_number_y: y })
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
        
        {/* Template Configuration */}
        <div>
          <label className="block text-sm text-white/70 mb-2">Template Configuration</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => applyTemplate("kunjungan_industri")}
              disabled={applyingTemplate}
              className="rounded-md border border-white/10 px-3 py-2 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50"
            >
              {applyingTemplate ? "Applying..." : "Kunjungan Industri"}
            </button>
            <button
              onClick={() => applyTemplate("magang")}
              disabled={applyingTemplate}
              className="rounded-md border border-white/10 px-3 py-2 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50"
            >
              {applyingTemplate ? "Applying..." : "Magang"}
            </button>
            <button
              onClick={() => applyTemplate("mou")}
              disabled={applyingTemplate}
              className="rounded-md border border-white/10 px-3 py-2 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50"
            >
              {applyingTemplate ? "Applying..." : "MOU"}
            </button>
            <button
              onClick={() => applyTemplate("pelatihan")}
              disabled={applyingTemplate}
              className="rounded-md border border-white/10 px-3 py-2 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50"
            >
              {applyingTemplate ? "Applying..." : "Pelatihan"}
            </button>
          </div>
        </div>
        
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
          {/* Undo/Redo controls */}
          <div>
            <label className="block text-sm text-white/70 mb-1">History</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                className={`rounded-md border border-white/10 px-3 py-2 text-sm ${canUndo ? 'bg-white/15 hover:bg-white/20' : 'bg-white/5 opacity-50 cursor-not-allowed'}`}
                onClick={undo}
                disabled={!canUndo}
              >
                ↶ Undo (Ctrl+Z)
              </button>
              <button 
                className={`rounded-md border border-white/10 px-3 py-2 text-sm ${canRedo ? 'bg-white/15 hover:bg-white/20' : 'bg-white/5 opacity-50 cursor-not-allowed'}`}
                onClick={redo}
                disabled={!canRedo}
              >
                ↷ Redo (Ctrl+Y)
              </button>
            </div>
          </div>
          
          {/* Pilih elemen yang sedang diedit */}
          <div>
            <label className="block text-sm text-white/70 mb-1">Edit Elemen</label>
            <div className="grid grid-cols-3 gap-2">
              <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='title'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('title')}>Nama</button>
              <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='description'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('description')}>Deskripsi</button>
              <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='date'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('date')}>Tanggal</button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='expired_date'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('expired_date')}>Expired Date</button>
              <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='certificate_number'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('certificate_number')}>No Sertif</button>
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
          {activeElement === 'expired_date' && (
            <div>
              <label className="block text-sm text-white/70 mb-1">Tanggal Expired</label>
              <div className="space-y-3">
                {/* Input tanggal expired */}
                <input 
                  type="date" 
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" 
                  value={expiresAt || ""}
                  onChange={async (e) => {
                    const v = e.target.value
                    setExpiresAt(v)
                    if (certificateId) {
                      try {
                        const { error } = await supabase.from("certificates").update({ expires_at: v || null }).eq("id", certificateId)
                        if (error) {
                          console.error('Error updating expired date:', error)
                          alert('Gagal menyimpan tanggal expired: ' + error.message)
                        }
                      } catch (err) {
                        console.error('Unexpected error:', err)
                        alert('Terjadi kesalahan saat menyimpan tanggal expired')
                      }
                    }
                  }}
                />
                
                {/* Status tanggal expired */}
                <div className="w-full rounded-md border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm text-white/90 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    {expiresAt ? new Date(expiresAt).toLocaleDateString('id-ID') : 'Belum diatur'}
                  </span>
                  <span className="text-xs text-orange-400/70 font-medium">
                    {expiresAt ? 'Manual' : 'Kosong'}
                  </span>
                </div>
                
                {/* Info */}
                <div className="text-xs text-white/60 bg-white/5 rounded px-2 py-1">
                  <span className="text-orange-400">ℹ</span> Tanggal expired akan ditampilkan pada sertifikat
                </div>
              </div>
            </div>
          )}
          {activeElement === 'certificate_number' && (
            <div>
              <label className="block text-sm text-white/70 mb-1">Nomor Sertifikat</label>
              <div className="space-y-3">
                {/* Input nomor sertifikat */}
                <input 
                  type="text" 
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" 
                  value={certificateNumber || ""}
                  onChange={async (e) => {
                    const v = e.target.value
                    setCertificateNumber(v)
                    if (certificateId) {
                      try {
                        const { error } = await supabase.from("certificates").update({ number: v || null }).eq("id", certificateId)
                        if (error) {
                          console.error('Error updating certificate number:', error)
                          alert('Gagal menyimpan nomor sertifikat: ' + error.message)
                        }
                      } catch (err) {
                        console.error('Unexpected error:', err)
                        alert('Terjadi kesalahan saat menyimpan nomor sertifikat')
                      }
                    }
                  }}
                  placeholder="Masukkan nomor sertifikat"
                />
                
                {/* Status nomor sertifikat */}
                <div className="w-full rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-white/90 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {certificateNumber || 'Belum diatur'}
                  </span>
                  <span className="text-xs text-green-400/70 font-medium">
                    {certificateNumber ? 'Manual' : 'Kosong'}
                  </span>
                </div>
                
                {/* Info */}
                <div className="text-xs text-white/60 bg-white/5 rounded px-2 py-1">
                  <span className="text-green-400">ℹ</span> Nomor sertifikat akan ditampilkan pada sertifikat
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/70 mb-1">Posisi X</label>
              <input type="number" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" value={
                activeElement==='title'?titleX:
                activeElement==='description'?descX:
                activeElement==='date'?dateX:
                activeElement==='expired_date'?expiredX:
                activeElement==='certificate_number'?certNumberX:0
              }
                onChange={(e) => { 
                  const n = Math.max(0, Number(e.target.value)||0); 
                  if(activeElement==='title'){ setTitleX(n); saveToHistory(); queueSave({ title_x: n }) } 
                  else if(activeElement==='description'){ setDescX(n); saveToHistory(); queueSave({ desc_x: n }) } 
                  else if(activeElement==='date'){ setDateX(n); saveToHistory(); queueSave({ date_x: n }) }
                  else if(activeElement==='expired_date'){ setExpiredX(n); saveToHistory(); queueSave({ expired_x: n }) }
                  else if(activeElement==='certificate_number'){ setCertNumberX(n); saveToHistory(); queueSave({ cert_number_x: n }) }
                }} />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Posisi Y</label>
              <input type="number" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" value={
                activeElement==='title'?titleY:
                activeElement==='description'?descY:
                activeElement==='date'?dateY:
                activeElement==='expired_date'?expiredY:
                activeElement==='certificate_number'?certNumberY:0
              }
                onChange={(e) => { 
                  const n = Math.max(0, Number(e.target.value)||0); 
                  if(activeElement==='title'){ setTitleY(n); saveToHistory(); queueSave({ title_y: n }) } 
                  else if(activeElement==='description'){ setDescY(n); saveToHistory(); queueSave({ desc_y: n }) } 
                  else if(activeElement==='date'){ setDateY(n); saveToHistory(); queueSave({ date_y: n }) }
                  else if(activeElement==='expired_date'){ setExpiredY(n); saveToHistory(); queueSave({ expired_y: n }) }
                  else if(activeElement==='certificate_number'){ setCertNumberY(n); saveToHistory(); queueSave({ cert_number_y: n }) }
                }} />
            </div>
          </div>
          {activeElement === 'title' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">Justify (Title)</label>
                <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={titleAlign}
                  onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setTitleAlign(v); saveToHistory(); queueSave({ title_align: v }) }}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Font (Title)</label>
                <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={titleFont}
                  onChange={(e)=>{ const v=e.target.value; setTitleFont(v); saveToHistory(); queueSave({ title_font: v }) }}>
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
                  onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setDescAlign(v); saveToHistory(); queueSave({ desc_align: v }) }}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Font (Deskripsi)</label>
                <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={descFont}
                  onChange={(e)=>{ const v=e.target.value; setDescFont(v); saveToHistory(); queueSave({ desc_font: v }) }}>
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
                  onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setDateAlign(v); saveToHistory(); queueSave({ date_align: v }) }}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Font (Tanggal)</label>
                <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={dateFont}
                  onChange={(e)=>{ const v=e.target.value; setDateFont(v); saveToHistory(); queueSave({ date_font: v }) }}>
                  <option value="Inter, ui-sans-serif, system-ui">Inter</option>
                  <option value="Arial, Helvetica, sans-serif">Arial</option>
                  <option value="Times New Roman, Times, serif">Times New Roman</option>
                  <option value="Georgia, serif">Georgia</option>
                </select>
              </div>
            </div>
          )}
          {activeElement === 'expired_date' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">Justify (Expired Date)</label>
                <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={expiredAlign}
                  onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setExpiredAlign(v); saveToHistory(); queueSave({ expired_align: v }) }}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Font (Expired Date)</label>
                <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={expiredFont}
                  onChange={(e)=>{ const v=e.target.value; setExpiredFont(v); saveToHistory(); queueSave({ expired_font: v }) }}>
                  <option value="Inter, ui-sans-serif, system-ui">Inter</option>
                  <option value="Arial, Helvetica, sans-serif">Arial</option>
                  <option value="Times New Roman, Times, serif">Times New Roman</option>
                  <option value="Georgia, serif">Georgia</option>
                </select>
              </div>
            </div>
          )}
          {activeElement === 'certificate_number' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">Justify (No Sertif)</label>
                <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={certNumberAlign}
                  onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setCertNumberAlign(v); saveToHistory(); queueSave({ cert_number_align: v }) }}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Font (No Sertif)</label>
                <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={certNumberFont}
                  onChange={(e)=>{ const v=e.target.value; setCertNumberFont(v); saveToHistory(); queueSave({ cert_number_font: v }) }}>
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
              <input type="number" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" value={
                activeElement==='title'?titleSize:
                activeElement==='description'?descSize:
                activeElement==='date'?dateSize:
                activeElement==='expired_date'?expiredSize:
                activeElement==='certificate_number'?certNumberSize:12
              }
                onChange={(e)=>{ 
                  const n=Number(e.target.value)||12; 
                  if(activeElement==='title'){ setTitleSize(n); saveToHistory(); queueSave({ title_size: n }) } 
                  else if(activeElement==='description'){ setDescSize(n); saveToHistory(); queueSave({ desc_size: n }) } 
                  else if(activeElement==='date'){ setDateSize(n); saveToHistory(); queueSave({ date_size: n }) }
                  else if(activeElement==='expired_date'){ setExpiredSize(n); saveToHistory(); queueSave({ expired_size: n }) }
                  else if(activeElement==='certificate_number'){ setCertNumberSize(n); saveToHistory(); queueSave({ cert_number_size: n }) }
                }} />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Warna</label>
                <input type="color" className="h-10 w-full rounded-md border border-white/10 bg-white/5 p-1" value={
                  activeElement==='title'?titleColor:
                  activeElement==='description'?descColor:
                  activeElement==='date'?dateColor:
                  activeElement==='expired_date'?expiredColor:
                  activeElement==='certificate_number'?certNumberColor:'#000000'
                }
                  onChange={(e)=>{ 
                    const v=e.target.value; 
                    const hv=normalizeHex(v); 
                    if(activeElement==='title'){ setTitleColor(hv); saveToHistory(); queueSave({ title_color: hv }) } 
                    else if(activeElement==='description'){ setDescColor(hv); saveToHistory(); queueSave({ desc_color: hv }) } 
                    else if(activeElement==='date'){ setDateColor(hv); saveToHistory(); queueSave({ date_color: hv }) }
                    else if(activeElement==='expired_date'){ setExpiredColor(hv); saveToHistory(); queueSave({ expired_color: hv }) }
                    else if(activeElement==='certificate_number'){ setCertNumberColor(hv); saveToHistory(); queueSave({ cert_number_color: hv }) }
                  }} />
            </div>
          </div>
          <div className="text-right text-xs text-white/50 h-4">{uiSaving ? "Menyimpan..." : "Tersimpan"}</div>
          <div className="flex justify-end gap-2">
            <button
              className="rounded-md border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm hover:bg-blue-500/20 disabled:opacity-50"
              onClick={async () => {
                const currentId = certificateId || newCertificateId
                if (!currentId) return
                if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null }
                setSavingAll(true)
                const payload = {
                  title: title || null,
                  description: description || null,
                  issued_at: issuedAt || null,
                  expires_at: expiresAt || null,
                  number: certificateNumber || null,
                  title_align: titleAlign,
                  desc_align: descAlign,
                  date_align: dateAlign,
                  expired_align: expiredAlign,
                  cert_number_align: certNumberAlign,
                  title_font: titleFont,
                  desc_font: descFont,
                  date_font: dateFont,
                  expired_font: expiredFont,
                  cert_number_font: certNumberFont,
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
                  expired_x: expiredX,
                  expired_y: expiredY,
                  expired_size: expiredSize,
                  expired_color: expiredColor,
                  cert_number_x: certNumberX,
                  cert_number_y: certNumberY,
                  cert_number_size: certNumberSize,
                  cert_number_color: certNumberColor,
                }
                const { error } = await supabase.from('certificates').update(payload).eq('id', currentId)
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


const TEMPLATE_MAP: Record<string, string[]> = {
  kunjungan_industri: [
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


