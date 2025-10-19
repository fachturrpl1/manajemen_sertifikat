"use client"

import { useEffect, useRef, useState } from "react"

interface PreviewPanelProps {
  category: string
  previewSrc?: string
  title?: string
  description?: string
  titlePos: { x: number; y: number; size: number; color: string }
  descPos: { x: number; y: number; size: number; color: string }
  datePos: { x: number; y: number; size: number; color: string }
  expiredPos: { x: number; y: number; size: number; color: string }
  certNumberPos: { x: number; y: number; size: number; color: string }
  titleAlign: "left" | "center" | "right"
  descAlign: "left" | "center" | "right"
  dateAlign: "left" | "center" | "right"
  expiredAlign: "left" | "center" | "right"
  certNumberAlign: "left" | "center" | "right"
  titleFont: string
  descFont: string
  dateFont: string
  expiredFont: string
  certNumberFont: string
  issuedAt?: string
  expiresAt?: string
  certificateNumber?: string
  active: "title" | "description" | "date" | "expired_date" | "certificate_number"
  onDragPosition?: (x: number, y: number) => void
  onCommitPosition?: (x: number, y: number) => void
  useI18n?: boolean
}

export function PreviewPanel({
  category,
  previewSrc,
  title,
  description,
  titlePos,
  descPos,
  datePos,
  expiredPos,
  certNumberPos,
  titleAlign,
  descAlign,
  dateAlign,
  expiredAlign,
  certNumberAlign,
  titleFont,
  descFont,
  dateFont,
  expiredFont,
  certNumberFont,
  issuedAt,
  expiresAt,
  certificateNumber,
  active,
  onDragPosition,
  onCommitPosition,
  useI18n = false
}: PreviewPanelProps) {
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
    if (!previewSrc) return
    const img = new Image()
    img.onload = () => {
      setImageRatio(img.naturalWidth / img.naturalHeight)
    }
    img.src = previewSrc
  }, [previewSrc])

  const clampX = (x: number) => {
    // Return original position without clamping to match edit mode
    return x
  }
  const clampY = (y: number) => {
    // Return original position without clamping to match edit mode
    return y
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onDragPosition || !onCommitPosition) return
    e.preventDefault()
    setDragging(true)
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)
    onDragPosition(clampX(x), clampY(y))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !onDragPosition) return
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)
    onDragPosition(clampX(x), clampY(y))
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragging || !onCommitPosition) return
    e.preventDefault()
    setDragging(false)
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)
    onCommitPosition(clampX(x), clampY(y))
  }

  const getPreviewText = () => {
    if (useI18n) {
      return {
        preview: "Certificate Preview",
        categorySelected: "Category Selected",
        noCategorySelected: "No Category Selected",
        issuedDate: "Issued Date",
        expiredDate: "Expired Date",
        certificateNumber: "Certificate Number"
      }
    }
    return {
      preview: "Preview Sertifikat",
      categorySelected: "Kategori Terpilih",
      noCategorySelected: "Belum Ada Kategori",
      issuedDate: "Tanggal Terbit",
      expiredDate: "Tanggal Expired",
      certificateNumber: "Nomor Sertifikat"
    }
  }

  const text = getPreviewText()

  return (
    <section className="rounded-xl border border-white/10 bg-[#0d172b] p-6 shadow-xl shadow-blue-500/10 min-h-[420px]">
      <h2 className="text-3xl font-bold text-blue-400 mb-4 text-center">{text.preview}</h2>
      <div
        ref={containerRef}
        className="relative w-full bg-white rounded-lg overflow-hidden"
        style={{
          aspectRatio: imageRatio ? `${imageRatio}` : 'auto',
          minHeight: '300px',
          maxHeight: '600px'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {previewSrc && (
          <img
            src={previewSrc}
            alt="Certificate Preview"
            className="w-full h-full object-contain"
            draggable={false}
          />
        )}
        
        {/* Title */}
        {title && (
          <div
            className={`absolute text-black cursor-move select-none ${
              active === 'title' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
            style={{
              left: `${titlePos.x}px`,
              top: `${titlePos.y}px`,
              fontSize: `${titlePos.size}px`,
              color: titlePos.color,
              fontFamily: titleFont,
              textAlign: titleAlign,
              transform: titleAlign === "center" ? "translateX(-50%)" : titleAlign === "right" ? "translateX(-100%)" : undefined,
              zIndex: 10,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: 'none',
              maxWidth: '300px'
            }}
          >
            {title}
          </div>
        )}
        
        {/* Description */}
        {description && (
          <div
            className={`absolute text-black cursor-move select-none ${
              active === 'description' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
            style={{
              left: `${descPos.x}px`,
              top: `${descPos.y}px`,
              fontSize: `${descPos.size}px`,
              color: descPos.color,
              fontFamily: descFont,
              textAlign: descAlign,
              transform: descAlign === "center" ? "translateX(-50%)" : descAlign === "right" ? "translateX(-100%)" : undefined,
              zIndex: 10,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: 'none',
              maxWidth: '300px',
              whiteSpace: 'pre-line'
            }}
          >
            {description}
          </div>
        )}
        
        {/* Date */}
        {issuedAt && (
          <div
            className={`absolute text-black cursor-move select-none ${
              active === 'date' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
            style={{
              left: `${datePos.x}px`,
              top: `${datePos.y}px`,
              fontSize: `${datePos.size}px`,
              color: datePos.color,
              fontFamily: dateFont,
              textAlign: dateAlign,
              transform: dateAlign === "center" ? "translateX(-50%)" : dateAlign === "right" ? "translateX(-100%)" : undefined,
              zIndex: 10,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: 'none',
              maxWidth: '300px'
            }}
          >
            {issuedAt}
          </div>
        )}
        
        {/* Expired Date */}
        {expiresAt && (
          <div
            className={`absolute text-black cursor-move select-none ${
              active === 'expired_date' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
            style={{
              left: `${expiredPos.x}px`,
              top: `${expiredPos.y}px`,
              fontSize: `${expiredPos.size}px`,
              color: expiredPos.color,
              fontFamily: expiredFont,
              textAlign: expiredAlign,
              transform: expiredAlign === "center" ? "translateX(-50%)" : expiredAlign === "right" ? "translateX(-100%)" : undefined,
              zIndex: 10,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: 'none',
              maxWidth: '300px'
            }}
          >
            Expired: {expiresAt}
          </div>
        )}
        
        {/* Certificate Number */}
        {certificateNumber && (
          <div
            className={`absolute text-black cursor-move select-none ${
              active === 'certificate_number' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
            style={{
              left: `${certNumberPos.x}px`,
              top: `${certNumberPos.y}px`,
              fontSize: `${certNumberPos.size}px`,
              color: certNumberPos.color,
              fontFamily: certNumberFont,
              textAlign: certNumberAlign,
              transform: certNumberAlign === "center" ? "translateX(-50%)" : certNumberAlign === "right" ? "translateX(-100%)" : undefined,
              zIndex: 10,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: 'none',
              maxWidth: '300px'
            }}
          >
            No: {certificateNumber}
          </div>
        )}
      </div>
    </section>
  )
}
