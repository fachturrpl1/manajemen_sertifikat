import { AdminNavbar } from "@/components/admin-navbar"

export default function AdminFaqPage() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white">
      <AdminNavbar />
      <main className="mx-auto max-w-4xl px-4 md:px-6 py-10 space-y-6">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-white/70 mt-2">Quick answers to common questions for Admins.</p>
        </header>

        <section className="space-y-4">
          <details className="rounded-lg border border-white/10 bg-[#0d172b] p-4 open:shadow-md open:shadow-blue-500/10">
            <summary className="cursor-pointer select-none text-blue-400 font-medium">How do I add a new certificate?</summary>
            <p className="mt-2 text-white/80">Open the Manage menu, click "+ New", fill out the form, and save.</p>
          </details>
          <details className="rounded-lg border border-white/10 bg-[#0d172b] p-4 open:shadow-md open:shadow-blue-500/10">
            <summary className="cursor-pointer select-none text-blue-400 font-medium">Can I import data in bulk from Excel?</summary>
            <p className="mt-2 text-white/80">Yes. Use the Import button on the Manage page and follow the provided template.</p>
          </details>
          <details className="rounded-lg border border-white/10 bg-[#0d172b] p-4 open:shadow-md open:shadow-blue-500/10">
            <summary className="cursor-pointer select-none text-blue-400 font-medium">How do I set templates per category?</summary>
            <p className="mt-2 text-white/80">Choose a template in the category settings so publishing follows that design.</p>
          </details>
        </section>
      </main>
    </div>
  )
}




