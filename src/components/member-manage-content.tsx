"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import * as XLSX from "xlsx"
import { Pencil, Trash2, X } from "lucide-react"
import { ModalOverlay, ModalContent } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"

type MemberRow = {
  id?: string
  name?: string
  organization?: string
  phone?: string
  email?: string
  job?: string
  dob?: string
  address?: string
  city?: string
  notes?: string
  password?: string
}

export function MemberManageContent() {
  const [rows, setRows] = useState<MemberRow[]>([])
  const [query, setQuery] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draft, setDraft] = useState<MemberRow | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")

  useEffect(() => {
    // Initial data fetch
    const fetchData = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("members")
        .select("id,name,organization,phone,email,job,dob,address,city,notes,password")
      
      if (error) {
        console.error("Supabase members fetch error:", error)
        setIsLoading(false)
        return
      }
      
      const mapped: MemberRow[] = (data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string | undefined,
        name: r.name as string | undefined,
        organization: r.organization as string | undefined,
        phone: r.phone as string | undefined,
        email: r.email as string | undefined,
        job: r.job as string | undefined,
        dob: r.dob as string | undefined,
        address: r.address as string | undefined,
        city: r.city as string | undefined,
        notes: r.notes as string | undefined,
        password: r.password as string | undefined,
      }))
      
      setRows(mapped)
      setIsLoading(false)
    }

    fetchData()

    // Set up real-time subscription
    const channel = supabase
      .channel('members-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'members' },
        async () => {
          // Refetch data when any change occurs
      const { data, error } = await supabase
        .from("members")
            .select("id,name,organization,phone,email,job,dob,address,city,notes,password")
      if (error) {
        console.error("Supabase members fetch error:", error)
        return
      }
      const mapped: MemberRow[] = (data ?? []).map((r: any) => ({
        id: r.id,
        name: r.name,
        organization: r.organization,
        phone: r.phone,
        email: r.email,
        job: r.job,
        dob: r.dob ?? undefined,
        address: r.address,
        city: r.city,
        notes: r.notes,
            password: r.password,
      }))
      setRows(mapped)
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredRows = useMemo(() => {
    if (!query) return rows
    const q = query.toLowerCase()
    return rows.filter((r) =>
      [r.name, r.organization, r.phone, r.email, r.job, r.city]
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

      const mapped: MemberRow[] = json.map((r) => ({
        name: (r["NAME"] ?? r["NAMA"]) as string,
        organization: (r["ORGANIZATION"] ?? r["ORGANISASI"]) as string,
        phone: (r["PHONE"] ?? r["PHONE NUMBER"] ?? r["TELP"]) as string,
        email: (r["EMAIL"]) as string,
        job: (r["JOB"] ?? r["PEKERJAAN"]) as string,
        dob: parseDate(r["DATE OF BIRTH"] ?? r["DOB"] ?? r["TANGGAL LAHIR"]),
        address: (r["ADDRESS"] ?? r["ALAMAT"]) as string,
        city: (r["CITY"] ?? r["KOTA"]) as string,
        notes: (r["NOTES"] ?? r["CATATAN"]) as string,
      }))
      setRows(mapped)
      ;(async () => {
        const payload = mapped.map((m) => ({
          name: m.name ?? null,
          organization: m.organization ?? null,
          phone: m.phone ?? null,
          email: m.email ?? null,
          job: m.job ?? null,
          dob: m.dob ?? null,
          address: m.address ?? null,
          city: m.city ?? null,
          notes: m.notes ?? null,
        }))
        const { error } = await supabase.from("members").insert(payload)
        if (error) console.error(error)
        const { data } = await supabase
          .from("members")
          .select("id,name,organization,phone,email,job,dob,address,city,notes")
        const mappedDb: MemberRow[] = (data ?? []).map((r: Record<string, unknown>) => ({
          id: r.id as string | undefined,
          name: r.name as string | undefined,
          organization: r.organization as string | undefined,
          phone: r.phone as string | undefined,
          email: r.email as string | undefined,
          job: r.job as string | undefined,
          dob: r.dob as string | undefined,
          address: r.address as string | undefined,
          city: r.city as string | undefined,
          notes: r.notes as string | undefined,
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
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Manajemen Tim</h1>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => {
            setDraft({
              name: "",
              organization: "",
              phone: "",
              email: "",
              job: "",
              dob: "",
              address: "",
              city: "",
              notes: "",
              password: ""
            })
            setShowAddModal(true)
          }}
          className="rounded-md border border-blue-600/50 bg-blue-600/10 px-3 py-2 text-sm text-white hover:bg-blue-600/20"
        >
          + Baru
        </button>
        <button onClick={handleImportClick} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
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
              className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
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
                <th className="px-4 py-3 font-medium">NAME</th>
                <th className="px-4 py-3 font-medium">ORGANIZATION</th>
                <th className="px-4 py-3 font-medium">PHONE</th>
                <th className="px-4 py-3 font-medium">EMAIL</th>
                <th className="px-4 py-3 font-medium">JOB</th>
                <th className="px-4 py-3 font-medium">DATE OF BIRTH</th>
                <th className="px-4 py-3 font-medium">ADDRESS</th>
                <th className="px-4 py-3 font-medium">CITY</th>
                <th className="px-4 py-3 font-medium">PASSWORD</th>
                <th className="px-4 py-3 font-medium">NOTES</th>
                <th className="px-4 py-3 font-medium">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-white/50">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-white/50">
                    Belum ada data untuk ditampilkan
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => {
                  const idx = rows.indexOf(r)
                  return (
                    <tr key={idx} className="border-t border-white/5">
                      <td className="px-4 py-2 text-white">{r.name}</td>
                      <td className="px-4 py-2 text-white">{r.organization}</td>
                      <td className="px-4 py-2 text-white">{r.phone}</td>
                      <td className="px-4 py-2 text-white">{r.email}</td>
                      <td className="px-4 py-2 text-white">{r.job}</td>
                      <td className="px-4 py-2 text-white">{r.dob}</td>
                      <td className="px-4 py-2 text-white">{r.address}</td>
                      <td className="px-4 py-2 text-white">{r.city}</td>
                      <td className="px-4 py-2 text-white">{r.password || "-"}</td>
                      <td className="px-4 py-2 text-white">{r.notes}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2 text-xs">
                              <button
                                aria-label="Edit"
                                title="Edit"
                                className="rounded-md border border-white/10 bg-white/5 px-2 py-1"
                                onClick={() => { setEditingIndex(idx); setDraft(r); setShowModal(true) }}
                              >
                                <Pencil className="h-4 w-4 text-white" />
                              </button>
                              <button
                                aria-label="Delete"
                                title="Delete"
                                className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1"
                                onClick={() => {
                                  const doDelete = async () => {
                                    if (r.id) {
                                      const { error } = await supabase.from("members").delete().eq("id", r.id)
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
                                <Trash2 className="h-4 w-4 text-white" />
                              </button>
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
                <div className="font-semibold">Perbarui Member</div>
                <button onClick={() => setShowModal(false)} className="rounded-md border border-white/10 bg-white/5 p-1" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 text-white/70">Name</div>
                  <input placeholder="Nama lengkap" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2 placeholder:text-white/40" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div>
                  <div className="mb-2 text-white/70">Organization</div>
                  <input placeholder="Nama organisasi" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2 placeholder:text-white/40" value={draft.organization ?? ""} onChange={(e) => setDraft({ ...draft, organization: e.target.value })} />
                </div>
                <div>
                  <div className="mb-2 text-white/70">Phone</div>
                  <input placeholder="08xxxxxxxxxx" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2 placeholder:text-white/40" value={draft.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                </div>
                <div>
                  <div className="mb-2 text-white/70">Email</div>
                  <input placeholder="email@contoh.com" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2 placeholder:text:white/40" value={draft.email ?? ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                </div>
                <div>
                  <div className="mb-2 text-white/70">Job</div>
                  <input placeholder="Pekerjaan" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2 placeholder:text-white/40" value={draft.job ?? ""} onChange={(e) => setDraft({ ...draft, job: e.target.value })} />
                </div>
                <div>
                  <div className="mb-2 text-white/70">Date of Birth</div>
                  <input type="date" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2 placeholder:text-white/40" value={draft.dob ?? ""} onChange={(e) => setDraft({ ...draft, dob: e.target.value })} />
                </div>
                <div>
                  <div className="mb-2 text-white/70">Address</div>
                  <input placeholder="Alamat lengkap" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2 placeholder:text-white/40" value={draft.address ?? ""} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
                </div>
                <div>
                  <div className="mb-2 text-white/70">City</div>
                  <input placeholder="Kota" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2 placeholder:text-white/40" value={draft.city ?? ""} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <div className="mb-2 text-white/70">Password</div>
                  <input type="text" placeholder="Password akun (opsional)" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2 placeholder:text-white/40" value={draft.password ?? ""} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <div className="mb-2 text-white/70">Notes</div>
                  <textarea placeholder="Catatan tambahan" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2 placeholder:text-white/40" rows={3} value={draft.notes ?? ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                </div>
              </div>
              {updateMessage && (
                <div className={`mb-4 mt-4 rounded-md p-3 text-sm ${
                  updateMessage.includes('berhasil') 
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {updateMessage}
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button"
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Reset draft ke data asli tanpa menyimpan perubahan
                    if (editingIndex !== null) {
                      setDraft(rows[editingIndex])
                    }
                    setShowModal(false)
                    setUpdateMessage("")
                    setIsUpdating(false)
                    setEditingIndex(null)
                    setDraft(null)
                  }}
                  disabled={isUpdating}
                >
                  Batal
                </button>
                <button
                  className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    if (editingIndex == null || !draft) return
                    
                    setIsUpdating(true)
                    setUpdateMessage("")
                    
                    try {
                      const row = draft
                      if (row.id) {
                        // Check if email already exists for another record
                        if (row.email) {
                          const { data: existingRecord, error: checkError } = await supabase
                            .from("members")
                            .select("id, email")
                            .eq("email", row.email)
                            .neq("id", row.id)
                            .single()
                          
                          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
                            console.error("Check error:", checkError)
                            setUpdateMessage("Gagal memeriksa email")
                            return
                          }
                          
                          if (existingRecord) {
                            setUpdateMessage("Email sudah digunakan oleh member lain")
                            return
                          }
                        }
                        
                        // Update existing record
                        const { error } = await supabase
                          .from("members")
                          .update({
                            name: row.name ?? null,
                            organization: row.organization ?? null,
                            phone: row.phone ?? null,
                            email: row.email ?? null,
                            job: row.job ?? null,
                            dob: row.dob ?? null,
                            address: row.address ?? null,
                            city: row.city ?? null,
                            notes: row.notes ?? null,
                            password: row.password ?? null,
                          })
                          .eq("id", row.id)
                        
                        if (error) {
                          console.error("Update error:", error)
                          setUpdateMessage("Gagal memperbarui data: " + error.message)
                          return
                        }
                      } else {
                        // Check if email already exists for new record
                        if (row.email) {
                          const { data: existingRecord, error: checkError } = await supabase
                            .from("members")
                            .select("id, email")
                            .eq("email", row.email)
                            .single()
                          
                          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
                            console.error("Check error:", checkError)
                            setUpdateMessage("Gagal memeriksa email")
                            return
                          }
                          
                          if (existingRecord) {
                            setUpdateMessage("Email sudah digunakan")
                            return
                          }
                        }
                        
                        // Insert new record
                        const { data, error } = await supabase
                          .from("members")
                          .insert({
                            name: row.name ?? null,
                            organization: row.organization ?? null,
                            phone: row.phone ?? null,
                            email: row.email ?? null,
                            job: row.job ?? null,
                            dob: row.dob ?? null,
                            address: row.address ?? null,
                            city: row.city ?? null,
                            notes: row.notes ?? null,
                            password: row.password ?? null,
                          })
                          .select("id")
                          .single()
                        
                        if (error) {
                          console.error("Insert error:", error)
                          setUpdateMessage("Gagal menambahkan data: " + error.message)
                          return
                        }
                        row.id = data?.id
                      }
                      
                      // Update local state immediately
                      const copy = rows.slice()
                      copy[editingIndex] = row
                      setRows(copy)
                      
                      setUpdateMessage("Data berhasil diperbarui!")
                      
                      // Close modal after a short delay to show success message
                      setTimeout(() => {
                        setEditingIndex(null)
                        setDraft(null)
                        setShowModal(false)
                        setUpdateMessage("")
                        setIsUpdating(false)
                      }, 1500)
                      
                    } catch (error) {
                      console.error("Unexpected error:", error)
                      setUpdateMessage("Terjadi kesalahan yang tidak terduga")
                    } finally {
                      setIsUpdating(false)
                    }
                  }}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Memproses..." : "Kirim"}
                </button>
              </div>
            </div>
          </ModalContent>
        </>
      )}

      {/* Add Member Modal */}
      {showAddModal && draft && (
        <>
          <ModalOverlay onClick={() => setShowAddModal(false)} />
          <ModalContent>
            <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#0d1223] p-4 text-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold">Tambah Member Baru</div>
                <button onClick={() => setShowAddModal(false)} className="rounded-md border border-white/10 bg-white/5 p-1" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 text-white/70">Name</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Organization</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.organization ?? ""} onChange={(e) => setDraft({ ...draft, organization: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Phone</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Email</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.email ?? ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Job</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.job ?? ""} onChange={(e) => setDraft({ ...draft, job: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Date of Birth</div>
                  <input type="date" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.dob ?? ""} onChange={(e) => setDraft({ ...draft, dob: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Address</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.address ?? ""} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">City</div>
                  <input className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.city ?? ""} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-white/70">Password</div>
                  <input type="text" className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" value={draft.password ?? ""} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <div className="mb-1 text-white/70">Notes</div>
                  <textarea className="w-full rounded-md border border-white/10 bg-[#0d172b] px-3 py-2" rows={3} value={draft.notes ?? ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                </div>
              </div>
              {updateMessage && (
                <div className={`mb-6 mt-6 rounded-md p-4 text-sm ${
                  updateMessage.includes('berhasil') 
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {updateMessage}
                </div>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button className="rounded-md border border-white/10 bg-white/5 px-3 py-2" onClick={() => setShowAddModal(false)}>Batal</button>
                <button
                  className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-green-300"
                  onClick={() => {
                    const doAdd = async () => {
                      if (!draft) return
                      
                      setIsUpdating(true)
                      setUpdateMessage("")
                      
                      try {
                        const { data, error } = await supabase
                          .from("members")
                          .insert({
                            name: draft.name ?? null,
                            organization: draft.organization ?? null,
                            phone: draft.phone ?? null,
                            email: draft.email ?? null,
                            job: draft.job ?? null,
                            dob: draft.dob ?? null,
                            address: draft.address ?? null,
                            city: draft.city ?? null,
                            notes: draft.notes ?? null,
                            password: draft.password ?? null,
                          })
                          .select("id")
                          .single()
                        
                        if (error) {
                          console.error("Insert error:", error)
                          setUpdateMessage("Gagal menambahkan data: " + error.message)
                          return
                        }
                        
                        // Add to local state
                        const newRow = { ...draft, id: data?.id }
                        setRows([...rows, newRow])
                        
                        setUpdateMessage("Member berhasil ditambahkan!")
                        
                        // Close modal after a short delay
                        setTimeout(() => {
                          setShowAddModal(false)
                          setUpdateMessage("")
                          setIsUpdating(false)
                        }, 1500)
                        
                      } catch (error) {
                        console.error("Unexpected error:", error)
                        setUpdateMessage("Terjadi kesalahan yang tidak terduga")
                      } finally {
                        setIsUpdating(false)
                      }
                    }
                    doAdd()
                  }}
                >
                  {isUpdating ? "Memproses..." : "Tambah"}
                </button>
              </div>
            </div>
          </ModalContent>
        </>
      )}
    </main>
  )
}
