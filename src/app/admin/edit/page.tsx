"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useEffect, useMemo, useState, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useI18n } from "@/lib/i18n"
import { getTemplateConfig, TemplateConfig } from "@/lib/template-configs"
import { PreviewPanel } from "@/components/preview-panel"

export default function AdminPage() {
  const params = useSearchParams()
  const certificateId = params.get("id") || undefined
  const isNew = params.get("new") === "1"
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
  async function applyTemplateConfig(templatePath: string) {
    if (!templatePath) {
      console.error("Template path is required")
      setMessage(t('failedToSave') + t('templatePathRequired'))
      return
    }

    setApplyingTemplate(true)
    setMessage("")
    
    try {
      const config = getTemplateConfig(templatePath)
      if (!config) {
        console.warn("No template config found for:", templatePath)
        setMessage(t('failedToSave') + t('templateConfigNotFound'))
        return
      }

      const { defaultPositions } = config
      
      // Validate template configuration
      if (!defaultPositions || !defaultPositions.title || !defaultPositions.description || !defaultPositions.date) {
        console.error("Invalid template configuration:", config)
        setMessage(t('failedToSave') + t('invalidTemplateConfig'))
        return
      }
    
      // Update all position and styling states
      setTitleX(defaultPositions.title.x)
      setTitleY(defaultPositions.title.y)
      setTitleSize(defaultPositions.title.size)
      setTitleColor(defaultPositions.title.color)
      setTitleAlign(defaultPositions.title.align)
      setTitleFont(defaultPositions.title.font)

      setDescX(defaultPositions.description.x)
      setDescY(defaultPositions.description.y)
      setDescSize(defaultPositions.description.size)
      setDescColor(defaultPositions.description.color)
      setDescAlign(defaultPositions.description.align)
      setDescFont(defaultPositions.description.font)

      setDateX(defaultPositions.date.x)
      setDateY(defaultPositions.date.y)
      setDateSize(defaultPositions.date.size)
      setDateColor(defaultPositions.date.color)
      setDateAlign(defaultPositions.date.align)
      setDateFont(defaultPositions.date.font)

      // Set current template config
      setCurrentTemplateConfig(config)

      // Save all changes to database
      if (certificateId) {
        const updateData = {
          title_x: defaultPositions.title.x,
          title_y: defaultPositions.title.y,
          title_size: defaultPositions.title.size,
          title_color: defaultPositions.title.color,
          title_align: defaultPositions.title.align,
          title_font: defaultPositions.title.font,
          desc_x: defaultPositions.description.x,
          desc_y: defaultPositions.description.y,
          desc_size: defaultPositions.description.size,
          desc_color: defaultPositions.description.color,
          desc_align: defaultPositions.description.align,
          desc_font: defaultPositions.description.font,
          date_x: defaultPositions.date.x,
          date_y: defaultPositions.date.y,
          date_size: defaultPositions.date.size,
          date_color: defaultPositions.date.color,
          date_align: defaultPositions.date.align,
          date_font: defaultPositions.date.font,
          template_path: templatePath
        }

        const { error } = await supabase
          .from("certificates")
          .update(updateData)
          .eq("id", certificateId)
        
        if (error) {
          console.error("Error saving template config:", error)
          setMessage(t('failedToSave') + error.message)
          throw new Error(`Database error: ${error.message}`)
        } else {
          console.log("Template config applied and saved successfully")
          setMessage(t('changesSaved'))
          setTimeout(() => setMessage(''), 1500)
        }
      }
    } catch (error) {
      console.error("Error applying template config:", error)
      setMessage(t('failedToSave') + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setApplyingTemplate(false)
    }
  }

  // Helper: generate preview image dari container
  async function generatePreviewImage(): Promise<string | null> {
    try {
      const container = document.querySelector('[data-preview-container="1"]') as HTMLElement | null
      if (!container) return null
      
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default
      
      // Capture container dengan semua styling yang sama
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: container.offsetWidth,
        height: container.offsetHeight,
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.querySelector('[data-preview-container="1"]') as HTMLElement | null
          if (!clonedContainer) return
          
          // Bersihkan kelas Tailwind pada subtree untuk menghindari parser modern color (oklab/oklch)
          const stripClasses = (el: Element) => {
            if (el instanceof HTMLElement) {
              el.className = ''
              // Terapkan style minimal aman
              el.style.background = 'transparent'
              el.style.backgroundColor = 'transparent'
              el.style.border = '0'
              el.style.boxShadow = 'none'
            }
            Array.from(el.children).forEach(stripClasses)
          }
          
          // Bersihkan container dan anak2nya
          stripClasses(clonedContainer)
          // Set latar belakang putih untuk area render agar hasil jelas
          clonedContainer.style.backgroundColor = '#ffffff'
          
          // Pastikan elemen <img> preview tetap tampil penuh
          const img = clonedContainer.querySelector('[data-preview-image]') as HTMLImageElement | null
          if (img) {
            img.style.position = 'absolute'
            img.style.inset = '0'
            img.style.width = '100%'
            img.style.height = '100%'
            img.style.objectFit = 'contain'
          }
        }
      })
      
      // Convert ke base64
      return canvas.toDataURL('image/png', 1.0)
    } catch (error) {
      console.error('Error generating preview image:', error)
      return null
    }
  }

  // Helper: queue save with debounce to Supabase
  function queueSave(update: Record<string, unknown>) {
    const currentId = certificateId || newCertificateId
    if (!currentId) return
    setUiSaving(true)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      console.log("Saving to database:", update) // Debug log
      console.log("Certificate ID:", currentId) // Debug log
      
      try {
        // Filter out undefined values
        const cleanUpdate = Object.fromEntries(
          Object.entries(update).filter(([, value]) => value !== undefined)
        )
        
        // Generate preview image jika ada perubahan yang mempengaruhi tampilan
        const needsPreviewUpdate = Object.keys(cleanUpdate).some(key => 
          ['title', 'description', 'title_x', 'title_y', 'title_size', 'title_color', 'title_align', 'title_font',
           'desc_x', 'desc_y', 'desc_size', 'desc_color', 'desc_align', 'desc_font',
           'date_x', 'date_y', 'date_size', 'date_color', 'date_align', 'date_font', 'template_path'].includes(key)
        )
        
        if (needsPreviewUpdate) {
          const previewImage = await generatePreviewImage()
          if (previewImage) {
            cleanUpdate.preview_image = previewImage
            console.log("Generated preview image for save")
          }
        }
        
        console.log("Cleaned update payload:", cleanUpdate)
        
        const { error } = await supabase.from("certificates").update(cleanUpdate).eq("id", currentId)
        if (error) {
          console.error("Error saving to database:", error)
          console.error("Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          console.error("Update payload:", cleanUpdate)
        } else {
          console.log("Successfully saved to database:", cleanUpdate)
        }
      } catch (err) {
        console.error("Unexpected error during save:", err)
      }
      
      setUiSaving(false)
    }, 500)
  }

  // Opsi kategori (samakan dengan kategori pada sistem)
  const categoryOptions = useMemo(
    () => [
      { value: "kunjungan industri", label: t('industrialVisit') },
      { value: "magang", label: t('internship') },
      { value: "mou", label: t('mou') },
      { value: "pelatihan", label: t('training') },
    ],
    [t]
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

  // Ambil data sertifikat lengkap untuk record yang dipilih atau buat baru
  useEffect(() => {
    if (!certificateId && !isNew) return
    
    const loadCertificateData = async () => {
      try {
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
            setMessage(t('failedToSave') + `Failed to create certificate: ${createError.message}`)
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
        setMessage(t('loadingCertificateData'))
        
        const { data, error } = await supabase
          .from("certificates")
          .select("*")
          .eq("id", certificateId)
          .single()
            
        if (error) {
          console.error("Error loading certificate data:", error)
          setMessage(t('failedToSave') + `Failed to load certificate: ${error.message}`)
          return
        }
        
        if (!data) {
          setMessage(t('failedToSave') + t('certificateNotFound'))
          return
        }
        const row = data as Record<string, unknown>
        console.log("Loading certificate data for edit:", row) // Debug log
        setCategory((row.category as string) || "")
        
        // Set title/name - prioritize 'name' field, fallback to 'title' field
        const certificateTitle = (row.name as string) || (row.title as string) || ""
        console.log("Setting title to:", certificateTitle) // Debug log
        setTitle(certificateTitle)
        
        // Update both title and name fields to ensure consistency
        if (certificateTitle && certificateId) {
          await supabase.from("certificates").update({ 
            title: certificateTitle,
            name: certificateTitle 
          }).eq("id", certificateId)
        }
        
        // Set other fields
        setDescription((row.description as string) || "")
        setIssuedAt((row.issued_at as string) || "")
        setExpiresAt((row.expires_at as string) || "")
        setCertificateNumber((row.number as string) || "")
        
        // Set positioning and styling with fallback values
        setTitleX((row.title_x as number) ?? 370)
        setTitleY((row.title_y as number) ?? 180)
        setTitleSize((row.title_size as number) ?? 32)
        setTitleColor((row.title_color as string) ?? "#000000")
        setTitleAlign((row.title_align as "left" | "center" | "right") ?? "center")
        setTitleFont((row.title_font as string) ?? "Inter, ui-sans-serif, system-ui")
        
        setDescX((row.desc_x as number) ?? 360)
        setDescY((row.desc_y as number) ?? 235)
        setDescSize((row.desc_size as number) ?? 15)
        setDescColor((row.desc_color as string) ?? "#000000")
        setDescAlign((row.desc_align as "left" | "center" | "right") ?? "center")
        setDescFont((row.desc_font as string) ?? "Inter, ui-sans-serif, system-ui")
        
        // Use saved values if available, otherwise use defaults
        setDateX((row.date_x as number) ?? 50)
        setDateY((row.date_y as number) ?? 110)
        setDateSize((row.date_size as number) ?? 14)
        setDateColor((row.date_color as string) ?? "#000000")
        setDateAlign((row.date_align as "left" | "center" | "right") ?? "center")
        setDateFont((row.date_font as string) ?? "Inter, ui-sans-serif, system-ui")
        
        setExpiredX((row.expired_x as number) ?? 50)
        setExpiredY((row.expired_y as number) ?? 130)
        setExpiredSize((row.expired_size as number) ?? 14)
        setExpiredColor((row.expired_color as string) ?? "#000000")
        setExpiredAlign((row.expired_align as "left" | "center" | "right") ?? "center")
        setExpiredFont((row.expired_font as string) ?? "Inter, ui-sans-serif, system-ui")
        
        setCertNumberX((row.cert_number_x as number) ?? 50)
        setCertNumberY((row.cert_number_y as number) ?? 150)
        setCertNumberSize((row.cert_number_size as number) ?? 14)
        setCertNumberColor((row.cert_number_color as string) ?? "#000000")
        setCertNumberAlign((row.cert_number_align as "left" | "center" | "right") ?? "center")
        setCertNumberFont((row.cert_number_font as string) ?? "Inter, ui-sans-serif, system-ui")
        
        // Set template
        if (row.template_path) {
          const templatePath = row.template_path as string
          setSelectedTemplate(templatePath)
          setPreviewSrc(`/${templatePath}`)
          // Load template config
          const config = getTemplateConfig(templatePath)
          setCurrentTemplateConfig(config)
        } else if (row.category) {
          const first = getTemplates(row.category as string)[0]
          if (first) {
            setSelectedTemplate(first)
            setPreviewSrc(`/${first}`)
            // Load template config
            const config = getTemplateConfig(first)
            setCurrentTemplateConfig(config)
            await supabase.from("certificates").update({ template_path: first }).eq("id", certificateId)
          }
        }
      } catch (err) {
        console.error("Unexpected error loading certificate data:", err)
        setMessage(t('failedToSave') + (err instanceof Error ? err.message : 'Unknown error'))
      } finally {
        setMessage("")
      }
    }
    
    loadCertificateData()
  }, [certificateId, isNew, t])

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
  }, [title, description, issuedAt, titleX, titleY, titleSize, titleColor, titleAlign, titleFont, descX, descY, descSize, descColor, descAlign, descFont, dateX, dateY, dateSize, dateColor, dateAlign, dateFont, history.length])

  async function saveCategory(newVal: string) {
    if (!certificateId) {
      setMessage(t('selectDataFirst'))
      return
    }

    if (!newVal || newVal.trim() === '') {
      setMessage(t('failedToSaveCategory') + t('categoryCannotBeEmpty'))
      return
    }

    try {
      setSaving(true)
      setMessage("")
      
        const { error } = await supabase
          .from("certificates")
        .update({ category: newVal.trim() })
        .eq("id", certificateId)
        
      if (error) {
        console.error("Error saving category:", error)
        setMessage(t('failedToSaveCategory') + error.message)
        return
      }
      
      setMessage(t('categorySaved'))
    } catch (err) {
      console.error("Unexpected error saving category:", err)
      setMessage(t('failedToSaveCategory') + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(""), 1500)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!certificateId) {
      setMessage(t('selectDataFirst'))
      return
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setMessage(t('failedToProcessFile') + t('fileTypeNotSupported'))
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setMessage(t('failedToProcessFile') + t('fileSizeTooLarge'))
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
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsDataURL(f)
      })

      const base64 = await toBase64(file)
      
      if (!base64) {
        throw new Error("Failed to convert file to base64")
      }

      const payload = {
        certificate_id: certificateId,
        filename: file.name,
        mimetype: file.type || null,
        size: file.size,
        data_base64: base64,
      }
      
      const { error } = await supabase.from("certificate_files").insert(payload)
      if (error) {
        console.error("Error saving file:", error)
        setMessage(t('failedToSaveFile') + error.message)
        return
      }
      
      // Tampilkan pratinjau langsung (untuk gambar). Untuk PDF dapat ditangani dengan <object>
      if (file.type.startsWith("image/")) {
        setPreviewSrc(`data:${file.type};base64,${base64}`)
      } else {
        setPreviewSrc("")
      }
      
      setMessage(t('fileSavedToTable'))
    } catch (err: unknown) {
      console.error("Error processing file upload:", err)
      const message = err instanceof Error ? err.message : String(err)
      setMessage(t('failedToProcessFile') + message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
        <AdminNavbar />
         <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
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
          useI18n={true}
          onDragPosition={(nx, ny) => {
            if (activeElement === "title") { setTitleX(nx); setTitleY(ny) }
            else if (activeElement === "description") { setDescX(nx); setDescY(ny) }
            else if (activeElement === "date") { setDateX(nx); setDateY(ny) }
            else if (activeElement === "expired_date") { setExpiredX(nx); setExpiredY(ny) }
            else if (activeElement === "certificate_number") { setCertNumberX(nx); setCertNumberY(ny) }
          }}
          onCommitPosition={(nx, ny) => {
             saveToHistory()
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
            <label className="block text-sm text-white/70 mb-2">{t('certificateCategory')}</label>
            <select
              value={category}
              onChange={async (e) => {
                const val = e.target.value
                setCategory(val)
                await saveCategory(val)
              }}
              className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving || applyingTemplate}
            >
              <option value="">{t('selectCategory')}</option>
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
              // Apply template configuration automatically
              await applyTemplateConfig(path)
            }}
          />
          <div className="text-center text-white/70 mb-1">{t('or')}</div>
          <div>
            <label className="block text-sm text-white/70 mb-2">{t('uploadCertificate')}</label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFileUpload}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading || applyingTemplate}
            />
            {uploading && (
              <div className="mt-2 text-xs text-white/70">{t('uploading')}</div>
            )}
          </div>
          {/* Text controls */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            {/* Pilih elemen yang sedang diedit */}
            <div>
              <label className="block text-sm text-white/70 mb-1">{t('editElements')}</label>
              <div className="grid grid-cols-3 gap-2">
                <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='title'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('title')}>{t('title')}</button>
                <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='description'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('description')}>{t('description')}</button>
                <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='date'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('date')}>{t('date')}</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='expired_date'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('expired_date')}>Expired Date</button>
                <button className={`rounded-md border border-white/10 px-3 py-2 text-sm ${activeElement==='certificate_number'?'bg-white/15':'bg-white/5'}`} onClick={()=>setActiveElement('certificate_number')}>No Sertif</button>
              </div>
            </div>
            {activeElement === 'title' && (
            <div>
              <label className="block text-sm text-white/70 mb-1">{t('title')}</label>
              <input
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                value={title}
                onChange={async (e) => {
                  const v = e.target.value; setTitle(v)
                   saveToHistory()
                  if (certificateId) {
                    // Update both title and name fields to ensure consistency
                    await supabase.from("certificates").update({ 
                      title: v,
                      name: v 
                    }).eq("id", certificateId)
                  }
                }}
                placeholder={t('certificateTitle')}
              />
            </div>
            )}
            {activeElement === 'description' && (
            <div>
              <label className="block text-sm text-white/70 mb-1">{t('description')}</label>
              <textarea
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                rows={3}
                value={description}
                onChange={async (e) => {
                  const v = e.target.value; setDescription(v)
                   saveToHistory()
                  if (certificateId) await supabase.from("certificates").update({ description: v }).eq("id", certificateId)
                }}
                placeholder={t('briefDescription')}
              />
            </div>
            )}
            {activeElement === 'date' && (
              <div>
                <label className="block text-sm text-white/70 mb-1">{t('integratedDate')}</label>
                <div className="space-y-3">
                  {/* Input tanggal manual */}
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Tanggal Sertifikat</label>
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
                        saveToHistory()
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
                  </div>
                  
                  {/* Status tanggal */}
                  <div className="w-full rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-white/90 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {issuedAt ? new Date(issuedAt).toLocaleDateString('id-ID') : t('noDateAvailable')}
                    </span>
                    <span className="text-xs text-blue-400/70 font-medium">
                      {issuedAt ? 'Manual' : 'Belum diatur'}
                    </span>
                  </div>
                  
                  {/* Info tambahan */}
                  <div className="text-xs text-white/60 bg-white/5 rounded px-2 py-1">
                    <span className="text-blue-400">ℹ</span> Tanggal akan ditampilkan pada sertifikat sesuai format Indonesia
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
                      saveToHistory()
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
                      saveToHistory()
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
                <label className="block text-sm text-white/70 mb-1">{t('positionX')}</label>
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
                <label className="block text-sm text-white/70 mb-1">{t('positionY')}</label>
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
            {/* Justify & Font per elemen */}
            {activeElement === 'title' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">{t('justifyTitle')}</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={titleAlign}
                     onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setTitleAlign(v); saveToHistory(); queueSave({ title_align: v }) }}>
                    <option value="left">{t('left')}</option>
                    <option value="center">{t('center')}</option>
                    <option value="right">{t('right')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">{t('fontTitle')}</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={titleFont}
                     onChange={(e)=>{ const v=e.target.value; setTitleFont(v); saveToHistory(); queueSave({ title_font: v }) }}>
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
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={descAlign}
                     onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setDescAlign(v); saveToHistory(); queueSave({ desc_align: v }) }}>
                  <option value="left">{t('left')}</option>
                  <option value="center">{t('center')}</option>
                  <option value="right">{t('right')}</option>
                </select>
            </div>
            <div>
                  <label className="block text-sm text-white/70 mb-1">{t('fontDescription')}</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={descFont}
                     onChange={(e)=>{ const v=e.target.value; setDescFont(v); saveToHistory(); queueSave({ desc_font: v }) }}>
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
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={dateAlign}
                     onChange={(e)=>{ const v = e.target.value as "left"|"center"|"right"; setDateAlign(v); saveToHistory(); queueSave({ date_align: v }) }}>
                    <option value="left">{t('left')}</option>
                    <option value="center">{t('center')}</option>
                    <option value="right">{t('right')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">{t('fontDate')}</label>
                  <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm" value={dateFont}
                     onChange={(e)=>{ const v=e.target.value; setDateFont(v); saveToHistory(); queueSave({ date_font: v }) }}>
                    <option value="Inter, ui-sans-serif, system-ui">{t('inter')}</option>
                    <option value="Arial, Helvetica, sans-serif">{t('arial')}</option>
                    <option value="Times New Roman, Times, serif">{t('timesNewRoman')}</option>
                    <option value="Georgia, serif">{t('georgia')}</option>
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
                <label className="block text-sm text-white/70 mb-1">{t('fontSize')}</label>
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
                <label className="block text-sm text-white/70 mb-1">{t('color')}</label>
                <input type="color" className="h-10 w-full rounded-md border border-white/10 bg-white/5 p-1" value={
                  activeElement==='title'?titleColor:
                  activeElement==='description'?descColor:
                  activeElement==='date'?dateColor:
                  activeElement==='expired_date'?expiredColor:
                  activeElement==='certificate_number'?certNumberColor:'#000000'
                }
                  onChange={(e)=>{ 
                    const v=e.target.value; 
                    if(activeElement==='title'){ setTitleColor(v); saveToHistory(); queueSave({ title_color: v }) } 
                    else if(activeElement==='description'){ setDescColor(v); saveToHistory(); queueSave({ desc_color: v }) } 
                    else if(activeElement==='date'){ setDateColor(v); saveToHistory(); queueSave({ date_color: v }) }
                    else if(activeElement==='expired_date'){ setExpiredColor(v); saveToHistory(); queueSave({ expired_color: v }) }
                    else if(activeElement==='certificate_number'){ setCertNumberColor(v); saveToHistory(); queueSave({ cert_number_color: v }) }
                  }} />
              </div>
            </div>
             <div className="text-right text-xs text-white/50 h-4">
               {applyingTemplate ? t('applyingTemplate') : uiSaving ? t('saving') : t('saved')}
             </div>
             
             {/* Undo/Redo Controls */}
             <div className="flex gap-2 mb-4">
               <button
                 className="rounded-md border border-gray-500/40 bg-gray-500/10 px-3 py-2 text-sm hover:bg-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                 onClick={undo}
                 disabled={!canUndo}
                 title={t('undoTooltip')}
               >
                 ↶ {t('undo')}
               </button>
               <button
                 className="rounded-md border border-gray-500/40 bg-gray-500/10 px-3 py-2 text-sm hover:bg-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                 onClick={redo}
                 disabled={!canRedo}
                 title={t('redoTooltip')}
               >
                 ↷ {t('redo')}
               </button>
             </div>
             
             <div className="flex justify-between items-center gap-2">
              {currentTemplateConfig && (
                <button
                  className="rounded-md border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-sm hover:bg-orange-500/20 disabled:opacity-50"
                  onClick={() => applyTemplateConfig(selectedTemplate)}
                  disabled={applyingTemplate || !selectedTemplate}
                  title="Reset to template default positions"
                >
                  {t('resetToTemplate')}
                </button>
              )}
              <div className="flex gap-2">
              <button
                className="rounded-md border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm hover:bg-blue-500/20 disabled:opacity-50"
                onClick={async () => {
                  const currentId = certificateId || newCertificateId
                  if (!currentId) return
                  if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null }
                  setSavingAll(true)
                  // Coba dengan field dasar + styling yang mungkin sudah ada
                  const payload: Record<string, string | number | null> = {
                    title: title || null,
                    name: title || null,
                    description: description || null,
                    issued_at: issuedAt || null,
                    expires_at: expiresAt || null,
                    number: certificateNumber || null,
                    // Field styling yang tersedia di database
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
                    expired_align: expiredAlign,
                    expired_font: expiredFont,
                    expired_x: expiredX,
                    expired_y: expiredY,
                    expired_size: expiredSize,
                    expired_color: expiredColor,
                    cert_number_align: certNumberAlign,
                    cert_number_font: certNumberFont,
                    cert_number_x: certNumberX,
                    cert_number_y: certNumberY,
                    cert_number_size: certNumberSize,
                    cert_number_color: certNumberColor
                  }
                  
                  console.log("Full payload with styling:", payload)
                  console.log("Certificate ID:", certificateId)
                  
                  try {
                    console.log("Attempting to update database...")
                    
                    // Generate preview image untuk Save All
                    const previewImage = await generatePreviewImage()
                    if (previewImage) {
                      (payload as Record<string, string | number | null>).preview_image = previewImage
                      console.log("Generated preview image for Save All")
                    }
                    
                    const { error } = await supabase.from('certificates').update(payload).eq('id', currentId)
                    if (error) {
                      console.error("Save All error:", error)
                      console.error("Error message:", error.message)
                      console.error("Error code:", error.code)
                      console.error("Error details:", error.details)
                      console.error("Error hint:", error.hint)
                      setMessage(t('failedToSave') + (error.message || 'Unknown error'))
                    } else {
                      console.log("Save All successful!")
                      setMessage(t('changesSaved'))
                      setTimeout(() => setMessage(''), 1500)
                    }
                  } catch (err) {
                    console.error("Unexpected error during Save All:", err)
                    setMessage(t('failedToSave') + (err instanceof Error ? err.message : 'Unknown error'))
                  }
                  setSavingAll(false)
                }}
                disabled={!certificateId || savingAll || uiSaving}
              >
                {savingAll ? t('saving') : t('save')}
              </button>
              </div>
            </div>
          </div>
        </aside>
        </main>
         
      </div>
    </ProtectedRoute>
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
  const { t } = useI18n()
  // Render daftar template singkat; untuk saat ini placeholder.
  // Production: baca daftar template dari struktur /public/certificate/<kategori>/ atau tabel template.
  // Hardcode contoh mapping; tambahkan sesuai folder di public/certificate
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


