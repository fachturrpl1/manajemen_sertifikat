import { AdminNavbar } from "@/components/admin-navbar"
import { ManageContent } from "@/components/manage-content"

export default function ManagePage() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
      <AdminNavbar />
      <ManageContent />
    </div>
  )
}
