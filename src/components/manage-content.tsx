"use client"

import { useMemo, useRef, useState } from "react"
import { Eye, Pencil, Trash2, X } from "lucide-react"
import { ModalOverlay, ModalContent } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { useEffect } from "react"

type CertificateRow = {
  id?: string
  name?: string
  number?: string
  category?: string
  recipientOrg?: string
  issuer?: string
  issuedAt?: string
  expiresAt?: string
}

type ManageContentProps = {
  role?: "admin" | "team"
}

export function ManageContent({ role = "admin" }: ManageContentProps) {
  const [rows, setRows] = useState<CertificateRow[]>([])
  const [query, setQuery] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draft, setDraft] = useState<CertificateRow | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("id,name,number,category,recipient_org,issuer,issued_at,expires_at")
      if (error) {
        console.error("Supabase certificates fetch error:", error)
        return
      }
      const mapped: CertificateRow[] = (data ?? []).map((r: any) => ({
        id: r.id,
        name: r.name,
        number: r.number,
        category: r.category,
        recipientOrg: r.recipient_org,
        issuer: r.issuer,
        issuedAt: r.issued_at ?? undefined,
        expiresAt: r.expires_at ?? undefined,
      }))
      setRows(mapped)
    })()
  }, [])

  const filteredRows = useMemo(() => {
    if (!query) return rows
    const q = query.toLowerCase()
    return rows.filter((r) =>
      [r.name, r.number, r.category, r.recipientOrg, r.issuer]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [rows, query])

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function parseDate(value: unknown): string | undefined {
    if (value == null || value === "") return undefined
    if (typeof value === "number") {
      try {
        const jsDate = XLSX.SSF.parse_date_code(value)
        if (jsDate) {
          const d = new Date(jsDate.y, jsDate.m - 1, jsDate.d)
          return d.toISOString().slice(0, 10)
        }
      } catch {
      }
    }
    const d = new Date(String(value))
    return isNaN(d.getTime()) ? String(value) : d.toISOString().slice(0, 10)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: "array" })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      })

      const mapped: CertificateRow[] = json.map((r) => ({
        name: (r["NAMA"] ?? r["NAME"]) as string,
        number: (r["NOMOR"] ?? r["NUMBER"]) as string,
        category: (r["KATEGORI"] ?? r["CATEGORY"]) as string,
        recipientOrg: (r["INSTANSI PENERIMA"] ?? r["RECIPIENT ORGANIZATION"]) as string,
        issuer: (r["PENERBIT"] ?? r["ISSUER"]) as string,
        issuedAt: parseDate(r["TANGGAL TERBIT"] ?? r["ISSUED AT"]),
        expiresAt: parseDate(r["TANGGAL KADALUARSA"] ?? r["EXPIRES AT"]),
      }))
      setRows(mapped)
      // upsert to supabase by unique number
      ;(async () => {
        const payload = mapped.map((m) => ({
          name: m.name ?? null,
          number: m.number ?? null,
          category: m.category ?? null,
          recipient_org: m.recipientOrg ?? null,
          issuer: m.issuer ?? null,
          issued_at: m.issuedAt ?? null,
          expires_at: m.expiresAt ?? null,
        }))
        const { error } = await supabase
          .from("certificates")
          .upsert(payload, { onConflict: "number" })
        if (error) {
          console.error("certificates upsert error:", {
            message: (error as any)?.message,
            details: (error as any)?.details,
            hint: (error as any)?.hint,
            code: (error as any)?.code,
          })
          return
        }
        // refresh from db to get ids
        const { data } = await supabase
          .from("certificates")
          .select("id,name,number,category,recipient_org,issuer,issued_at,expires_at")
        const mappedDb: CertificateRow[] = (data ?? []).map((r: any) => ({
          id: r.id,
          name: r.name,
          number: r.number,
          category: r.category,
          recipientOrg: r.recipient_org,
          issuer: r.issuer,
          issuedAt: r.issued_at ?? undefined,
          expiresAt: r.expires_at ?? undefined,
        }))
        setRows(mappedDb)
      })()
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ""
  }

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Manajemen Sertifikat</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-md border border-blue-600/50 bg-blue-600/10 px-3 py-2 text-sm hover:bg-blue-600/20">
          + Baru
        </button>
        <button onClick={handleImportClick} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
          Import Excel
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileChange}
          className="hidden"
        />
        <div className="ml-2 flex-1">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-white/50">
                    Belum ada data untuk ditampilkan
                  </td>
                </tr>
              ) : (
                filteredRows.map((r, idxInFiltered) => {
                  const idx = rows.indexOf(r)
                  const isEditing = editingIndex === idx
                  const current = isEditing && draft ? draft : r
                  return (
                    <tr key={idx} className="border-t border-white/5">
                      <td className="px-4 py-2">
                        {isEditing ? (
                          <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-2 py-1 text-sm"
                            value={current.name ?? ""}
                            onChange={(e) => setDraft({ ...current, name: e.target.value })}
                          />
                        ) : (
                          current.name
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {isEditing ? (
                          <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-2 py-1 text-sm"
                            value={current.number ?? ""}
                            onChange={(e) => setDraft({ ...current, number: e.target.value })}
                          />
                        ) : (
                          current.number
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {isEditing ? (
                          <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-2 py-1 text-sm"
                            value={current.category ?? ""}
                            onChange={(e) => setDraft({ ...current, category: e.target.value })}
                          />
                        ) : (
                          current.category
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {isEditing ? (
                          <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-2 py-1 text-sm"
                            value={current.recipientOrg ?? ""}
                            onChange={(e) => setDraft({ ...current, recipientOrg: e.target.value })}
                          />
                        ) : (
                          current.recipientOrg
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {isEditing ? (
                          <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-2 py-1 text-sm"
                            value={current.issuer ?? ""}
                            onChange={(e) => setDraft({ ...current, issuer: e.target.value })}
                          />
                        ) : (
                          current.issuer
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {isEditing ? (
                          <input type="date" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-2 py-1 text-sm"
                            value={current.issuedAt ?? ""}
                            onChange={(e) => setDraft({ ...current, issuedAt: e.target.value })}
                          />
                        ) : (
                          current.issuedAt
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {isEditing ? (
                          <input type="date" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-2 py-1 text-sm"
                            value={current.expiresAt ?? ""}
                            onChange={(e) => setDraft({ ...current, expiresAt: e.target.value })}
                          />
                        ) : (
                          current.expiresAt
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2 text-xs">
                          {!isEditing ? (
                            <>
                              <button aria-label="View" title="View" className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                aria-label="Edit"
                                title="Edit"
                                className="rounded-md border border-white/10 bg-white/5 px-2 py-1"
                                onClick={() => { setEditingIndex(idx); setDraft(r); setShowModal(true) }}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              {role === "admin" && (
                              <button
                                  aria-label="Delete"
                                  title="Delete"
                                  className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-300"
                                  onClick={() => {
                                  const doDelete = async () => {
                                    if (r.id) {
                                      const { error } = await supabase.from("certificates").delete().eq("id", r.id)
                                      if (error) {
                                        console.error(error)
                                        return
                                      }
                                    }
                                    const copy = rows.slice()
                                    copy.splice(idx, 1)
                                    setRows(copy)
                                  }
                                  doDelete()
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              <button
                                className="rounded-md border border-green-500/30 bg-green-500/10 px-2 py-1 text-green-300"
                                onClick={() => {
                                  if (!draft) return
                                  const copy = rows.slice()
                                  copy[idx] = draft
                                  setRows(copy)
                                  setEditingIndex(null)
                                  setDraft(null)
                                }}
                              >
                                Save
                              </button>
                              <button
                                className="rounded-md border border-white/10 bg-white/5 px-2 py-1"
                                onClick={() => { setEditingIndex(null); setDraft(null) }}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-sm">
          <div className="text-white/50">Menampilkan {filteredRows.length} dari {rows.length}</div>
          <div className="flex items-center gap-2">
            <button className="rounded-md border border-white/10 bg-white/5 px-2 py-1 disabled:opacity-40" disabled>{"<<"}</button>
            <button className="rounded-md border border-white/10 bg-white/5 px-2 py-1 disabled:opacity-40" disabled>{"<"}</button>
            <span className="inline-flex min-w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 py-1">1</span>
            <button className="rounded-md border border-white/10 bg-white/5 px-2 py-1 disabled:opacity-40" disabled>{">"}</button>
            <button className="rounded-md border border-white/10 bg-white/5 px-2 py-1 disabled:opacity-40" disabled>{">>"}</button>
          </div>
        </div>
      </section>
      {showModal && draft && (
        <>
          <ModalOverlay onClick={() => setShowModal(false)} />
          <ModalContent>
            <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#0d1223] p-4 text-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold">Perbarui Sertifikat</div>
                <button onClick={() => setShowModal(false)} className="rounded-md border border-white/10 bg-white/5 p-1" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 text-white/70">Nama</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Nomor</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.number ?? ""} onChange={(e) => setDraft({ ...draft, number: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Penerbit</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.issuer ?? ""} onChange={(e) => setDraft({ ...draft, issuer: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Instansi Penerima</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.recipientOrg ?? ""} onChange={(e) => setDraft({ ...draft, recipientOrg: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Tanggal Terbit</div>
                  <input type="date" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.issuedAt ?? ""} onChange={(e) => setDraft({ ...draft, issuedAt: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Tanggal Kadaluarsa</div>
                  <input type="date" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.expiresAt ?? ""} onChange={(e) => setDraft({ ...draft, expiresAt: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <div className="mb-1 text-white/70">Kategori</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.category ?? ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button className="rounded-md border border-white/10 bg-white/5 px-3 py-2" onClick={() => setShowModal(false)}>Batal</button>
                <button
                  className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-green-300"
                  onClick={() => {
                    const doUpdate = async () => {
                      if (editingIndex == null || !draft) return
                      const row = draft
                      if (row.id) {
                        const { error } = await supabase
                          .from("certificates")
                          .update({
                            name: row.name ?? null,
                            number: row.number ?? null,
                            category: row.category ?? null,
                            recipient_org: row.recipientOrg ?? null,
                            issuer: row.issuer ?? null,
                            issued_at: row.issuedAt ?? null,
                            expires_at: row.expiresAt ?? null,
                          })
                          .eq("id", row.id)
                        if (error) {
                          console.error(error)
                          return
                        }
                      } else {
                        const { data, error } = await supabase
                          .from("certificates")
                          .insert({
                            name: row.name ?? null,
                            number: row.number ?? null,
                            category: row.category ?? null,
                            recipient_org: row.recipientOrg ?? null,
                            issuer: row.issuer ?? null,
                            issued_at: row.issuedAt ?? null,
                            expires_at: row.expiresAt ?? null,
                          })
                          .select("id")
                          .single()
                        if (error) {
                          console.error(error)
                          return
                        }
                        row.id = data?.id
                      }
                      const copy = rows.slice()
                      copy[editingIndex] = row
                      setRows(copy)
                      setEditingIndex(null)
                      setDraft(null)
                      setShowModal(false)
                    }
                    doUpdate()
                  }}
                >
                  Kirim
                </button>
              </div>
            </div>
          </ModalContent>
        </>
      )}
    </main>
  )
}


