"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function PublicVerifyPage() {
  const [no, setNo] = useState("")
  const router = useRouter()

  function submit() {
    if (!no.trim()) return
    router.push(`/cek/${encodeURIComponent(no.trim())}`)
  }

  return (
    <div className="min-h-svh relative flex items-center justify-center bg-[#0b1220] text-white">
      <div className="absolute right-6 top-6 z-20">
        <Link href="/login" className="text-sm text-blue-400 hover:text-white">Login</Link>
      </div>
      {/* grid background overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.08)_1px,_transparent_1px)] [background-size:28px_28px] opacity-60"
      />

      <div className="relative z-10 w-full max-w-2xl px-6 text-center">
        {/* Logo */}
        <Link href="/">        
        <div className="mx-auto mb-6 inline-flex items-center gap-2">
          <div className="h-10 w-10 size-7 rounded-md bg-blue-600 text-white grid place-items-center font-bold">
            S
          </div>
          <span className="text-3xl font-semibold tracking-wide">
            <span className="text-white">Sertiku</span>
            <span className="text-blue-400">.co.id</span>
          </span>
        </div>
        </Link>

        <h1 className="mb-4 text-4xl md:text-5xl font-extrabold text-blue-400">
          Verifikasi Sertifikat
        </h1>
        <p className="mb-6 text-white/80">Masukkan Nomor Sertifikat Anda</p>

        <div className="mx-auto flex max-w-xl items-stretch gap-3">
          <input
            value={no}
            onChange={(e) => setNo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ketikkan Nomor Sertifikat"
            className="flex-1 rounded-lg border border-blue-900/60 bg-[#0e1930] px-4 py-3 text-base outline-none ring-1 ring-transparent focus:ring-blue-500/60 placeholder:text-white/50"
          />
          <button
            onClick={submit}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500"
          >
            Verifikasi
          </button>
        </div>
      </div>
    </div>
  )
}


