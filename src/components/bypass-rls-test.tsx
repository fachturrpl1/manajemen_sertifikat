"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function BypassRLSTest() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const runBypassTest = async () => {
      const results: any = {}

      try {
        console.log("=== BYPASS RLS TEST START ===")

        // Test 1: Try to disable RLS temporarily (this might not work)
        console.log("1. Attempting to bypass RLS...")
        
        // Test 2: Try with service role key (if available)
        console.log("2. Testing with different auth context...")
        
        // Test 3: Try direct query without RLS
        console.log("3. Testing direct query...")
        const { data: directData, error: directError } = await supabase
          .from("members")
          .select("*")
          .limit(10)
        
        results.directQuery = { data: directData, error: directError, count: directData?.length || 0 }

        // Test 4: Check if we can at least see table structure
        console.log("4. Checking table structure...")
        const { data: structureData, error: structureError } = await supabase
          .from("members")
          .select("*")
          .limit(0)
        
        results.structure = { data: structureData, error: structureError }

        // Test 5: Try with minimal columns
        console.log("5. Testing with minimal columns...")
        const { data: minimalData, error: minimalError } = await supabase
          .from("members")
          .select("id, name")
          .limit(5)
        
        results.minimalQuery = { data: minimalData, error: minimalError, count: minimalData?.length || 0 }

        // Test 6: Check RLS status
        console.log("6. Checking RLS status...")
        try {
          const { data: rlsData, error: rlsError } = await supabase
            .rpc('check_rls_status', { table_name: 'members' })
            .catch(() => ({ data: null, error: "RPC not available" }))
          
          results.rlsStatus = { data: rlsData, error: rlsError }
        } catch (e) {
          results.rlsStatus = { data: null, error: "RPC not available" }
        }

        console.log("=== BYPASS RLS TEST END ===")

      } catch (error) {
        console.error("Bypass test error:", error)
        results.error = error.message
      } finally {
        setIsLoading(false)
        setTestResults(results)
      }
    }

    runBypassTest()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-[#0d172b] border border-white/10 rounded-xl p-4 text-white">
        <h3 className="text-lg font-semibold mb-4">Testing RLS Bypass...</h3>
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-[#0d172b] border border-white/10 rounded-xl p-4 text-white">
      <h3 className="text-lg font-semibold mb-4">RLS Bypass Test Results</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-blue-400 mb-2">Direct Query ({testResults?.directQuery?.count || 0}):</h4>
          <div className="bg-black/20 p-2 rounded text-xs max-h-40 overflow-auto">
            <pre>{JSON.stringify(testResults?.directQuery, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">Table Structure:</h4>
          <div className="bg-black/20 p-2 rounded text-xs">
            <pre>{JSON.stringify(testResults?.structure, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">Minimal Query ({testResults?.minimalQuery?.count || 0}):</h4>
          <div className="bg-black/20 p-2 rounded text-xs max-h-40 overflow-auto">
            <pre>{JSON.stringify(testResults?.minimalQuery, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">RLS Status:</h4>
          <div className="bg-black/20 p-2 rounded text-xs">
            <pre>{JSON.stringify(testResults?.rlsStatus, null, 2)}</pre>
          </div>
        </div>

        {testResults?.error && (
          <div>
            <h4 className="font-medium text-red-400 mb-2">Error:</h4>
            <div className="bg-red-500/10 p-2 rounded text-xs">
              {testResults.error}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

