"use client"

import { TeamNavbar } from "@/components/team-navbar"
import { useI18n } from "@/lib/i18n"

export default function TeamFaqPage() {
  const { locale } = useI18n()
  const isEN = locale === 'en'
  return (
    <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
      <TeamNavbar />
      <main className="mx-auto max-w-4xl px-4 md:px-6 py-10 space-y-6">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">{isEN ? "Frequently Asked Questions" : "Pertanyaan yang Sering Diajukan"}</h1>
          <p className="text-white/70 mt-2">{isEN ? "Quick answers to common questions for Team." : "Jawaban cepat untuk pertanyaan umum dari Team."}</p>
        </header>

        <section className="space-y-4">
          <details className="rounded-lg border border-white/10 bg-[#0d172b] p-4 open:shadow-md open:shadow-blue-500/10">
            <summary className="cursor-pointer select-none text-blue-400 font-medium">{isEN ? "How to edit certificate data?" : "Bagaimana mengedit data sertifikat?"}</summary>
            <p className="mt-2 text-white/80">{isEN ? "Open the Manage page, find the certificate, then choose Edit action." : "Buka halaman Manage, cari sertifikat lalu pilih aksi Edit."}</p>
          </details>
          <details className="rounded-lg border border-white/10 bg-[#0d172b] p-4 open:shadow-md open:shadow-blue-500/10">
            <summary className="cursor-pointer select-none text-blue-400 font-medium">{isEN ? "Can I delete certificates?" : "Bisakah menghapus sertifikat?"}</summary>
            <p className="mt-2 text-white/80">{isEN ? "No. Team role does not have permission to delete certificates." : "Tidak. Role Team tidak memiliki izin untuk menghapus sertifikat."}</p>
          </details>
          <details className="rounded-lg border border-white/10 bg-[#0d172b] p-4 open:shadow-md open:shadow-blue-500/10">
            <summary className="cursor-pointer select-none text-blue-400 font-medium">{isEN ? "How to resend certificate email?" : "Bagaimana kirim ulang email sertifikat?"}</summary>
            <p className="mt-2 text-white/80">{isEN ? "Open certificate details, choose Send Email, and fill in the recipient address." : "Buka detail sertifikat, pilih aksi Kirim Email dan isi alamat tujuan."}</p>
          </details>
        </section>
      </main>
    </div>
  )
}




