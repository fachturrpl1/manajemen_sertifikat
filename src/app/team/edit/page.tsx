"use client"

import { TeamNavbar } from "@/components/team-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import CertificateEditor from "@/components/certificate-editor"

export default function TeamEditPage() {
  return (
    <ProtectedRoute allowedRoles={["team", "admin"]}>
      <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
        <TeamNavbar />
        {/* Reuse the same editor UI without admin navbar */}
        <CertificateEditor />
      </div>
    </ProtectedRoute>
  )
}


