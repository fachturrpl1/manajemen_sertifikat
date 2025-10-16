export function ManageContent() {
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Manajemen Sertifikat</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-md border border-blue-600/50 bg-blue-600/10 px-3 py-2 text-sm hover:bg-blue-600/20">
          + Baru
        </button>
        <button className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
          Import
        </button>
        <div className="ml-2 flex-1">
          <div className="relative">
            <input
              placeholder="Pencarian"
              className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
            />
            <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-white/5" />
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-[#0d172b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-white/70">
                <th className="px-4 py-3 font-medium">NAMA</th>
                <th className="px-4 py-3 font-medium">NOMOR</th>
                <th className="px-4 py-3 font-medium">KATEGORI</th>
                <th className="px-4 py-3 font-medium">INSTANSI PENERIMA</th>
                <th className="px-4 py-3 font-medium">PENERBIT</th>
                <th className="px-4 py-3 font-medium">TANGGAL TERBIT</th>
                <th className="px-4 py-3 font-medium">TANGGAL KADALUARSA</th>
                <th className="px-4 py-3 font-medium">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-white/50">
                  Belum ada data untuk ditampilkan
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-sm">
          <div className="text-white/50">Menampilkan 0 dari 0</div>
          <div className="flex items-center gap-2">
            <button className="rounded-md border border-white/10 bg-white/5 px-2 py-1 disabled:opacity-40" disabled>{"<<"}</button>
            <button className="rounded-md border border-white/10 bg-white/5 px-2 py-1 disabled:opacity-40" disabled>{"<"}</button>
            <span className="inline-flex min-w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 py-1">1</span>
            <button className="rounded-md border border-white/10 bg-white/5 px-2 py-1 disabled:opacity-40" disabled>{">"}</button>
            <button className="rounded-md border border-white/10 bg-white/5 px-2 py-1 disabled:opacity-40" disabled>{">>"}</button>
          </div>
        </div>
      </section>
    </main>
  )
}


