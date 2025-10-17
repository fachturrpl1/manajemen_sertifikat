"use client"

import { SupabaseTest } from "@/components/supabase-test"

export default function TestSupabasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Supabase Connection</h1>
        <SupabaseTest />
      </div>
    </div>
  )
}

