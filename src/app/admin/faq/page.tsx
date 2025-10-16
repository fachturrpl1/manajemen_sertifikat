import { AdminNavbar } from "@/components/admin-navbar"

export default function AdminFaqPage() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
      <AdminNavbar />
      <main className="mx-auto max-w-4xl px-4 md:px-6 py-10 space-y-6">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-white/70 mt-2">Jawaban cepat untuk pertanyaan umum dari Admin.</p>
        </header>

        <section className="space-y-4">
          <details className="rounded-lg border border-white/10 bg-[#0d172b] p-4 open:shadow-md open:shadow-blue-500/10">
            <summary className="cursor-pointer select-none text-blue-400 font-medium">Bagaimana menambah sertifikat baru?</summary>
            <p className="mt-2 text-white/80">Buka menu Manage lalu klik “+ Baru”, isi form, dan simpan.</p>
          </details>
          <details className="rounded-lg border border-white/10 bg-[#0d172b] p-4 open:shadow-md open:shadow-blue-500/10">
            <summary className="cursor-pointer select-none text-blue-400 font-medium">Bisakah impor massal dari Excel?</summary>
            <p className="mt-2 text-white/80">Ya, gunakan tombol Import di halaman Manage lalu ikuti format yang disediakan.</p>
          </details>
          <details className="rounded-lg border border-white/10 bg-[#0d172b] p-4 open:shadow-md open:shadow-blue-500/10">
            <summary className="cursor-pointer select-none text-blue-400 font-medium">Bagaimana mengatur template per kategori?</summary>
            <p className="mt-2 text-white/80">Setel template pada pengaturan kategori agar penerbitan mengikuti desain tersebut.</p>
          </details>
        </section>
      </main>
    </div>
  )
}



