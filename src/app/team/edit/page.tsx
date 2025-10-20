"use client"

import { TeamNavbar } from "@/components/team-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useEffect, useMemo, useState, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useI18n } from "@/lib/i18n"
import { getTemplateConfig, TemplateConfig } from "@/lib/template-configs"

export default function TeamEditPage() {
  const params = useSearchParams()
  const certificateId = params.get("id") || undefined
  const router = useRouter()
  const { t } = useI18n()
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
  
  // Restore last edited ID on refresh if URL has no id
  useEffect(() => {
    if (!certificateId && typeof window !== 'undefined') {
      const last = window.localStorage.getItem('lastEditId')
      if (last) {
        try {
          const url = new URL(window.location.href)
          url.searchParams.set('id', last)
          router.replace(url.pathname + url.search)
        } catch {}
      }
    }
  }, [certificateId, router])

  // Save last edited ID on load/save
  useEffect(() => {
    if (certificateId && typeof window !== 'undefined') {
      window.localStorage.setItem('lastEditId', certificateId)
    }
  }, [certificateId])
  
  // Undo/Redo state management
  const [history, setHistory] = useState<Array<{
    title: string
    description: string
    issuedAt: string
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
    numberX: number
    numberY: number
    numberSize: number
    numberColor: string
    numberAlign: "left" | "center" | "right"
    numberFont: string
    expX: number
    expY: number
    expSize: number
    expColor: string
    expAlign: "left" | "center" | "right"
    expFont: string
  }>>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  
  // Text/editor settings
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [issuedAt, setIssuedAt] = useState<string>("")
  const [expiresAt, setExpiresAt] = useState<string>("")
  const [numberText, setNumberText] = useState<string>("")

  // Per-element styles & positions
  const [activeElement, setActiveElement] = useState<"title" | "description" | "date" | "number" | "expired">("title")

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

  // Number element styles & positions
  const [numberX, setNumberX] = useState<number>(370)
  const [numberY, setNumberY] = useState<number>(300)
  const [numberSize, setNumberSize] = useState<number>(14)
  const [numberColor, setNumberColor] = useState<string>("#000000")

  // Expired element styles & positions
  const [expX, setExpX] = useState<number>(370)
  const [expY, setExpY] = useState<number>(360)
  const [expSize, setExpSize] = useState<number>(12)
  const [expColor, setExpColor] = useState<string>("#000000")

  // Align & font per elemen
  const [titleAlign, setTitleAlign] = useState<"left" | "center" | "right">("center")
  const [descAlign, setDescAlign] = useState<"left" | "center" | "right">("center")
  const [dateAlign, setDateAlign] = useState<"left" | "center" | "right">("center")
  const [numberAlign, setNumberAlign] = useState<"left" | "center" | "right">("center")
  const [expAlign, setExpAlign] = useState<"left" | "center" | "right">("center")
  const [titleFont, setTitleFont] = useState("Inter, ui-sans-serif, system-ui")
  const [descFont, setDescFont] = useState("Inter, ui-sans-serif, system-ui")
  const [dateFont, setDateFont] = useState("Inter, ui-sans-serif, system-ui")
  const [numberFont, setNumberFont] = useState("Inter, ui-sans-serif, system-ui")
  const [expFont, setExpFont] = useState("Inter, ui-sans-serif, system-ui")

  // Fungsi untuk menyimpan state ke history
  const saveToHistory = () => {
    const currentState = {
      title,
      description,
      issuedAt,
      expiresAt,
      numberText,
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
      numberX,
      numberY,
      numberSize,
      numberColor,
      numberAlign,
      numberFont,
      expX,
      expY,
      expSize,
      expColor,
      expAlign,
      expFont
    }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(currentState)
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
      setNumberX(state.numberX)
      setNumberY(state.numberY)
      setNumberSize(state.numberSize)
      setNumberColor(state.numberColor)
      setNumberAlign(state.numberAlign)
      setNumberFont(state.numberFont)
      setExpX(state.expX)
      setExpY(state.expY)
      setExpSize(state.expSize)
      setExpColor(state.expColor)
      setExpAlign(state.expAlign)
      setExpFont(state.expFont)
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
      setNumberX(state.numberX)
      setNumberY(state.numberY)
      setNumberSize(state.numberSize)
      setNumberColor(state.numberColor)
      setNumberAlign(state.numberAlign)
      setNumberFont(state.numberFont)
      setExpX(state.expX)
      setExpY(state.expY)
      setExpSize(state.expSize)
      setExpColor(state.expColor)
      setExpAlign(state.expAlign)
      setExpFont(state.expFont)
      setHistoryIndex(newIndex)
      setCanUndo(true)
      setCanRedo(newIndex < history.length - 1)
    }
  }, [historyIndex, history])

  // Terapkan template config
  async function applyTemplateConfig(templatePath: string) {
    if (!templatePath) { setMessage(t('failedToSave') + t('templatePathRequired')); return }
    setApplyingTemplate(true)
    setMessage("")
    try {
      const config = getTemplateConfig(templatePath)
      if (!config) { setMessage(t('failedToSave') + t('templateConfigNotFound')); return }
      const { defaultPositions } = config
      if (!defaultPositions || !defaultPositions.title || !defaultPositions.description || !defaultPositions.date) { setMessage(t('failedToSave') + t('invalidTemplateConfig')); return }
      setTitleX(defaultPositions.title.x); setTitleY(defaultPositions.title.y); setTitleSize(defaultPositions.title.size); setTitleColor(defaultPositions.title.color); setTitleAlign(defaultPositions.title.align); setTitleFont(defaultPositions.title.font)
      setDescX(defaultPositions.description.x); setDescY(defaultPositions.description.y); setDescSize(defaultPositions.description.size); setDescColor(defaultPositions.description.color); setDescAlign(defaultPositions.description.align); setDescFont(defaultPositions.description.font)
      setDateX(defaultPositions.date.x); setDateY(defaultPositions.date.y); setDateSize(defaultPositions.date.size); setDateColor(defaultPositions.date.color); setDateAlign(defaultPositions.date.align); setDateFont(defaultPositions.date.font)
      setCurrentTemplateConfig(config)
      if (certificateId) {
        const updateData = { title_x: defaultPositions.title.x, title_y: defaultPositions.title.y, title_size: defaultPositions.title.size, title_color: defaultPositions.title.color, title_align: defaultPositions.title.align, title_font: defaultPositions.title.font, desc_x: defaultPositions.description.x, desc_y: defaultPositions.description.y, desc_size: defaultPositions.description.size, desc_color: defaultPositions.description.color, desc_align: defaultPositions.description.align, desc_font: defaultPositions.description.font, date_x: defaultPositions.date.x, date_y: defaultPositions.date.y, date_size: defaultPositions.date.size, date_color: defaultPositions.date.color, date_align: defaultPositions.date.align, date_font: defaultPositions.date.font, template_path: templatePath }
        const { error } = await supabase.from("certificates").update(updateData).eq("id", certificateId)
        if (error) { setMessage(t('failedToSave') + error.message) } else { setMessage(t('changesSaved')); setTimeout(() => setMessage(''), 1500) }
      }
    } catch (error) { setMessage(t('failedToSave') + (error instanceof Error ? error.message : 'Unknown error')) }
    finally { setApplyingTemplate(false) }
  }

  // Preview generator (html2canvas)
  async function generatePreviewImage(): Promise<string | null> {
    try {
      const container = document.querySelector('[data-preview-container="1"]') as HTMLElement | null
      if (!container) return null
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(container, { backgroundColor: '#ffffff', scale: 2, useCORS: true, allowTaint: true, logging: false, width: container.offsetWidth, height: container.offsetHeight, onclone: (clonedDoc) => {
        const clonedContainer = clonedDoc.querySelector('[data-preview-container="1"]') as HTMLElement | null
        if (!clonedContainer) return
        const stripClasses = (el: Element) => { if (el instanceof HTMLElement) { el.className = ''; el.style.background = 'transparent'; el.style.backgroundColor = 'transparent'; el.style.border = '0'; el.style.boxShadow = 'none' } Array.from(el.children).forEach(stripClasses) }
        stripClasses(clonedContainer)
        clonedContainer.style.backgroundColor = '#ffffff'
        const img = clonedContainer.querySelector('[data-preview-image]') as HTMLImageElement | null
        if (img) { img.style.position = 'absolute'; img.style.inset = '0'; img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'contain' }
      } })
      return canvas.toDataURL('image/png', 1.0)
    } catch (error) { return null }
  }

  function dataURLToBlob(dataUrl: string): Blob {
    const parts = dataUrl.split(',')
    const base64 = parts.length > 1 ? parts[1] : parts[0]
    const byteString = atob(base64)
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
    return new Blob([ab], { type: 'image/png' })
  }

  async function uploadPreviewToStorage(previewDataUrl: string, certId?: string): Promise<string | null> {
    try {
      const blob = dataURLToBlob(previewDataUrl)
      const fileName = `certificate_${certId || 'unknown'}_preview_${Date.now()}.png`
      const { error: upErr } = await supabase.storage.from('sertifikat').upload(fileName, blob, { contentType: 'image/png', upsert: false })
      if (upErr) return null
      const { data: pub } = supabase.storage.from('sertifikat').getPublicUrl(fileName)
      return pub?.publicUrl || null
    } catch { return null }
  }

  function queueSave(update: Record<string, unknown>) {
    if (!certificateId) return
    setUiSaving(true)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        const cleanUpdate = Object.fromEntries(Object.entries(update).filter(([, v]) => v !== undefined))
        if (Object.keys(cleanUpdate).length === 0) { setUiSaving(false); return }
        const needsPreviewUpdate = Object.keys(cleanUpdate).some(key => ['title','description','number','issued_at','expires_at','title_x','title_y','title_size','title_color','title_align','title_font','desc_x','desc_y','desc_size','desc_color','desc_align','desc_font','date_x','date_y','date_size','date_color','date_align','date_font','number_x','number_y','number_size','number_color','number_align','number_font','expires_x','expires_y','expires_size','expires_color','expires_align','expires_font','template_path'].includes(key))
        if (needsPreviewUpdate) {
          const previewImage = await generatePreviewImage()
          if (previewImage) {
            const publicUrl = await uploadPreviewToStorage(previewImage, certificateId)
            if (publicUrl) (cleanUpdate as any).preview_image = publicUrl
          }
        }
        await supabase.from("certificates").update(cleanUpdate).eq("id", certificateId)
      } catch {}
      setUiSaving(false)
    }, 500)
  }

  const categoryOptions = useMemo(() => [
    { value: "kunjungan industri", label: t('industrialVisit') },
    { value: "magang", label: t('internship') },
    { value: "mou", label: t('mou') },
    { value: "pelatihan", label: t('training') },
  ], [t])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); if (canUndo) undo() }
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); if (canRedo) redo() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, undo, redo])

  useEffect(() => {
    if (!certificateId) return
    const load = async () => {
      try {
        setMessage(t('loadingCertificateData'))
        const { data, error } = await supabase.from("certificates").select("*").eq("id", certificateId).single()
        if (error) { setMessage(t('failedToSave') + `Failed to load certificate: ${error.message}`); return }
        if (!data) { setMessage(t('failedToSave') + t('certificateNotFound')); return }
        const row = data as Record<string, any>
        setCategory(row.category || "")
        const certificateTitle = row.name || row.title || ""
        setTitle(certificateTitle)
        if (certificateTitle && certificateId) { await supabase.from("certificates").update({ title: certificateTitle, name: certificateTitle }).eq("id", certificateId) }
        setDescription(row.description || "")
        setIssuedAt(row.issued_at || "")
        setExpiresAt(row.expires_at || "")
        setNumberText(row.number || "")
        setTitleX(row.title_x ?? 370); setTitleY(row.title_y ?? 180); setTitleSize(row.title_size ?? 32); setTitleColor(row.title_color ?? "#000000"); setTitleAlign(row.title_align ?? "center"); setTitleFont(row.title_font ?? "Inter, ui-sans-serif, system-ui")
        setDescX(row.desc_x ?? 360); setDescY(row.desc_y ?? 235); setDescSize(row.desc_size ?? 15); setDescColor(row.desc_color ?? "#000000"); setDescAlign(row.desc_align ?? "center"); setDescFont(row.desc_font ?? "Inter, ui-sans-serif, system-ui")
        setDateX(row.date_x ?? 50); setDateY(row.date_y ?? 110); setDateSize(row.date_size ?? 14); setDateColor(row.date_color ?? "#000000"); setDateAlign(row.date_align ?? "center"); setDateFont(row.date_font ?? "Inter, ui-sans-serif, system-ui")
        setNumberX(row.number_x ?? 370); setNumberY(row.number_y ?? 300); setNumberSize(row.number_size ?? 14); setNumberColor(row.number_color ?? "#000000"); setNumberAlign(row.number_align ?? "center"); setNumberFont(row.number_font ?? "Inter, ui-sans-serif, system-ui")
        setExpX(row.expires_x ?? 370); setExpY(row.expires_y ?? 360); setExpSize(row.expires_size ?? 12); setExpColor(row.expires_color ?? "#000000"); setExpAlign(row.expires_align ?? "center"); setExpFont(row.expires_font ?? "Inter, ui-sans-serif, system-ui")
        if (row.template_path) { const templatePath = row.template_path as string; setSelectedTemplate(templatePath); setPreviewSrc(`/${templatePath}`); const config = getTemplateConfig(templatePath); setCurrentTemplateConfig(config) }
        else if (row.category) { const first = getTemplates(row.category as string)[0]; if (first) { setSelectedTemplate(first); setPreviewSrc(`/${first}`); const config = getTemplateConfig(first); setCurrentTemplateConfig(config); await supabase.from("certificates").update({ template_path: first }).eq("id", certificateId) } }
      } finally { setMessage("") }
    }
    load()
  }, [certificateId, t])

  // Realtime: auto-refresh state ketika record certificates ini berubah
  useEffect(() => {
    if (!certificateId) return
    const channel = supabase
      .channel(`cert-${certificateId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates', filter: `id=eq.${certificateId}` }, async () => {
        try {
          const { data } = await supabase.from('certificates').select('*').eq('id', certificateId).single()
          if (!data) return
          const row = data as Record<string, any>
          setCategory(row.category || '')
          const certificateTitle = row.name || row.title || ''
          setTitle(certificateTitle)
          setDescription(row.description || '')
          setIssuedAt(row.issued_at || '')
          setExpiresAt(row.expires_at || '')
          setNumberText(row.number || '')
          setTitleX(row.title_x ?? 370); setTitleY(row.title_y ?? 180); setTitleSize(row.title_size ?? 32); setTitleColor(row.title_color ?? '#000000'); setTitleAlign(row.title_align ?? 'center'); setTitleFont(row.title_font ?? 'Inter, ui-sans-serif, system-ui')
          setDescX(row.desc_x ?? 360); setDescY(row.desc_y ?? 235); setDescSize(row.desc_size ?? 15); setDescColor(row.desc_color ?? '#000000'); setDescAlign(row.desc_align ?? 'center'); setDescFont(row.desc_font ?? 'Inter, ui-sans-serif, system-ui')
          setDateX(row.date_x ?? 50); setDateY(row.date_y ?? 110); setDateSize(row.date_size ?? 14); setDateColor(row.date_color ?? '#000000'); setDateAlign(row.date_align ?? 'center'); setDateFont(row.date_font ?? 'Inter, ui-sans-serif, system-ui')
          setNumberX(row.number_x ?? 370); setNumberY(row.number_y ?? 300); setNumberSize(row.number_size ?? 14); setNumberColor(row.number_color ?? '#000000'); setNumberAlign(row.number_align ?? 'center'); setNumberFont(row.number_font ?? 'Inter, ui-sans-serif, system-ui')
          setExpX(row.expires_x ?? 370); setExpY(row.expires_y ?? 360); setExpSize(row.expires_size ?? 12); setExpColor(row.expires_color ?? '#000000'); setExpAlign(row.expires_align ?? 'center'); setExpFont(row.expires_font ?? 'Inter, ui-sans-serif, system-ui')
          if (row.template_path) { const path = row.template_path as string; setSelectedTemplate(path); setPreviewSrc(`/${path}`); setCurrentTemplateConfig(getTemplateConfig(path)) }
        } catch {}
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [certificateId])

  useEffect(() => {
    if (title || description || issuedAt || expiresAt || numberText) {
      const initialState = { title, description, issuedAt, expiresAt, numberText, titleX, titleY, titleSize, titleColor, titleAlign, titleFont, descX, descY, descSize, descColor, descAlign, descFont, dateX, dateY, dateSize, dateColor, dateAlign, dateFont, numberX, numberY, numberSize, numberColor, numberAlign, numberFont, expX, expY, expSize, expColor, expAlign, expFont }
      if (history.length === 0) { setHistory([initialState]); setHistoryIndex(0); setCanUndo(false); setCanRedo(false) }
    }
  }, [title, description, issuedAt, expiresAt, numberText, titleX, titleY, titleSize, titleColor, titleAlign, titleFont, descX, descY, descSize, descColor, descAlign, descFont, dateX, dateY, dateSize, dateColor, dateAlign, dateFont, numberX, numberY, numberSize, numberColor, numberAlign, numberFont, expX, expY, expSize, expColor, expAlign, expFont, history.length])

  async function saveCategory(newVal: string) {
    if (!certificateId) { setMessage(t('selectDataFirst')); return }
    if (!newVal || newVal.trim() === '') { setMessage(t('failedToSaveCategory') + t('categoryCannotBeEmpty')); return }
    try {
      setSaving(true); setMessage("")
      const { error } = await supabase.from("certificates").update({ category: newVal.trim() }).eq("id", certificateId)
      if (error) { setMessage(t('failedToSaveCategory') + error.message); return }
      setMessage(t('categorySaved'))
    } catch (err: unknown) { setMessage(t('failedToSaveCategory') + (err instanceof Error ? err.message : 'Unknown error')) }
    finally { setSaving(false); setTimeout(() => setMessage(""), 1500) }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!certificateId) { setMessage(t('selectDataFirst')); return }
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) { setMessage(t('failedToProcessFile') + t('fileTypeNotSupported')); return }
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) { setMessage(t('failedToProcessFile') + t('fileSizeTooLarge')); return }
    try {
      setUploading(true); setMessage("")
      const toBase64 = (f: File) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => { const res = String(reader.result || ""); const comma = res.indexOf(","); resolve(comma >= 0 ? res.slice(comma + 1) : res) }; reader.onerror = () => reject(new Error("Failed to read file")); reader.readAsDataURL(f) })
      const base64 = await toBase64(file)
      if (!base64) throw new Error("Failed to convert file to base64")
      const payload = { certificate_id: certificateId, filename: file.name, mimetype: file.type || null, size: file.size, data_base64: base64 }
      const { error } = await supabase.from("certificate_files").insert(payload)
      if (error) { setMessage(t('failedToSaveFile') + error.message); return }
      if (file.type.startsWith("image/")) { setPreviewSrc(`data:${file.type};base64,${base64}`) } else { setPreviewSrc("") }
      setMessage(t('fileSavedToTable'))
    } catch (err: unknown) { const message = err instanceof Error ? err.message : String(err); setMessage(t('failedToProcessFile') + message) }
    finally { setUploading(false) }
  }

  return (
    <ProtectedRoute allowedRoles={["team","admin"]}>
      <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
        <TeamNavbar />
         <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
        <PreviewPanel
          category={category}
          previewSrc={previewSrc}
          title={title}
          description={description}
          numberText={numberText}
          titlePos={{ x: titleX, y: titleY, size: titleSize, color: titleColor }}
          descPos={{ x: descX, y: descY, size: descSize, color: descColor }}
          datePos={{ x: dateX, y: dateY, size: dateSize, color: dateColor }}
          numberPos={{ x: numberX, y: numberY, size: numberSize, color: numberColor }}
          expiredPos={{ x: expX, y: expY, size: expSize, color: expColor }}
          titleAlign={titleAlign}
          descAlign={descAlign}
          dateAlign={dateAlign}
          numberAlign={numberAlign}
          expAlign={expAlign}
          titleFont={titleFont}
          descFont={descFont}
          dateFont={dateFont}
          numberFont={numberFont}
          expFont={expFont}
          issuedAt={issuedAt}
          expiresAt={expiresAt}
          active={activeElement}
          onDragPosition={(nx, ny) => {
            if (activeElement === "title") { setTitleX(nx); setTitleY(ny) }
            else if (activeElement === "description") { setDescX(nx); setDescY(ny) }
            else if (activeElement === "date") { setDateX(nx); setDateY(ny) }
            else if (activeElement === "number") { setNumberX(nx); setNumberY(ny) }
            else { setExpX(nx); setExpY(ny) }
          }}
          onCommitPosition={(nx, ny) => {
            saveToHistory()
            if (activeElement === "title") { queueSave({ title_x: nx, title_y: ny }) }
            else if (activeElement === "description") { queueSave({ desc_x: nx, desc_y: ny }) }
            else if (activeElement === "date") { queueSave({ date_x: nx, date_y: ny }) }
            else if (activeElement === "number") { queueSave({ number_x: nx, number_y: ny }) }
            else if (activeElement === "expired") { queueSave({ expires_x: nx, expires_y: ny }) }
          }}
        />
        <aside className="rounded-xl border border-white/10 bg-[#0d172b] p-5 space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">{t('certificateCategory')}</label>
            <select value={category} onChange={async (e) => { const val = e.target.value; setCategory(val); await saveCategory(val) }} className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed" disabled={saving || applyingTemplate}>
              <option value="">{t('selectCategory')}</option>
              {categoryOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
            {message && (<div className="mt-2 text-xs text-white/70">{message}</div>)}
          </div>
          <TemplateChooser category={category} onChoose={async (path) => { setSelectedTemplate(path); setPreviewSrc(`/${path}`); await applyTemplateConfig(path) }} />
          <div className="text-center text-white/70 mb-1">{t('or')}</div>
          <div>
            <label className="block text-sm text-white/70 mb-2">{t('uploadCertificate')}</label>
            <input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileUpload} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={uploading || applyingTemplate} />
            {uploading && (<div className="mt-2 text-xs text-white/70">{t('uploading')}</div>)}
          </div>
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div>
              <label className="block text-sm text-white/70 mb-1">{t('editElements')}</label>
              <div className="grid grid-cols-3 gap-2">
                <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='title'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('title')}>{t('name')}</button>
                <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='description'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('description')}>{t('description')}</button>
                <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='date'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('date')}>{t('date')}</button>
                <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='number'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('number')}>Number</button>
                <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='expired'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('expired')}>Expired</button>
              </div>
            </div>
            {activeElement === 'title' && (
              <div>
                <label className="block text-sm text-white/70 mb-1">{t('name')}</label>
                <input className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" value={title} onChange={async (e) => { const v = e.target.value; setTitle(v); saveToHistory(); if (certificateId) { await supabase.from("certificates").update({ title: v, name: v }).eq("id", certificateId) } }} placeholder={t('certificateTitle')} />
              </div>
            )}
            {activeElement === 'description' && (
              <div>
                <label className="block text-sm text-white/70 mb-1">{t('description')}</label>
                <textarea className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" rows={3} value={description} onChange={async (e) => { const v = e.target.value; setDescription(v); saveToHistory(); if (certificateId) await supabase.from("certificates").update({ description: v }).eq("id", certificateId) }} placeholder={t('briefDescription')} />
              </div>
            )}
            {activeElement === 'number' && (
              <div>
                <label className="block text-sm text-white/70 mb-1">Nomor Sertifikat</label>
                <input className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" value={numberText} onChange={async (e) => { const v = e.target.value; setNumberText(v); saveToHistory(); if (certificateId) await supabase.from("certificates").update({ number: v }).eq("id", certificateId) }} placeholder="Nomor sertifikat" />
              </div>
            )}
            {activeElement === 'date' && (
              <div>
                <label className="block text-sm text-white/70 mb-1">{t('integratedDate')}</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Tanggal Sertifikat</label>
                    <input type="date" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" value={issuedAt || ""} onChange={async (e) => { const v = e.target.value; if (v) { const selectedDate = new Date(v); const today = new Date(); const tenYearsAgo = new Date(); tenYearsAgo.setFullYear(today.getFullYear() - 10); if (selectedDate > today) { alert('Tanggal tidak boleh lebih dari hari ini'); return } if (selectedDate < tenYearsAgo) { alert('Tanggal tidak boleh lebih dari 10 tahun yang lalu'); return } } setIssuedAt(v); saveToHistory(); if (certificateId) { try { const { error } = await supabase.from("certificates").update({ issued_at: v || null }).eq("id", certificateId); if (error) { alert('Gagal menyimpan tanggal: ' + error.message) } } catch {} } }} />
                  </div>
                  <div className="w-full rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-white/90 flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>{issuedAt ? new Date(issuedAt).toLocaleDateString('id-ID') : t('noDateAvailable')}</span>
                    <span className="text-xs text-blue-400/70 font-medium">{issuedAt ? 'Manual' : 'Belum diatur'}</span>
                  </div>
                  <div className="text-xs text-white/60 bg-white/5 rounded px-2 py-1"><span className="text-blue-400">ℹ</span> Tanggal akan ditampilkan pada sertifikat sesuai format Indonesia</div>
                </div>
              </div>
            )}
            {activeElement === 'expired' && (
              <div>
                <label className="block text-sm text-white/70 mb-1">Expired Date</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Tanggal Kedaluwarsa</label>
                    <input type="date" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" value={expiresAt || ""} onChange={async (e) => { const v = e.target.value; setExpiresAt(v); saveToHistory(); if (certificateId) await supabase.from("certificates").update({ expires_at: v }).eq("id", certificateId) }} />
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">{t('positionX')}</label>
                <input type="number" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" value={activeElement==='title'?titleX:activeElement==='description'?descX:activeElement==='date'?dateX:activeElement==='number'?numberX:expX} onChange={(e) => { const n = Math.max(0, Number(e.target.value)||0); if(activeElement==='title'){ setTitleX(n); saveToHistory(); queueSave({ title_x: n }) } else if(activeElement==='description'){ setDescX(n); saveToHistory(); queueSave({ desc_x: n }) } else if(activeElement==='date'){ setDateX(n); saveToHistory(); queueSave({ date_x: n }) } else if(activeElement==='number'){ setNumberX(n); saveToHistory(); queueSave({ number_x: n }) } else { setExpX(n); saveToHistory(); queueSave({ expires_x: n }) } }} />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">{t('positionY')}</label>
                <input type="number" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" value={activeElement==='title'?titleY:activeElement==='description'?descY:activeElement==='date'?dateY:activeElement==='number'?numberY:expY} onChange={(e) => { const n = Math.max(0, Number(e.target.value)||0); if(activeElement==='title'){ setTitleY(n); saveToHistory(); queueSave({ title_y: n }) } else if(activeElement==='description'){ setDescY(n); saveToHistory(); queueSave({ desc_y: n }) } else if(activeElement==='date'){ setDateY(n); saveToHistory(); queueSave({ date_y: n }) } else if(activeElement==='number'){ setNumberY(n); saveToHistory(); queueSave({ number_y: n }) } else { setExpY(n); saveToHistory(); queueSave({ expires_y: n }) } }} />
              </div>
            </div>
            {activeElement === 'title' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">{t('justifyTitle')}</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={titleAlign} onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setTitleAlign(v); saveToHistory(); queueSave({ title_align: v }) }}>
                    <option value="left">{t('left')}</option>
                    <option value="center">{t('center')}</option>
                    <option value="right">{t('right')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">{t('fontTitle')}</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={titleFont} onChange={(e)=>{ const v=e.target.value; setTitleFont(v); saveToHistory(); queueSave({ title_font: v }) }}>
                    <option value="Inter, ui-sans-serif, system-ui">{t('inter')}</option>
                    <option value="Arial, Helvetica, sans-serif">{t('arial')}</option>
                    <option value="Times New Roman, Times, serif">{t('timesNewRoman')}</option>
                    <option value="Georgia, serif">{t('georgia')}</option>
                  </select>
                </div>
              </div>
            )}
            {activeElement === 'description' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">{t('justifyDescription')}</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={descAlign} onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setDescAlign(v); saveToHistory(); queueSave({ desc_align: v }) }}>
                    <option value="left">{t('left')}</option>
                    <option value="center">{t('center')}</option>
                    <option value="right">{t('right')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">{t('fontDescription')}</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={descFont} onChange={(e)=>{ const v=e.target.value; setDescFont(v); saveToHistory(); queueSave({ desc_font: v }) }}>
                    <option value="Inter, ui-sans-serif, system-ui">{t('inter')}</option>
                    <option value="Arial, Helvetica, sans-serif">{t('arial')}</option>
                    <option value="Times New Roman, Times, serif">{t('timesNewRoman')}</option>
                    <option value="Georgia, serif">{t('georgia')}</option>
                  </select>
                </div>
              </div>
            )}
            {activeElement === 'date' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">{t('justifyDate')}</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={dateAlign} onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setDateAlign(v); saveToHistory(); queueSave({ date_align: v }) }}>
                    <option value="left">{t('left')}</option>
                    <option value="center">{t('center')}</option>
                    <option value="right">{t('right')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">{t('fontDate')}</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={dateFont} onChange={(e)=>{ const v=e.target.value; setDateFont(v); saveToHistory(); queueSave({ date_font: v }) }}>
                    <option value="Inter, ui-sans-serif, system-ui">{t('inter')}</option>
                    <option value="Arial, Helvetica, sans-serif">{t('arial')}</option>
                    <option value="Times New Roman, Times, serif">{t('timesNewRoman')}</option>
                    <option value="Georgia, serif">{t('georgia')}</option>
                  </select>
                </div>
              </div>
            )}
            {activeElement === 'number' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Justify (Number)</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={numberAlign} onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setNumberAlign(v); saveToHistory(); queueSave({ number_align: v }) }}>
                    <option value="left">{t('left')}</option>
                    <option value="center">{t('center')}</option>
                    <option value="right">{t('right')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Font (Number)</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={numberFont} onChange={(e)=>{ const v=e.target.value; setNumberFont(v); saveToHistory(); queueSave({ number_font: v }) }}>
                    <option value="Inter, ui-sans-serif, system-ui">{t('inter')}</option>
                    <option value="Arial, Helvetica, sans-serif">{t('arial')}</option>
                    <option value="Times New Roman, Times, serif">{t('timesNewRoman')}</option>
                    <option value="Georgia, serif">{t('georgia')}</option>
                  </select>
                </div>
              </div>
            )}
            {activeElement === 'expired' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Justify (Expired)</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={expAlign} onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setExpAlign(v); saveToHistory(); queueSave({ expires_align: v }) }}>
                    <option value="left">{t('left')}</option>
                    <option value="center">{t('center')}</option>
                    <option value="right">{t('right')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Font (Expired)</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={expFont} onChange={(e)=>{ const v=e.target.value; setExpFont(v); saveToHistory(); queueSave({ expires_font: v }) }}>
                    <option value="Inter, ui-sans-serif, system-ui">{t('inter')}</option>
                    <option value="Arial, Helvetica, sans-serif">{t('arial')}</option>
                    <option value="Times New Roman, Times, serif">{t('timesNewRoman')}</option>
                    <option value="Georgia, serif">{t('georgia')}</option>
                  </select>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">{t('fontSize')}</label>
                <input type="number" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" value={activeElement==='title'?titleSize:activeElement==='description'?descSize:activeElement==='date'?dateSize:activeElement==='number'?numberSize:expSize} onChange={(e)=>{ const n=Number(e.target.value)||12; if(activeElement==='title'){ setTitleSize(n); saveToHistory(); queueSave({ title_size: n }) } else if(activeElement==='description'){ setDescSize(n); saveToHistory(); queueSave({ desc_size: n }) } else if(activeElement==='date'){ setDateSize(n); saveToHistory(); queueSave({ date_size: n }) } else if(activeElement==='number'){ setNumberSize(n); saveToHistory(); queueSave({ number_size: n }) } else { setExpSize(n); saveToHistory(); queueSave({ expires_size: n }) } }} />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">{t('color')}</label>
                <input type="color" className="h-10 w-full rounded-md border border-white/10 bg-white/5 p-1" value={activeElement==='title'?titleColor:activeElement==='description'?descColor:activeElement==='date'?dateColor:activeElement==='number'?numberColor:expColor} onChange={(e)=>{ const v=e.target.value; if(activeElement==='title'){ setTitleColor(v); saveToHistory(); queueSave({ title_color: v }) } else if(activeElement==='description'){ setDescColor(v); saveToHistory(); queueSave({ desc_color: v }) } else if(activeElement==='date'){ setDateColor(v); saveToHistory(); queueSave({ date_color: v }) } else if(activeElement==='number'){ setNumberColor(v); saveToHistory(); queueSave({ number_color: v }) } else { setExpColor(v); saveToHistory(); queueSave({ expires_color: v }) } }} />
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <button className="rounded-md border border-gray-500/40 bg-gray-500/10 px-3 py-2 text-sm hover:bg-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed" onClick={undo} disabled={!canUndo} title={t('undoTooltip')}>↶ {t('undo')}</button>
              <button className="rounded-md border border-gray-500/40 bg-gray-500/10 px-3 py-2 text-sm hover:bg-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed" onClick={redo} disabled={!canRedo} title={t('redoTooltip')}>↷ {t('redo')}</button>
            </div>
            {currentTemplateConfig && (
              <button type="button" className="rounded-md border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-sm hover:bg-orange-500/20 disabled:opacity-50" onClick={() => applyTemplateConfig(selectedTemplate)} disabled={applyingTemplate || !selectedTemplate} title="Reset to template default positions">{t('resetToTemplate')}</button>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" className="rounded-md border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm hover:bg-blue-500/20 disabled:opacity-50" onClick={async () => {
                if (!certificateId) return
                if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null }
                setSavingAll(true)
                const payload: Record<string, string | number | null> = {
                  title: title || null,
                  name: title || null,
                  description: description || null,
                  issued_at: issuedAt || null,
                  title_align: titleAlign,
                  title_font: titleFont,
                  title_x: titleX,
                  title_y: titleY,
                  title_size: titleSize,
                  title_color: titleColor,
                  desc_align: descAlign,
                  desc_font: descFont,
                  desc_x: descX,
                  desc_y: descY,
                  desc_size: descSize,
                  desc_color: descColor,
                  date_align: dateAlign,
                  date_font: dateFont,
                  date_x: dateX,
                  date_y: dateY,
                  date_size: dateSize,
                  date_color: dateColor,
                  number: numberText || null,
                  number_align: numberAlign,
                  number_font: numberFont,
                  number_x: numberX,
                  number_y: numberY,
                  number_size: numberSize,
                  number_color: numberColor,
                  expires_at: expiresAt || null,
                  expires_align: expAlign,
                  expires_font: expFont,
                  expires_x: expX,
                  expires_y: expY,
                  expires_size: expSize,
                  expires_color: expColor,
                }
                const previewImageDataUrl = await generatePreviewImage()
                if (previewImageDataUrl) { const publicUrl = await uploadPreviewToStorage(previewImageDataUrl, certificateId); if (publicUrl) { (payload as any).preview_image = publicUrl } }
                try { const { error } = await supabase.from('certificates').update(payload).eq('id', certificateId); if (error) { setMessage(t('failedToSave') + (error.message || 'Unknown error')) } else { setMessage(t('changesSaved')); setTimeout(() => setMessage(''), 1500) } }
                catch (err) { setMessage(t('failedToSave') + (err instanceof Error ? err.message : 'Unknown error')) }
                setSavingAll(false)
              }} disabled={!certificateId || savingAll || uiSaving}>
                {savingAll ? t('saving') : t('save')}
              </button>
            </div>
            <div className="text-right text-xs text-white/50 h-4">{applyingTemplate ? t('applyingTemplate') : uiSaving ? t('saving') : t('saved')}</div>
          </div>
        </aside>
      </main>
      </div>
    </ProtectedRoute>
  )
}

function PreviewPanel({ category, previewSrc, title, description, numberText, titlePos, descPos, datePos, numberPos, expiredPos, titleAlign, descAlign, dateAlign, numberAlign, expAlign, titleFont, descFont, dateFont, numberFont, expFont, issuedAt, expiresAt, active, onDragPosition, onCommitPosition }: { category: string; previewSrc?: string; title?: string; description?: string; numberText?: string; titlePos: { x: number; y: number; size: number; color: string }; descPos: { x: number; y: number; size: number; color: string }; datePos: { x: number; y: number; size: number; color: string }; numberPos: { x: number; y: number; size: number; color: string }; expiredPos: { x: number; y: number; size: number; color: string }; titleAlign: "left"|"center"|"right"; descAlign: "left"|"center"|"right"; dateAlign: "left"|"center"|"right"; numberAlign: "left"|"center"|"right"; expAlign: "left"|"center"|"right"; titleFont: string; descFont: string; dateFont: string; numberFont: string; expFont: string; issuedAt?: string; expiresAt?: string; active: "title"|"description"|"date"|"number"|"expired"; onDragPosition?: (x: number, y: number) => void; onCommitPosition?: (x: number, y: number) => void }) {
  const { t } = useI18n()
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [natW, setNatW] = useState<number>(0)
  const [natH, setNatH] = useState<number>(0)
  const [livePng, setLivePng] = useState<string>("")

  function getMetrics() {
    const cont = containerRef.current
    if (!cont || !natW || !natH) return { offX: 0, offY: 0, dispW: 0, dispH: 0, scaleX: 1, scaleY: 1 }
    const cW = cont.clientWidth
    const cH = cont.clientHeight
    const ratioImg = natW / natH
    const ratioCont = cW / cH
    let dispW = cW, dispH = cH
    if (ratioCont > ratioImg) { dispH = cH; dispW = Math.round(cH * ratioImg) } else { dispW = cW; dispH = Math.round(cW / ratioImg) }
    const offX = Math.round((cW - dispW) / 2)
    const offY = Math.round((cH - dispH) / 2)
    return { offX, offY, dispW, dispH, scaleX: dispW / natW, scaleY: dispH / natH }
  }
  function imgToScreen(x: number, y: number) { const m = getMetrics(); return { x: Math.round(m.offX + x * m.scaleX), y: Math.round(m.offY + y * m.scaleY) } }
  function screenToImg(x: number, y: number) { const m = getMetrics(); return { x: Math.round((x - m.offX) / m.scaleX), y: Math.round((y - m.offY) / m.scaleY) } }

  async function renderLivePng() {
    try {
      if (!previewSrc || !natW || !natH) return
      const img = await new Promise<HTMLImageElement>((resolve, reject) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => resolve(im); im.onerror = reject; im.src = previewSrc })
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = natW
      canvas.height = natH
      ctx.drawImage(img, 0, 0, natW, natH)
      const drawText = async (text: string, x: number, y: number, size: number, color: string, align: string, font: string, bold = false, maxWidth?: number, forceLeftAnchor = false) => {
        if (!text) return
        ctx.fillStyle = color
        const weight = bold ? '700' : '400'
        const baseFamily = (font || '').split(',')[0]?.replace(/['"]/g, '').trim() || 'Inter'
        try { await (document as any).fonts?.load?.(`${weight} ${size}px '${baseFamily}'`) } catch {}
        await (document as any).fonts?.ready?.()
        ctx.font = `${weight} ${size}px ${font}`
        ctx.textBaseline = 'top'
        const singleLine = !maxWidth
        const blockWidth = maxWidth ?? Math.max(0, natW - x - 20)
        let anchorX = x
        if (forceLeftAnchor) { ctx.textAlign = 'left' }
        else if (align === 'center') { ctx.textAlign = 'center'; anchorX = Math.round(x + blockWidth / 2) }
        else if (align === 'right') { ctx.textAlign = 'right'; anchorX = Math.round(x + blockWidth) }
        else { ctx.textAlign = 'left' }
        const dx = anchorX
        const dy = y
        if (!singleLine) {
          const words = String(text).split(/\s+/)
          let line = ''
          let yy = dy
          for (let i = 0; i < words.length; i++) {
            const test = line ? line + ' ' + words[i] : words[i]
            const w = ctx.measureText(test).width
            if (w > blockWidth && i > 0) { ctx.fillText(line, dx, yy); yy += Math.round(size * 1.4); line = words[i] } else { line = test }
          }
          if (line) ctx.fillText(line, dx, yy)
        } else { ctx.fillText(text, dx, dy) }
      }
      if (title) { await drawText(title, titlePos.x, titlePos.y, titlePos.size, titlePos.color, titleAlign, titleFont, true, undefined, true) }
      if (description) { await drawText(description, descPos.x, descPos.y, descPos.size, descPos.color, descAlign, descFont, false, Math.max(0, natW - descPos.x - 40)) }
      if (issuedAt) { const dateText = new Date(issuedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }); await drawText(dateText, datePos.x, datePos.y, datePos.size, datePos.color, dateAlign, dateFont) }
      if (numberText) { await drawText(numberText, numberPos.x, numberPos.y, numberPos.size, numberPos.color, numberAlign, numberFont) }
      if (expiresAt) { const expText = new Date(expiresAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }); await drawText(expText, expiredPos.x, expiredPos.y, expiredPos.size, expiredPos.color, expAlign, expFont) }
      const url = canvas.toDataURL('image/png', 1.0)
      setLivePng(url)
    } catch {}
  }

  const clampX = (x: number) => x
  const clampY = (y: number) => y

  return (
    <section className="rounded-xl border border-white/10 bg-[#0d172b] p-6 shadow-xl shadow-blue-500/10 min-h-[420px]">
      <h2 className="text-3xl font-bold text-blue-400 mb-4 text-center">{t('certificatePreview')}</h2>
      <div className="text-white/80 text-sm mb-2 text-center">{category ? `${t('categorySelected')}: ${category}` : t('noCategorySelected')}</div>
      {issuedAt && (
        <div className="text-green-400/80 text-xs mb-2 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
          {t('integratedDate')}: {new Date(issuedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      )}
      <div className="flex justify-center items-center">
        <div className={`mt-4 rounded-lg border border-white/10 bg-white/5 relative overflow-hidden ${dragging ? "cursor-grabbing" : "cursor-grab"}`} ref={containerRef} style={{ position: 'relative', contain: 'layout style paint', willChange: 'transform', width: '100%', maxWidth: '600px', aspectRatio: natW && natH ? `${natW}/${natH}` : undefined, margin: '0 auto' }} data-preview-container="1" onMouseDown={(e) => {
          const overlay = (e.currentTarget as HTMLDivElement).querySelector('[data-overlay="text"]') as HTMLElement | null
          if (!overlay) return
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
          const base = active === 'title' ? titlePos : active === 'description' ? descPos : active === 'date' ? datePos : active === 'number' ? numberPos : expiredPos
          const start = screenToImg(Math.round(e.clientX - rect.left), Math.round(e.clientY - rect.top))
          const ox = base.x - start.x
          const oy = base.y - start.y
          setDragging(true)
          const onMove = (ev: MouseEvent) => { const pos = screenToImg(Math.round(ev.clientX - rect.left), Math.round(ev.clientY - rect.top)); const nx = pos.x + ox; const ny = pos.y + oy; onDragPosition?.(clampX(nx), clampY(ny)) }
          const onUp = () => { setDragging(false); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); const baseNow = active === 'title' ? titlePos : active === 'description' ? descPos : active === 'date' ? datePos : active === 'number' ? numberPos : expiredPos; const nx = clampX(baseNow.x); const ny = clampY(baseNow.y); onCommitPosition?.(nx, ny) }
          window.addEventListener('mousemove', onMove)
          window.addEventListener('mouseup', onUp)
        }} title={t('clickAndDrag')}>
          {livePng ? (
            <img src={livePng} alt="Live Preview" className="absolute inset-0 w-full h-full object-contain" data-preview-image />
          ) : previewSrc ? (
            previewSrc.endsWith('.pdf') ? (
              <object data={previewSrc} type="application/pdf" className="w-full h-full" />
            ) : (
              <img src={previewSrc} alt="Template" className="absolute inset-0 w-full h-full object-contain" onLoad={(e)=>{ setNatW(e.currentTarget.naturalWidth); setNatH(e.currentTarget.naturalHeight); setTimeout(()=>{renderLivePng()},0) }} />
            )
          ) : null}
          <div className="absolute" style={{ left: `${imgToScreen(titlePos.x, titlePos.y).x}px`, top: `${imgToScreen(titlePos.x, titlePos.y).y}px`, width: 'auto', maxWidth: 'calc(100% - 40px)', textAlign: titleAlign, fontFamily: titleFont, fontSize: `${titlePos.size}px`, color: titlePos.color, position: 'absolute', zIndex: 10, opacity: livePng ? 0 : 1 }} data-overlay="text">
            <div>{title}</div>
          </div>
          <div className="absolute" style={{ left: `${imgToScreen(descPos.x, descPos.y).x}px`, top: `${imgToScreen(descPos.x, descPos.y).y}px`, width: 'auto', maxWidth: 'calc(100% - 40px)', textAlign: descAlign, fontFamily: descFont, fontSize: `${descPos.size}px`, color: descPos.color, whiteSpace: 'pre-line', position: 'absolute', zIndex: 10, opacity: livePng ? 0 : 1 }}>
            <div className="opacity-90">{description}</div>
          </div>
          {numberText && (
            <div className="absolute" style={{ left: `${imgToScreen(numberPos.x, numberPos.y).x}px`, top: `${imgToScreen(numberPos.x, numberPos.y).y}px`, width: 'auto', maxWidth: 'calc(100% - 40px)', textAlign: numberAlign, fontFamily: numberFont, fontSize: `${numberPos.size}px`, color: numberPos.color, position: 'absolute', zIndex: 10, opacity: livePng ? 0 : 1 }}>
              <div>{numberText}</div>
            </div>
          )}
          {issuedAt && (
            <div className="absolute" style={{ left: `${imgToScreen(datePos.x, datePos.y).x}px`, top: `${imgToScreen(datePos.x, datePos.y).y}px`, width: 'auto', maxWidth: 'calc(100% - 40px)', textAlign: dateAlign, fontFamily: dateFont, fontSize: `${datePos.size}px`, color: datePos.color, position: 'absolute', zIndex: 10, opacity: livePng ? 0 : 1 }}>
              <div className="mt-1 opacity-80">{new Date(issuedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          )}
          {expiresAt && (
            <div className="absolute" style={{ left: `${imgToScreen(expiredPos.x, expiredPos.y).x}px`, top: `${imgToScreen(expiredPos.x, expiredPos.y).y}px`, width: 'auto', maxWidth: 'calc(100% - 40px)', textAlign: expAlign, fontFamily: expFont, fontSize: `${expiredPos.size}px`, color: expiredPos.color, position: 'absolute', zIndex: 10, opacity: livePng ? 0 : 1 }}>
              <div className="mt-1 opacity-80">{new Date(expiresAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          )}
          {!previewSrc && (<div className="absolute inset-0 grid place-items-center text-white/60">{t('selectTemplateOrUpload')}</div>)}
        </div>
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
  const { t } = useI18n()
  const list = getTemplates(category)
  return (
    <div>
      <label className="block text-sm text-white/70 mb-2">{t('chooseTemplate')}</label>
      {(!category || list.length === 0) ? (
        <div className="text-white/60 text-sm">{t('selectCategoryToSeeTemplates')}</div>
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

