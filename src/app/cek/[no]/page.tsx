"use client"

import { useRouter } from "next/navigation"
import { use } from "react"

type Props = { params: Promise<{ no: string }> }

export default function CheckCertificatePage({ params }: Props) {
  const { no } = use(params)
  const router = useRouter()
  return (
    <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
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
        <h1 className="text-2xl font-semibold mb-2">Certificate</h1>
        <p className="text-white/70">Number: {no}</p>
        <div className="mt-6 flex gap-3">
          <button className="rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm">Download PDF</button>
          <button className="rounded-md border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm">Send Email</button>
          <button className="rounded-md border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm">Copy Link</button>
        </div>
      </div>
    </div>
  )
}


