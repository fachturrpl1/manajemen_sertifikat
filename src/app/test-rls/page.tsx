"use client"

import { RLSTest } from "@/components/rls-test"

export default function TestRLSPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test RLS & Authentication</h1>
        <RLSTest />
      </div>
    </div>
  )
}

