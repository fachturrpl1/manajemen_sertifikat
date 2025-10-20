"use client"

import { Suspense } from "react"
import { TeamNavbar } from "@/components/team-navbar"
import { ManageContent } from "@/components/manage-content"
import { useI18n } from "@/lib/i18n"

function TeamManageContent() {
  const { t } = useI18n()
  return (
    <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
      <TeamNavbar />
      <ManageContent role="team" />
    </div>
  )
}

export default function TeamManagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#0f1c35] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <TeamManageContent />
    </Suspense>
  )
}
