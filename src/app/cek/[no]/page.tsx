"use client"

import { useRouter } from "next/navigation"
import { use, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useI18n } from "@/lib/i18n"
import { Globe } from "lucide-react"

type Props = { params: Promise<{ no: string }> }

export default function CheckCertificatePage({ params }: Props) {
  const { no } = use(params)
  const router = useRouter()
  const { t, locale, setLocale } = useI18n()
  const [memberData, setMemberData] = useState<any>(null)
  const [certificateData, setCertificateData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
      <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !certificateData) {
  return (
    <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
        <div className="absolute right-6 top-6 z-20">
          {/* Language Toggle Button */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
            className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 transition-colors"
            title={locale === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
          >
            <Globe className="h-4 w-4" />
            <span className="font-medium">{locale === 'en' ? 'EN' : 'ID'}</span>
          </button>
        </div>
      <button
          onClick={() => router.back()}
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
    <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
      <div className="absolute right-6 top-6 z-20">
        {/* Language Toggle Button */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
          className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 transition-colors"
          title={locale === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium">{locale === 'en' ? 'EN' : 'ID'}</span>
        </button>
      </div>
      
      <button
        onClick={() => router.back()}
        aria-label="Back"
        className="ml-8 mt-8 mb-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="mx-auto max-w-6xl px-4 md:px-0 py-6">

        {/* Certificate Preview */}
        <section className="rounded-xl border border-white/10 bg-[#0d172b] p-6 shadow-xl shadow-blue-500/10 min-h-[420px]">
          <h2 className="text-3xl font-bold text-blue-400 mb-4 text-center">{t('certificatePreview')}</h2>
          <div className="text-white/80 text-sm mb-2 text-center">
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
              className="mt-4 rounded-lg border border-white/10 bg-white/5 relative overflow-hidden"
              style={{
                position: 'relative',
                contain: 'layout style paint',
                willChange: 'transform',
                width: '100%',
                maxWidth: '600px',
                height: '420px',
                minHeight: '420px',
                maxHeight: '420px',
                aspectRatio: '4/3',
                margin: '0 auto'
              }}
            >
              {certificateData && certificateData.template_path ? (
                <>
                  <img
                    src={`/${certificateData.template_path}`}
                    alt="Certificate Template"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  
                  {/* Title Overlay */}
                  {certificateData.title && (
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
                      <div className="font-bold">{certificateData.title}</div>
                    </div>
                  )}

                  {/* Description Overlay */}
                  {certificateData.description && (
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
                  {certificateData.issued_at && (
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
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold mb-2">{t('certificateNotFound')}</h3>
                    <p className="text-white/70">{t('selectTemplateOrUpload')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Certificate Details */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{t('certificateDetails')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-sm">{t('title')}</p>
              <p className="font-medium">{certificateData.title || '-'}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">{t('category')}</p>
              <p className="font-medium">{certificateData.category || '-'}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Nomor</p>
              <p className="font-medium">{certificateData.number || '-'}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">{t('description')}</p>
              <p className="font-medium">{certificateData.description || '-'}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">{t('date')}</p>
              <p className="font-medium">
                {certificateData.issued_at ? new Date(certificateData.issued_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
              </p>
            </div>
            {memberData && (
              <>
                <div>
                  <p className="text-white/70 text-sm">{t('name')}</p>
                  <p className="font-medium">{memberData.name}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Instansi Penerima</p>
                  <p className="font-medium">{memberData.instansi_penerima}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Penerbit</p>
                  <p className="font-medium">{memberData.penerbit}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Tanggal Terbit</p>
                  <p className="font-medium">
                    {memberData.tanggal_terbit ? new Date(memberData.tanggal_terbit).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button className="rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm">
            {t('exportPdf')}
          </button>
          <button className="rounded-md border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm">
            Send Email
          </button>
          <button className="rounded-md border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm">
            Copy Link
          </button>
        </div>
      </div>
    </div>
  )
}


