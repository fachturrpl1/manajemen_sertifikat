"use client"

import { useRouter } from "next/navigation"
import { use, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useI18n } from "@/lib/i18n"
import { Globe } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useToast } from "@/components/ui/toast"

type Props = { params: Promise<{ no: string }> }

export default function CheckCertificatePage({ params }: Props) {
  const { no } = use(params)
  const router = useRouter()
  const { t, locale, setLocale } = useI18n()
  const [memberData, setMemberData] = useState<{
    id: string;
    name: string;
    organization?: string;
    phone?: string;
    email?: string;
    job?: string;
    dob?: string;
    address?: string;
    city?: string;
    notes?: string;
    // Optional aliases used in UI
    instansi_penerima?: string; // alias of organization/recipient_org
    penerbit?: string; // alias of issuer
    recipient_org?: string;
    issuer?: string;
  } | null>(null)
  const [certificateData, setCertificateData] = useState<{
    id: string;
    name?: string;
    title?: string;
    description?: string;
    number?: string;
    category?: string;
    issued_at?: string;
    expires_at?: string;
    updated_at?: string;
    updatedAt?: string;
    modified_at?: string;
    modifiedAt?: string;
    template_path?: string;
    preview_image?: string;
    // Layout fields (title)
    title_x?: number; title_y?: number; title_size?: number; title_color?: string; title_align?: "left"|"center"|"right"; title_font?: string;
    // Layout fields (description)
    desc_x?: number; desc_y?: number; desc_size?: number; desc_color?: string; desc_align?: "left"|"center"|"right"; desc_font?: string;
    // Layout fields (date/issued)
    date_x?: number; date_y?: number; date_size?: number; date_color?: string; date_align?: "left"|"center"|"right"; date_font?: string; date_format?: string;
    // Layout fields (number)
    number_x?: number; number_y?: number; number_size?: number; number_color?: string; number_align?: "left"|"center"|"right"; number_font?: string;
    // Layout fields (expired)
    expires_x?: number; expires_y?: number; expires_size?: number; expires_color?: string; expires_align?: "left"|"center"|"right"; expires_font?: string; expired_format?: string;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { showToast, ToastContainer } = useToast()
  const [natW, setNatW] = useState<number>(0)
  const [natH, setNatH] = useState<number>(0)
  const cacheParam = (() => {
    const c = certificateData
    const v = c?.updated_at || c?.updatedAt || c?.modified_at || c?.modifiedAt || c?.issued_at || c?.id
    return v ? String(v).replace(/\s+/g, '-') : String(Date.now())
  })()

  // Back button handler with safe fallback when no history
  const handleBack = () => {
    try {
      const hasHistory = typeof window !== 'undefined' && window.history.length > 1
      const sameOriginRef = typeof document !== 'undefined' && document.referrer && new URL(document.referrer).origin === window.location.origin
      if (hasHistory && sameOriginRef) {
        router.back()
      } else {
        router.push('/all')
      }
    } catch {
      router.push('/all')
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Cari data sertifikat berdasarkan nomor/kode
        const { data: certificate, error: certError } = await supabase
          .from('certificates')
          .select('*')
          .eq('number', no)
          .single()

        if (certError || !certificate) {
          setError("Certificate not found")
          return
        }

        setCertificateData(certificate)

        // Jika ada member_id, cari data member untuk detail tambahan
        if (certificate.member_id) {
          const { data: member, error: memberError } = await supabase
            .from('members')
            .select('*')
            .eq('id', certificate.member_id)
            .single()

          if (member && !memberError) {
            setMemberData(member)
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError("Failed to load certificate")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [no])

  if (loading) {
    return (
      <div className="min-h-svh bg-white text-black dark:bg-gradient-to-b dark:from-[#0b1220] dark:to-[#0f1c35] dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !certificateData) {
  return (
    <div className="min-h-svh bg-white text-black dark:bg-gradient-to-b dark:from-[#0b1220] dark:to-[#0f1c35] dark:text-white">
        <div className="absolute right-6 top-6 z-20 flex items-center gap-3">
          {/* Language Toggle Button */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-black/5 px-3 py-1.5 text-sm hover:bg-black/10 transition-colors dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            title={locale === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
          >
            <Globe className="h-4 w-4" />
            <span className="font-medium">{locale === 'en' ? 'EN' : 'ID'}</span>
          </button>
          <ThemeToggle />
        </div>
      <button
          onClick={handleBack}
          aria-label="Back"
          className="ml-8 mt-8 mb-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      <div className="mx-auto max-w-4xl px-4 md:px-0 py-6">
          <h1 className="text-2xl font-semibold mb-2">{t('certificateNotFound')}</h1>
          <p className="text-white/70">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-white text-black dark:bg-gradient-to-b dark:from-[#0b1220] dark:to-[#0f1c35] dark:text-white">
      <div className="absolute right-6 top-6 z-20 flex items-center gap-3">
        {/* Language Toggle Button */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-black/5 px-3 py-1.5 text-sm hover:bg-black/10 transition-colors dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          title={locale === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium">{locale === 'en' ? 'EN' : 'ID'}</span>
        </button>
        <ThemeToggle />
      </div>
      
      <button
        onClick={handleBack}
        aria-label="Back"
        className="ml-8 mt-8 mb-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-black/5 text-black hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="mx-auto max-w-6xl px-4 md:px-0 py-6">

        {/* Certificate Preview */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm min-h-[420px] dark:border-white/10 dark:bg-[#0d172b] dark:shadow-xl dark:shadow-blue-500/10">
          <h2 className="text-3xl font-bold text-blue-700 mb-4 text-center dark:text-blue-400">{t('certificatePreview')}</h2>
          <div className="text-black/70 text-sm mb-2 text-center dark:text-white/80">
            {certificateData.category ? `${t('categorySelected')}: ${certificateData.category}` : t('noCategorySelected')}
          </div>
          {certificateData.issued_at && (
            <div className="text-green-400/80 text-xs mb-2 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              {t('integratedDate')}: {new Date(certificateData.issued_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}
          
          <div className="flex justify-center items-center">
            <div
              className="mt-4 rounded-lg border border-gray-200 bg-white relative overflow-hidden dark:border-white/10 dark:bg-white/5"
              style={{
                position: 'relative',
                contain: 'layout style paint',
                willChange: 'transform',
                width: '100%',
                maxWidth: '600px',
                aspectRatio: natW && natH ? `${natW}/${natH}` : undefined,
                margin: '0 auto'
              }}
              data-preview-container="check"
            >
              {certificateData && (certificateData.preview_image || certificateData.template_path) ? (
                <>
                  {certificateData.preview_image ? (
                    <img
                      src={`${certificateData.preview_image}${certificateData.preview_image.includes('?') ? '&' : '?'}v=${cacheParam}`}
                      alt="Certificate Preview"
                      className="absolute inset-0 w-full h-full object-contain"
                      crossOrigin="anonymous"
                      data-preview-image
                      onLoad={(e)=>{ setNatW(e.currentTarget.naturalWidth); setNatH(e.currentTarget.naturalHeight) }}
                    />
                  ) : (
                    <img
                      src={`/${certificateData.template_path}`}
                      alt="Certificate Template"
                      className="absolute inset-0 w-full h-full object-contain"
                      crossOrigin="anonymous"
                      data-preview-image
                      onLoad={(e)=>{ setNatW(e.currentTarget.naturalWidth); setNatH(e.currentTarget.naturalHeight) }}
                    />
                  )}
                  
                  {/* Title Overlay */}
                  {!certificateData.preview_image && certificateData.title && (
                    <div
                      className="absolute"
                      style={{ 
                        left: `${certificateData.title_x || 370}px`, 
                        top: `${certificateData.title_y || 180}px`, 
                        width: "auto", 
                        maxWidth: "calc(100% - 40px)",
                        textAlign: certificateData.title_align || 'center', 
                        fontFamily: certificateData.title_font || 'Inter',
                        fontSize: `${certificateData.title_size || 32}px`, 
                        color: certificateData.title_color || '#000000',
                        position: 'absolute',
                        zIndex: 10
                      }}
                      data-overlay="text"
                    >
                      <div>{certificateData.title}</div>
                    </div>
                  )}

                  {/* Description Overlay */}
                  {!certificateData.preview_image && certificateData.description && (
                    <div
                      className="absolute"
                      style={{ 
                        left: `${certificateData.desc_x || 50}px`, 
                        top: `${certificateData.desc_y || 80}px`, 
                        width: "auto", 
                        maxWidth: "calc(100% - 40px)",
                        textAlign: certificateData.desc_align || 'left', 
                        fontFamily: certificateData.desc_font || 'Inter',
                        fontSize: `${certificateData.desc_size || 18}px`, 
                        color: certificateData.desc_color || '#000000',
                        whiteSpace: 'pre-line',
                        position: 'absolute',
                        zIndex: 10
                      }}
                    >
                      <div className="opacity-90">{certificateData.description}</div>
                    </div>
                  )}

                  {/* Date Overlay */}
                  {!certificateData.preview_image && certificateData.issued_at && (
                    <div
                      className="absolute"
                      style={{ 
                        left: `${certificateData.date_x || 50}px`, 
                        top: `${certificateData.date_y || 110}px`, 
                        width: "auto", 
                        maxWidth: "calc(100% - 40px)",
                        textAlign: certificateData.date_align || 'left', 
                        fontFamily: certificateData.date_font || 'Inter',
                        fontSize: `${certificateData.date_size || 14}px`, 
                        color: certificateData.date_color || '#000000',
                        position: 'absolute',
                        zIndex: 10
                      }}
                    >
                      <div className="mt-1 opacity-80">
                        {new Date(certificateData.issued_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}

                  {/* Number Overlay */}
                  {!certificateData.preview_image && certificateData.number && (
                    <div
                      className="absolute"
                      style={{
                        left: `${certificateData.number_x || 370}px`,
                        top: `${certificateData.number_y || 300}px`,
                        width: 'auto',
                        maxWidth: 'calc(100% - 40px)',
                        textAlign: certificateData.number_align || 'center',
                        fontFamily: certificateData.number_font || 'Inter',
                        fontSize: `${certificateData.number_size || 14}px`,
                        color: certificateData.number_color || '#000000',
                        position: 'absolute',
                        zIndex: 10
                      }}
                    >
                      <div className="opacity-90">{certificateData.number}</div>
                    </div>
                  )}

                  {/* Expired Overlay */}
                  {!certificateData.preview_image && certificateData.expires_at && (
                    <div
                      className="absolute"
                      style={{
                        left: `${certificateData.expires_x || 370}px`,
                        top: `${certificateData.expires_y || 360}px`,
                        width: 'auto',
                        maxWidth: 'calc(100% - 40px)',
                        textAlign: certificateData.expires_align || 'center',
                        fontFamily: certificateData.expires_font || 'Inter',
                        fontSize: `${certificateData.expires_size || 12}px`,
                        color: certificateData.expires_color || '#000000',
                        position: 'absolute',
                        zIndex: 10
                      }}
                    >
                      <div className="mt-1 opacity-80">
                        {new Date(certificateData.expires_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border border-gray-200 bg-black/5 rounded-lg p-8 text-center dark:border-white/10 dark:bg-white/5">
                    <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">{t('certificateNotFound')}</h3>
                    <p className="text-black/70 dark:text-white/70">{t('selectTemplateOrUpload')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons Container */}
          <div className="mt-6 p-4 rounded-lg border border-transparent">
            <div className="flex flex-wrap gap-3 justify-center">
          <button 
            onClick={async () => {
              try {
                // Always export using the saved PNG preview_image only
                if (!certificateData?.id) throw new Error('Invalid certificate id')
                const { data: certWithPreview, error: previewErr } = await supabase
                  .from('certificates')
                  .select('preview_image')
                  .eq('id', certificateData.id)
                  .single()
                if (previewErr || !certWithPreview?.preview_image) {
                  showToast('Preview image belum tersedia. Silakan buka halaman Admin, klik Save untuk menghasilkan PNG, lalu coba lagi.', 'error')
                  return
                }
                const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                  const im = new Image()
                  im.crossOrigin = 'anonymous'
                  im.onload = () => resolve(im)
                  im.onerror = reject
                  const url = certWithPreview.preview_image + (certWithPreview.preview_image.includes('?') ? '&' : '?') + 'v=' + Date.now()
                  im.src = url
                })
                const w = img.naturalWidth || img.width
                const h = img.naturalHeight || img.height
                const pdf = new jsPDF({ orientation: w >= h ? 'landscape' : 'portrait', unit: 'px', format: [w, h] })
                pdf.addImage(img, 'PNG', 0, 0, w, h)
                pdf.save(`certificate_${certificateData.number || certificateData.id}.pdf`)
              } catch (error) {
                console.error('Export failed:', error)
                showToast('Failed to export PDF: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error')
              }
            }}
            className="rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm"
          >
            {t('exportPdf')}
          </button>
          <button 
            onClick={async () => {
              try {
                // Get the preview container
                const previewContainer = document.querySelector('[data-preview-container="check"]') as HTMLElement
                if (!previewContainer) {
                  showToast('Preview container not found', 'error')
                  return
                }

                // Get the template image
                const templateImg = document.querySelector('[data-preview-image]') as HTMLImageElement
                if (!templateImg) {
                  showToast('Template image not found', 'error')
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

                // Try html2canvas first, fallback to manual rendering
                let canvas: HTMLCanvasElement
                try {
                  canvas = await html2canvas(previewContainer, {
                    backgroundColor: '#ffffff',
                    scale: 1,
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                    ignoreElements: (element) => {
                      // Skip elements with unsupported CSS properties
                      const style = window.getComputedStyle(element)
                      return false // All colors are now compatible
                    }
                  })
                } catch (html2canvasError) {
                  console.warn('html2canvas failed, using manual rendering:', html2canvasError)
                  
                  // Fallback to manual canvas rendering
                  const templateImg = document.querySelector('[data-preview-image]') as HTMLImageElement
                  if (!templateImg) {
                    throw new Error('Template image not found')
                  }

                  // Wait for image to load
                  await new Promise((resolve) => {
                    if (templateImg.complete) {
                      resolve(true)
                    } else {
                      templateImg.onload = () => resolve(true)
                    }
                  })

                  // Create canvas with original image dimensions
                  canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')
                  if (!ctx) throw new Error('Canvas context not available')

                  canvas.width = templateImg.naturalWidth
                  canvas.height = templateImg.naturalHeight

                  // Draw the base image (template or preview)
                  ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height)

                  const isPreviewPng = Boolean(certificateData.preview_image)

                  // If preview_image already exists, it already contains all texts; skip manual overlays
                  if (!isPreviewPng) {
                  // Helper function to draw text
                  const drawText = (text: string, x: number, y: number, size: number, color: string, align: string, font: string, bold = false) => {
                    if (!text) return
                    
                    ctx.fillStyle = color
                    ctx.font = `${bold ? 'bold ' : ''}${size}px ${font}`
                    ctx.textAlign = align as CanvasTextAlign
                    ctx.textBaseline = 'top'
                    
                    // Use coordinates directly without scaling
                    ctx.fillText(text, x, y)
                  }

                  // Draw title
                  if (certificateData.title) {
                    drawText(
                      certificateData.title,
                      certificateData.title_x || 370,
                      certificateData.title_y || 180,
                      certificateData.title_size || 32,
                      certificateData.title_color || "#000000",
                      certificateData.title_align || "center",
                      certificateData.title_font || "Inter, ui-sans-serif, system-ui",
                      true
                    )
                  }

                  // Draw description (match preview defaults)
                  if (certificateData.description) {
                    drawText(
                      certificateData.description,
                      certificateData.desc_x || 50,
                      certificateData.desc_y || 80,
                      certificateData.desc_size || 15,
                      certificateData.desc_color || "#000000",
                      certificateData.desc_align || "left",
                      certificateData.desc_font || "Inter, ui-sans-serif, system-ui"
                    )
                  }

                  // Draw date (match preview defaults)
                  if (certificateData.issued_at) {
                    const dateText = new Date(certificateData.issued_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    drawText(
                      dateText,
                      certificateData.date_x || 50,
                      certificateData.date_y || 110,
                      certificateData.date_size || 14,
                      certificateData.date_color || "#000000",
                      certificateData.date_align || "left",
                      certificateData.date_font || "Inter, ui-sans-serif, system-ui"
                    )
                  }

                  // Draw number
                  if (certificateData.number) {
                    drawText(
                      certificateData.number,
                      certificateData.number_x || 370,
                      certificateData.number_y || 300,
                      certificateData.number_size || 14,
                      certificateData.number_color || "#000000",
                      certificateData.number_align || "center",
                      certificateData.number_font || "Inter, ui-sans-serif, system-ui"
                    )
                  }

                  // Draw expired
                  if (certificateData.expires_at) {
                    const expText = new Date(certificateData.expires_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    drawText(
                      expText,
                      certificateData.expires_x || 370,
                      certificateData.expires_y || 360,
                      certificateData.expires_size || 12,
                      certificateData.expires_color || "#000000",
                      certificateData.expires_align || "center",
                      certificateData.expires_font || "Inter, ui-sans-serif, system-ui"
                    )
                  }
                  } // end if !isPreviewPng
                }

                // Convert canvas to blob
                const blob = await new Promise<Blob>((resolve) => {
                  canvas.toBlob((blob) => {
                    if (blob) resolve(blob)
                  }, 'image/jpeg', 0.8)
                })
                
                // Upload to Supabase Storage
                const fileName = `certificate_${certificateData.id}_${Date.now()}.jpg`
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
                
                // Create email content
                const subject = `Sertifikat ${certificateData.title || certificateData.name || 'Digital'}`
                const body = `Halo,

Berikut adalah sertifikat digital Anda:

📜 **Detail Sertifikat:**
• Judul: ${certificateData.title || certificateData.name || '-'}
• Nomor: ${certificateData.number || '-'}
• Kategori: ${certificateData.category || '-'}
• Tanggal: ${certificateData.issued_at ? new Date(certificateData.issued_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}

🔗 **Link Sertifikat:** ${publicUrl}

Sertifikat ini dapat dibuka dan dibagikan melalui link di atas.

Terima kasih.`

                // Open email client
                const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                window.open(mailtoUrl, '_blank')
                
                // Show success toast
                showToast('Email client dibuka dengan link sertifikat!', 'success')
                
              } catch (error) {
                console.error('Send email failed:', error)
                showToast('Gagal mengirim email: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error')
              }
            }}
            className="rounded-md border border-gray-300 bg-black/5 hover:bg-black/10 px-4 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            Send Email
          </button>
          <button 
            onClick={async () => {
              try {
                // Prefer using the saved preview PNG to avoid duplicate text
                if (certificateData?.id) {
                  const { data: latest, error: latestErr } = await supabase
                    .from('certificates')
                    .select('preview_image')
                    .eq('id', certificateData.id)
                    .single()
                  if (!latestErr && latest?.preview_image) {
                    // Copy the preview image public URL directly
                    await navigator.clipboard.writeText(latest.preview_image)
                    showToast('Link gambar pratinjau berhasil disalin!', 'success')
                    return
                  }
                }

                // Fallback: render from DOM
                // Get the preview container
                const previewContainer = document.querySelector('[data-preview-container="check"]') as HTMLElement
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

                // Try html2canvas first, fallback to manual rendering
                let canvas: HTMLCanvasElement
                try {
                  canvas = await html2canvas(previewContainer, {
                    backgroundColor: '#ffffff',
                    scale: 1,
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                    ignoreElements: (element) => {
                      // Skip elements with unsupported CSS properties
                      const style = window.getComputedStyle(element)
                      return false // All colors are now compatible
                    }
                  })
                } catch (html2canvasError) {
                  console.warn('html2canvas failed, using manual rendering:', html2canvasError)
                  
                  // Fallback to manual canvas rendering
                  const templateImg = document.querySelector('[data-preview-image]') as HTMLImageElement
                  if (!templateImg) {
                    throw new Error('Template image not found')
                  }

                  // Wait for image to load
                  await new Promise((resolve) => {
                    if (templateImg.complete) {
                      resolve(true)
                    } else {
                      templateImg.onload = () => resolve(true)
                    }
                  })

                  // Create canvas with original image dimensions
                  canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')
                  if (!ctx) throw new Error('Canvas context not available')

                  canvas.width = templateImg.naturalWidth
                  canvas.height = templateImg.naturalHeight

                  // Draw the template image
                  ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height)

                  // Helper function to draw text
                  const drawText = (text: string, x: number, y: number, size: number, color: string, align: string, font: string, bold = false) => {
                    if (!text) return
                    
                    ctx.fillStyle = color
                    ctx.font = `${bold ? 'bold ' : ''}${size}px ${font}`
                    ctx.textAlign = align as CanvasTextAlign
                    ctx.textBaseline = 'top'
                    
                    // Use coordinates directly without scaling
                    ctx.fillText(text, x, y)
                  }

                  // Draw title
                  if (certificateData.title) {
                    drawText(
                      certificateData.title,
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
                    certificateData.desc_x || 50,
                    certificateData.desc_y || 200,
                      certificateData.desc_size || 15,
                      certificateData.desc_color || "#000000",
                      certificateData.desc_align || "left",
                      certificateData.desc_font || "Inter, ui-sans-serif, system-ui"
                    )
                  }

                  // Draw date
                  if (certificateData.issued_at) {
                    const dateText = new Date(certificateData.issued_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    drawText(
                      dateText,
                    certificateData.date_x || 50,
                    certificateData.date_y || 80,
                      certificateData.date_size || 14,
                      certificateData.date_color || "#000000",
                      certificateData.date_align || "left",
                      certificateData.date_font || "Inter, ui-sans-serif, system-ui"
                    )
                  }
                }

                // Convert canvas to blob
                const blob = await new Promise<Blob>((resolve) => {
                  canvas.toBlob((blob) => {
                    if (blob) resolve(blob)
                  }, 'image/jpeg', 0.8)
                })
                
                // Upload to Supabase Storage
                const fileName = `certificate_${certificateData.id}_${Date.now()}.jpg`
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
            className="rounded-md border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm"
          >
            Copy Image Link
          </button>
          <button 
            onClick={async () => {
              try {
                const baseFromEnv = process.env.NEXT_PUBLIC_BASE_URL || ''
                const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : ''
                const base = (baseFromEnv || runtimeOrigin).replace(/\/$/, '')
                const code = certificateData?.number || no
                if (!base || !code) {
                  showToast('Gagal menyalin: data tidak lengkap', 'error')
                  return
                }
                const url = `${base}/cek/${code}`
                await navigator.clipboard.writeText(url)
                showToast('Link URL berhasil disalin!', 'success')
              } catch (error) {
                console.error('Copy URL failed:', error)
                showToast('Gagal menyalin link URL', 'error')
              }
            }}
            className="rounded-md border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm"
          >
            Copy Link URL
          </button>
            </div>
          </div>
        </section>
      </div>
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}
