"use client"

import { TeamNavbar } from "@/components/team-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { CertificateEditor } from "@/components/certificate-editor"
import { Suspense } from "react"

function TeamEditContent() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
      <TeamNavbar />
      <CertificateEditor />
    </div>
  )
}

export default function TeamEditPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#0f1c35] flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }>
        <TeamEditContent />
      </Suspense>
    </ProtectedRoute>
  )
}
