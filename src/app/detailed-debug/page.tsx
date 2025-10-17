"use client"

import { DetailedDebug } from "@/components/detailed-debug"

export default function DetailedDebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Detailed Debug</h1>
        <DetailedDebug />
      </div>
    </div>
  )
}

