"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { useState } from "react"
import { ManageContent } from "@/components/manage-content"
import { MemberManageContent } from "@/components/member-manage-content"

export default function ManagePage() {
  const [tab, setTab] = useState<"cert" | "member">("cert")
  return (
    <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
      <AdminNavbar />
      <div className="mx-auto max-w-7xl px-4 md:px-6 pt-6">
        <div className="mb-4 inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setTab("cert")}
            className={`${tab === "cert" ? "bg-blue-600 text-white" : "text-white/80 hover:text-white"} rounded-md px-3 py-1.5 text-sm`}
          >
            Manajemen Sertifikat
          </button>
          <button
            onClick={() => setTab("member")}
            className={`${tab === "member" ? "bg-blue-600 text-white" : "text-white/80 hover:text-white"} rounded-md px-3 py-1.5 text-sm`}
          >
            Manajemen Member
          </button>
        </div>
      </div>
      {tab === "cert" ? <ManageContent /> : <MemberManageContent />}
    </div>
  )
}
