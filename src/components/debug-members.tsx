"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function DebugMembers() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkTable = async () => {
      try {
        // Check if table exists and get structure
        const { data: tableInfo, error: tableError } = await supabase
          .from("members")
          .select("*")
          .limit(1)

        console.log("Table check result:", { tableInfo, tableError })

        // Try to get all data
        const { data: allData, error: allError } = await supabase
          .from("members")
          .select("*")

        console.log("All data result:", { allData, allError })

        // Check specific columns
        const { data: specificData, error: specificError } = await supabase
          .from("members")
          .select("id,name,organization,phone,email,job,dob,address,city,notes")

        console.log("Specific columns result:", { specificData, specificError })

        setDebugInfo({
          tableCheck: { tableInfo, tableError },
          allData: { allData, allError },
          specificData: { specificData, specificError }
        })
      } catch (error) {
        console.error("Debug error:", error)
        setDebugInfo({ error: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    checkTable()
  }, [])

  if (isLoading) {
    return <div className="text-white">Loading debug info...</div>
  }

  return (
    <div className="bg-[#0d172b] border border-white/10 rounded-xl p-4 text-white text-sm">
      <h3 className="text-lg font-semibold mb-4">Debug Members Table</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-blue-400">Table Check:</h4>
          <pre className="bg-black/20 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo?.tableCheck, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-medium text-blue-400">All Data:</h4>
          <pre className="bg-black/20 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo?.allData, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-medium text-blue-400">Specific Columns:</h4>
          <pre className="bg-black/20 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo?.specificData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

