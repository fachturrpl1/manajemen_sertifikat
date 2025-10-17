import { AdminNavbar } from "@/components/admin-navbar"
import { ProtectedRoute } from "@/components/protected-route"

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
        <AdminNavbar />
        <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <section className="rounded-xl border border-white/10 bg-[#0d172b] p-6 shadow-xl shadow-blue-500/10">
          <h2 className="text-3xl font-bold text-blue-400 mb-4">How to Use the Certificate Generator</h2>
          <ol className="space-y-3 text-white/80 list-decimal pl-5">
            <li>Upload a template image for your certificate.</li>
            <li>Enter names separated by commas.</li>
            <li>Click &quot;Generate&quot; to create your certificates.</li>
            <li>Enter QR code data (if any) if needed.</li>
            <li>Customize the font, color, and position for the name and QR code.</li>
            <li>Preview and download all generated certificates as PNG files.</li>
          </ol>
        </section>

        <aside className="rounded-xl border border-white/10 bg-[#0d172b] p-5 space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Select Templates</label>
            <input type="template" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" />
          </div>
          <div className="text-center text-white/70 mb-2">
            <span className="text-white/70 mb-2">or</span>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Upload Background</label>
            <input type="file" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Enter Names (separated by commas)</label>
            <textarea className="h-28 w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm" placeholder="Enter names, e.g. Mihir Jaiswal, Jhon Doe, ..." />
            <label className="block text-sm text-white/70 mb-2">Font Color</label>
            <input type="color" className="h-10 w-full rounded-md border border-white/10 bg-white/5 p-1" />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Enter Description</label>
            <textarea className="h-28 w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm" placeholder="Enter description, e.g. This is a certificate of completion for the course ..." />
            <label className="block text-sm text-white/70 mb-2">Font Color</label>
            <input type="color" className="h-10 w-full rounded-md border border-white/10 bg-white/5 p-1" />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Font Family</label>
            <select className="w-full rounded-md border border-white/10 bg-[#0f1c35] px-3 py-2 text-sm">
              <option>Arial</option>
              <option>Times New Roman</option>
              <option>Inter</option>
              <option>Geist</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/70 mb-2">Font Size</label>
              <input type="number" defaultValue={48} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Font Weight</label>
              <select className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <option>400</option>
                <option>500</option>
                <option>600</option>
                <option>700</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/70 mb-2">Name X</label>
              <input type="number" defaultValue={100} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Name Y</label>
              <input type="number" defaultValue={100} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/70 mb-2">QR Size</label>
              <input type="number" defaultValue={120} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">QR Margin</label>
              <input type="number" defaultValue={4} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/70 mb-2">QR X</label>
              <input type="number" defaultValue={100} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">QR Y</label>
              <input type="number" defaultValue={100} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button className="rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-medium">Create Data</button>
            <button className="rounded-md border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm">Clear</button>
          </div>
        </aside>
        </main>
      </div>
    </ProtectedRoute>
  )
}


