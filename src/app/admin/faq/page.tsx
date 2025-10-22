import { AdminNavbar } from "@/components/admin-navbar"

export default function AdminFaqPage() {
  return (
    <div className="min-h-svh bg-white text-black dark:bg-gradient-to-b dark:from-[#0b1220] dark:to-[#0f1c35] dark:text-white">
      <AdminNavbar />
      <main className="mx-auto max-w-4xl px-4 md:px-6 py-10 space-y-6">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-black/70 dark:text-white/70 mt-2">Quick answers to common questions for Admins.</p>
        </header>

        <section className="space-y-4">
          <details className="rounded-lg border border-gray-200 bg-white p-4 open:shadow-sm dark:border-white/10 dark:bg-[#0d172b] dark:open:shadow-md dark:open:shadow-blue-500/10">
            <summary className="cursor-pointer select-none text-blue-700 font-medium dark:text-blue-400">How do I add a new certificate?</summary>
            <p className="mt-2 text-black/70 dark:text-white/80">Open the Manage menu, click &quot;+ New&quot;, fill out the form, and save.</p>
          </details>
          <details className="rounded-lg border border-gray-200 bg-white p-4 open:shadow-sm dark:border-white/10 dark:bg-[#0d172b] dark:open:shadow-md dark:open:shadow-blue-500/10">
            <summary className="cursor-pointer select-none text-blue-700 font-medium dark:text-blue-400">Can I import data in bulk from Excel?</summary>
            <p className="mt-2 text-black/70 dark:text-white/80">Yes. Use the Import button on the Manage page and follow the provided template.</p>
          </details>
          <details className="rounded-lg border border-gray-200 bg-white p-4 open:shadow-sm dark:border-white/10 dark:bg-[#0d172b] dark:open:shadow-md dark:open:shadow-blue-500/10">
            <summary className="cursor-pointer select-none text-blue-700 font-medium dark:text-blue-400">How do I set templates per category?</summary>
            <p className="mt-2 text-black/70 dark:text-white/80">Choose a template in the category settings so publishing follows that design.</p>
          </details>
        </section>
      </main>
    </div>
  )
}




