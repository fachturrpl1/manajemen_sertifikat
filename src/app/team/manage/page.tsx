"use client"

import { Suspense } from "react"
import { TeamNavbar } from "@/components/team-navbar"
import { ManageContent } from "@/components/manage-content"
import { useI18n } from "@/lib/i18n"

function TeamManageContent() {
  const { t } = useI18n()
  return (
    <div className="min-h-svh bg-white text-black dark:bg-gradient-to-b dark:from-[#0b1220] dark:to-[#0f1c35] dark:text-white">
      <TeamNavbar />
      <ManageContent role="team" />
    </div>
  )
}

export default function TeamManagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white text-black dark:bg-gradient-to-b dark:from-[#0b1220] dark:to-[#0f1c35] flex items-center justify-center">
        <div className="text-black dark:text-white text-lg">Loading...</div>
      </div>
    }>
      <TeamManageContent />
    </Suspense>
  )
}
