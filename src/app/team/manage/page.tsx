"use client"

import { TeamNavbar } from "@/components/team-navbar"
import { ManageContent } from "@/components/manage-content"

export default function TeamManagePage() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
      <TeamNavbar />
      <ManageContent role="team" />
    </div>
  )
}


