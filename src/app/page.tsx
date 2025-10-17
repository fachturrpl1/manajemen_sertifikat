import Link from "next/link"

export default function AuPage() {
  return (
    <div className="relative min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
      <div className="absolute left-6 top-6 z-20">
        <a href="#" className="flex items-center gap-2 font-medium">
          <div className="bg-blue-600 text-primary-white flex size-7 items-center justify-center rounded-md">
            S
          </div>
          <span className="text-lg font-semibold tracking-wide">
            <span className="text-white">Sertiku</span>
            <span className="text-blue-400">.co.id</span>
          </span>
        </a>
      </div>
      <div className="absolute right-6 top-6 z-20">
        <Link href="/login" className="text-sm text-blue-400 hover:text-white">Login</Link>
      </div>
    
      {/* subtle pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10)_1px,_transparent_1px)] [background-size:28px_28px] opacity-60"
      />

      <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Pembuat & Manajemen Member Online
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Rancang, terbitkan, dan kelola sertifikat untuk MoU, Magang, Pelatihan,
            dan Kunjungan Industri. Pilih template, atur posisi nama/QR secara dinamis,
            unduh PDF, dan kirim lewat email—semuanya dalam satu tempat.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <a
              href="/all"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500"
            >
              Coba Verifikasi Publik
            </a>
          </div>

          <p className="mt-3 text-xs text-white/50">* Tidak diperlukan kartu kredit</p>
        </div>

        <div className="relative">
          {/* mock preview area */}
          <div className="rounded-2xl border border-white/10 bg-[#0d172b] p-4 shadow-xl shadow-blue-500/10">
            <div className="aspect-[16/10] w-full rounded-lg border border-white/10 bg-white/5" />
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/70">
              <div className="rounded-md border border-white/10 bg-white/5 p-2">Otomasi PDF & Email Sertifikat</div>
              <div className="rounded-md border border-white/10 bg-white/5 p-2">Verifikasi Publik via URL Unik</div>
              <div className="rounded-md border border-white/10 bg-white/5 p-2">Template Dinamis (Portrait/Landscape)</div>
              <div className="rounded-md border border-white/10 bg-white/5 p-2">Import Massal dari Excel</div>
              <div className="rounded-md border border-white/10 bg-white/5 p-2">Akses Peran: Admin & Team</div>
              <div className="rounded-md border border-white/10 bg-white/5 p-2">Multibahasa: English & Indonesia</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


