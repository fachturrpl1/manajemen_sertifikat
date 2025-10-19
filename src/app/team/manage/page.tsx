"use client"

import { TeamNavbar } from "@/components/team-navbar"
import { ManageContent } from "@/components/manage-content"
import { MemberManageContent } from "@/components/member-manage-content"
import { useState } from "react"
import { useI18n } from "@/lib/i18n"

export default function TeamManagePage() {
  const [tab, setTab] = useState<"cert" | "member">("cert")
  const { t } = useI18n()
  return (
    <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
      <TeamNavbar />
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setTab("cert")}
              className={`${tab === "cert" ? "bg-blue-600 text-white" : "text-white/80 hover:text-white"} rounded-md px-3 py-1.5 text-sm`}
            >
              {t('certificateManagement')}
            </button>
            <button
              onClick={() => setTab("member")}
              className={`${tab === "member" ? "bg-blue-600 text-white" : "text-white/80 hover:text-white"} rounded-md px-3 py-1.5 text-sm`}
            >
              {t('memberManagement')}
            </button>
          </div>
        </div>
      </div>
      {tab === "cert" ? <ManageContent role="team" /> : <MemberManageContent />}
    </div>
  )
}


