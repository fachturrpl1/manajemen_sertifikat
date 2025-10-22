"use client"

import { useI18n } from "@/lib/i18n"
import jsPDF from "jspdf"
import { supabase } from "@/lib/supabase"

interface CertificatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  previewSrc?: string
  title: string
  description: string
  issuedAt: string
  category: string
  certificateId?: string
  email?: string
  name?: string
  number?: string
  // Position and styling props
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
}

export function CertificatePreviewModal({
  isOpen,
  onClose,
  previewSrc,
  title,
  description,
  issuedAt,
  category,
  certificateId,
  email,
  name,
  number,
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
}: CertificatePreviewModalProps) {
  const { t } = useI18n()

  const handleExportPDF = async () => {
    if (!certificateId) return
    
    try {
      // Ambil preview image dari database
      const { data: certificateData, error } = await supabase
        .from('certificates')
        .select('preview_image')
        .eq('id', certificateId)
        .single()
      
      if (error) {
        console.error('Error fetching preview image:', error)
        alert('Gagal mengambil data sertifikat dari database')
        return
      }
      
      if (!certificateData?.preview_image) {
        alert('Preview image tidak tersedia. Silakan simpan sertifikat terlebih dahulu.')
        return
      }
      
      // Convert preview image langsung ke PDF
      const pdf = new jsPDF({ 
        orientation: 'landscape', 
        unit: 'mm', 
        format: 'a4' 
      })
      
      const pdfWidth = 297 // A4 width in mm
      const pdfHeight = 210 // A4 height in mm
      
      // Add image ke PDF dengan ukuran yang tepat
      pdf.addImage(certificateData.preview_image, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`certificate-${title || 'untitled'}-${Date.now()}.pdf`)
      
      console.log('PDF exported successfully using preview image from database')
      
    } catch (error) {
      console.error('Export error:', error)
      alert('Gagal mengexport PDF. Silakan coba lagi.')
    }
  }

  const handleCopyLink = async () => {
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      const link = number ? `${base}/cek/${encodeURIComponent(number)}` : ''
      if (link) {
        await navigator.clipboard.writeText(link)
        alert('Link berhasil disalin!')
      } else {
        alert('Link pratinjau tidak tersedia')
      }
    } catch (e) {
      console.error('copy link failed:', e)
      alert('Gagal menyalin link')
    }
  }

  const handleCopyImageLink = async () => {
    try {
      if (!certificateId) {
        alert('Certificate ID tidak tersedia')
        return
      }
      const { data, error } = await supabase
        .from('certificates')
        .select('preview_image')
        .eq('id', certificateId)
        .single()
      if (error || !data?.preview_image) {
        alert('Preview image tidak tersedia. Silakan simpan sertifikat terlebih dahulu.')
        return
      }
      await navigator.clipboard.writeText(data.preview_image)
      alert('Link gambar berhasil disalin!')
    } catch (e) {
      console.error('copy image link failed:', e)
      alert('Gagal menyalin link gambar')
    }
  }

  const handleSendEmail = async () => {
    try {
      if (!number) {
        alert('Nomor sertifikat tidak tersedia')
        return
      }

      // Get preview image URL
      let imageUrl = ''
      if (certificateId) {
        const { data: certificateData, error } = await supabase
          .from('certificates')
          .select('preview_image')
          .eq('id', certificateId)
          .single()
        
        if (!error && certificateData?.preview_image) {
          imageUrl = certificateData.preview_image
        }
      }

      // Create email content like in cek page
      const subject = `Sertifikat ${title || name || 'Digital'}`
      const body = `Halo${name ? ' ' + name : ''},

Berikut adalah sertifikat digital Anda:

📜 **Detail Sertifikat:**
• Judul: ${title || name || '-'}
• Nomor: ${number || '-'}
• Kategori: ${category || '-'}
• Tanggal: ${issuedAt ? new Date(issuedAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '-'}

🔗 **Link Sertifikat:** ${imageUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/cek/${encodeURIComponent(number)}`}

Sertifikat ini dapat dibuka dan dibagikan melalui link di atas.

Terima kasih.`

      // Open email client
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.open(mailtoUrl, '_blank')
      
      // Show success alert
      alert('Email client dibuka dengan link sertifikat!')
      
    } catch (error) {
      console.error('Send email failed:', error)
      alert('Gagal mengirim email: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl rounded-xl border border-white/10 bg-[#0d1223] p-6 text-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-semibold">{t('previewCertificate')}</div>
            <button 
              onClick={onClose} 
              className="rounded-md border border-white/10 bg-white/5 p-1" 
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          
           <div className="space-y-4">
             {/* Header Title - Sama dengan PreviewPanel */}
             <h2 className="text-3xl font-bold text-blue-400 mb-4 text-center">{t('certificatePreview')}</h2>
             
             {/* Header Information - Sama dengan PreviewPanel */}
             <div className="space-y-2 mb-4">
               <div className="text-white/80 text-sm mb-2">{category ? `${t('categorySelected')}: ${category}` : t('noCategorySelected')}</div>
               {issuedAt && (
                 <div className="text-green-400/80 text-xs mb-2 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                   {t('integratedDate')}: {new Date(issuedAt).toLocaleDateString('id-ID', {
                     year: 'numeric',
                     month: 'long',
                     day: 'numeric'
                   })}
                 </div>
               )}
             </div>
             
             {/* Pratinjau Visual Sertifikat - Sama dengan PreviewPanel */}
             <div className="flex justify-center items-center">
               <div className="mt-4 rounded-lg border border-white/10 bg-white/5 relative overflow-hidden" style={{ 
                 aspectRatio: '4/3', 
                 height: '420px',
                 width: '100%',
                 maxWidth: '600px',
                 position: 'relative',
                 contain: 'layout style paint',
                 willChange: 'transform',
                 margin: '0 auto'
               }} data-preview-container="modal">
                 {/* Template Background */}
                 {previewSrc ? (
                   previewSrc.endsWith(".pdf") ? (
                     <object data={previewSrc} type="application/pdf" className="w-full h-full" />
                   ) : (
                     <img 
                       src={previewSrc} 
                       alt="Certificate Template" 
                       className="absolute inset-0 w-full h-full object-contain"
                       data-preview-image
                     />
                   )
                 ) : (
                   <div className="absolute inset-0 grid place-items-center text-white/60">{t('selectTemplateOrUpload')}</div>
                 )}
                 
                 {/* Overlay Text Container */}
                 <div className="absolute inset-0" style={{ position: 'relative' }}>
                   {/* Title */}
                   {title && (
                     <div 
                       className="absolute font-bold text-black"
                       style={{
                         left: `${titleX}px`, 
                         top: `${titleY}px`, 
                         width: "calc(100% - 40px)", 
                         transform: titleAlign === "center" ? "translateX(-50%)" : titleAlign === "right" ? "translateX(-100%)" : undefined, 
                         textAlign: titleAlign, 
                         fontFamily: titleFont, 
                         fontSize: `${titleSize}px`, 
                         color: titleColor,
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
                       {title}
                     </div>
                   )}
                   
                   {/* Description */}
                   {description && (
                     <div 
                       className="absolute text-black"
                       style={{
                         left: `${descX}px`, 
                         top: `${descY}px`, 
                         width: "calc(100% - 40px)", 
                         transform: descAlign === "center" ? "translateX(-50%)" : descAlign === "right" ? "translateX(-100%)" : undefined, 
                         textAlign: descAlign, 
                         fontFamily: descFont, 
                         fontSize: `${descSize}px`, 
                         color: descColor,
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
                       {description}
                     </div>
                   )}
                   
                   {/* Date */}
                   {issuedAt && (
                     <div 
                       className="absolute text-black"
                       style={{
                         left: `${dateX}px`, 
                         top: `${dateY}px`, 
                         width: "calc(100% - 40px)", 
                         transform: dateAlign === "center" ? "translateX(-50%)" : dateAlign === "right" ? "translateX(-100%)" : undefined, 
                         textAlign: dateAlign, 
                         fontFamily: dateFont, 
                         fontSize: `${dateSize}px`, 
                         color: dateColor,
                         position: 'absolute',
                         zIndex: 10,
                         willChange: 'transform',
                         backfaceVisibility: 'hidden',
                         WebkitBackfaceVisibility: 'hidden',
                         pointerEvents: 'none',
                         whiteSpace: 'nowrap'
                       }}
                     >
                       {new Date(issuedAt).toLocaleDateString('id-ID', {
                         year: 'numeric',
                         month: 'long',
                         day: 'numeric'
                       })}
                     </div>
                   )}
                 </div>
               </div>
             </div>
             
             {/* Detail Info */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 relative">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">{t('certificateDetails')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <span className="text-white/70">{t('name')}:</span>
                  <span className="ml-2 text-white">{title || t('noName')}</span>
                </div>
                <div>
                  <span className="text-white/70">{t('date')}:</span>
                  <span className="ml-2 text-white">{issuedAt ? new Date(issuedAt).toLocaleDateString('id-ID') : t('noDateAvailable')}</span>
                </div>
                <div>
                  <span className="text-white/70">{t('category')}:</span>
                  <span className="ml-2 text-white">{category || "-"}</span>
                </div>
                <div>
                  <span className="text-white/70">{t('description')}:</span>
                  <span className="ml-2 text-white">{description || "-"}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm hover:bg-blue-500/20 disabled:opacity-50"
                  onClick={handleExportPDF}
                  disabled={!previewSrc}
                >
                  Download PDF
                </button>
                <button
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                  onClick={handleCopyImageLink}
                  disabled={!certificateId}
                >
                  Copy Image Link
                </button>
                <button
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                  onClick={handleCopyLink}
                  disabled={!number}
                >
                  Copy Link
                </button>
                <button
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                  onClick={handleSendEmail}
                  disabled={!number}
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
