"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useState } from "react"
import { ManageContent } from "@/components/manage-content"
import { MemberManageContent } from "@/components/member-manage-content"
import { CategorySelector } from "@/components/category-selector"

type Category = "mou" | "industri" | "magang" | "pelatihan"

export default function ManageWithCategoryPage() {
  const [tab, setTab] = useState<"cert" | "member">("cert")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
        <AdminNavbar />
        <div className="mx-auto max-w-7xl px-4 pt-6">
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
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
        </div>
        
        {tab === "cert" && (
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="bg-[#0d172b] border border-white/10 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Template & Tutorial</h2>
              <CategorySelector 
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
            <ManageContent role="admin" />
          </div>
        )}
        
        {tab === "member" && <MemberManageContent />}
      </div>
    </ProtectedRoute>
  )
}

