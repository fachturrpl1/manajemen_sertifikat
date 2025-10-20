"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function DetailedDebug() {
  const [debugResults, setDebugResults] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const runDetailedDebug = async () => {
      const results: Record<string, unknown> = {}

      try {
        console.log("=== DETAILED DEBUG START ===")

        // Test 1: Check Supabase client
        console.log("1. Checking Supabase client...")
        results.supabaseClient = {
          url: "Supabase URL configured",
          key: "Supabase key configured"
        }

        // Test 2: Check authentication
        console.log("2. Checking authentication...")
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        results.auth = { 
          user: user ? { id: user.id, email: user.email } : null, 
          error: authError 
        }

        // Test 3: Check session
        console.log("3. Checking session...")
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        results.session = { 
          session: session ? { user_id: session.user?.id } : null, 
          error: sessionError 
        }

        // Test 4: Try simple query
        console.log("4. Testing simple query...")
        const { data: simpleData, error: simpleError } = await supabase
          .from("members")
          .select("id")
          .limit(1)
        results.simpleQuery = { data: simpleData, error: simpleError }

        // Test 5: Try full query
        console.log("5. Testing full query...")
        const { data: fullData, error: fullError } = await supabase
          .from("members")
          .select("*")
        results.fullQuery = { data: fullData, error: fullError, count: fullData?.length || 0 }

        // Test 6: Check table exists
        console.log("6. Checking if table exists...")
        const { data: tableCheck, error: tableError } = await supabase
          .from("members")
          .select("*")
          .limit(0)
        results.tableExists = { data: tableCheck, error: tableError }

        // Test 7: Try with different approach
        console.log("7. Trying different approach...")
        const { data: altData, error: altError } = await supabase
          .from("members")
          .select("id, name, email")
          .limit(5)
        results.alternativeQuery = { data: altData, error: altError, count: altData?.length || 0 }

        console.log("=== DETAILED DEBUG END ===")

      } catch (error) {
        console.error("Detailed debug error:", error)
        results.error = error instanceof Error ? error.message : String(error)
      } finally {
        setIsLoading(false)
        setDebugResults(results)
      }
    }

    runDetailedDebug()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-[#0d172b] border border-white/10 rounded-xl p-4 text-white">
        <h3 className="text-lg font-semibold mb-4">Running Detailed Debug...</h3>
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-[#0d172b] border border-white/10 rounded-xl p-4 text-white">
      <h3 className="text-lg font-semibold mb-4">Detailed Debug Results</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-blue-400 mb-2">Supabase Client:</h4>
          <div className="bg-black/20 p-2 rounded text-xs">
            <pre>{JSON.stringify(debugResults?.supabaseClient, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">Authentication:</h4>
          <div className="bg-black/20 p-2 rounded text-xs">
            <pre>{JSON.stringify(debugResults?.auth, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">Session:</h4>
          <div className="bg-black/20 p-2 rounded text-xs">
            <pre>{JSON.stringify(debugResults?.session, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">Simple Query:</h4>
          <div className="bg-black/20 p-2 rounded text-xs">
            <pre>{JSON.stringify(debugResults?.simpleQuery, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">Full Query ({(debugResults?.fullQuery as { count?: number })?.count || 0}):</h4>
          <div className="bg-black/20 p-2 rounded text-xs max-h-40 overflow-auto">
            <pre>{JSON.stringify(debugResults?.fullQuery, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">Table Exists:</h4>
          <div className="bg-black/20 p-2 rounded text-xs">
            <pre>{JSON.stringify(debugResults?.tableExists, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">Alternative Query ({(debugResults?.alternativeQuery as { count?: number })?.count || 0}):</h4>
          <div className="bg-black/20 p-2 rounded text-xs max-h-40 overflow-auto">
            <pre>{JSON.stringify(debugResults?.alternativeQuery, null, 2)}</pre>
          </div>
        </div>

        {debugResults?.error && (
          <div>
            <h4 className="font-medium text-red-400 mb-2">Error:</h4>
            <div className="bg-red-500/10 p-2 rounded text-xs">
              {String(debugResults.error)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
