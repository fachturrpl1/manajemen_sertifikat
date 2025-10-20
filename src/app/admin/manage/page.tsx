"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useState } from "react"
import { ManageContent } from "@/components/manage-content"
import { MemberManageContent } from "@/components/member-manage-content"
import { useI18n } from "@/lib/i18n"

export default function ManagePage() {
  const [tab, setTab] = useState<"member" | "team">("member")
  const { t } = useI18n()
  
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
        <AdminNavbar />
        <div className="mx-auto max-w-7xl px-4 pt-6">
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setTab("member")}
              className={`${tab === "member" ? "bg-blue-600 text-white" : "text-white/80 hover:text-white"} rounded-md px-3 py-1.5 text-sm`}
            >
              Member
            </button>
            <button
              onClick={() => setTab("team")}
              className={`${tab === "team" ? "bg-blue-600 text-white" : "text-white/80 hover:text-white"} rounded-md px-3 py-1.5 text-sm`}
            >
              Team
            </button>
          </div>
        </div>
        </div>
        {tab === "member" ? <ManageContent role="admin" /> : <MemberManageContent />}
      </div>
    </ProtectedRoute>
  )
}
