"use client"

import { useI18n } from "@/lib/i18n"
import jsPDF from "jspdf"

interface CertificatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  previewSrc?: string
  title: string
  description: string
  issuedAt: string
  category: string
  certificateId?: string
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
    const container = document.querySelector('[data-preview-container="modal"]') as HTMLElement | null
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
    const toAlign = (a: string): CanvasTextAlign => a as CanvasTextAlign
    const drawText = (text: string, x: number, y: number, size: number, color: string, align: string, font: string) => {
      ctx.font = `${size * scale}px ${font}`
      ctx.fillStyle = color
      ctx.textAlign = toAlign(align)
      ctx.fillText(text, x * scale, y * scale)
    }
    
    // teks overlay
    if (title) drawText(title, titleX, titleY, titleSize, titleColor, titleAlign, titleFont)
    if (description) drawText(description, descX, descY, descSize, descColor, descAlign, descFont)
    if (issuedAt) drawText(new Date(issuedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }), dateX, dateY, dateSize, dateColor, dateAlign, dateFont)
    
    // export
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210)
    pdf.save(`certificate-${title || 'untitled'}-${Date.now()}.pdf`)
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
                  <span className="text-white/70">{t('title')}:</span>
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
                  📄 {t('exportPdf')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
