"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useState, Suspense } from "react"
import { ManageContent } from "@/components/manage-content"
import { MemberManageContent } from "@/components/member-manage-content"
import { useI18n } from "@/lib/i18n"

function AdminManageContent() {
  const [tab, setTab] = useState<"member" | "team">("member")
  const { t } = useI18n()
  
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-svh bg-white text-black dark:bg-gradient-to-b dark:from-[#0b1220] dark:to-[#0f1c35] dark:text-white">
        <AdminNavbar />
        <div className="mx-auto max-w-7xl px-4 pt-6">
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-300 bg-black/5 p-1 dark:border-white/10 dark:bg-white/5">
          <button
            onClick={() => setTab("member")}
            className={`${tab === "member" ? "bg-blue-600 text-white" : "text-black/70 hover:text-black dark:text-white/80 dark:hover:text-white"} rounded-md px-3 py-1.5 text-sm`}
          >
            {t('certificateManagement')}
          </button>
          <button
            onClick={() => setTab("team")}
            className={`${tab === "team" ? "bg-blue-600 text-white" : "text-black/70 hover:text-black dark:text-white/80 dark:hover:text-white"} rounded-md px-3 py-1.5 text-sm`}
          >
            {t('memberManagement')}
          </button>
          </div>
        </div>
        </div>
        {tab === "member" ? <ManageContent role="admin" /> : <MemberManageContent />}
      </div>
    </ProtectedRoute>
  )
}

export default function ManagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white text-black dark:bg-gradient-to-b dark:from-[#0b1220] dark:to-[#0f1c35] flex items-center justify-center">
        <div className="text-black dark:text-white text-lg">Loading...</div>
      </div>
    }>
      <AdminManageContent />
    </Suspense>
  )
}
