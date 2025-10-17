"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function RLSTest() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const runRLSTests = async () => {
      const results: any = {}

      try {
        // Test 1: Check authentication status
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        results.auth = { user, error: authError }

        // Test 2: Try to access members table with RLS
        const { data: membersData, error: membersError } = await supabase
          .from("members")
          .select("*")
          .limit(5)
        
        results.members = { data: membersData, error: membersError, count: membersData?.length || 0 }

        // Test 3: Check if we can insert (this will fail if RLS blocks)
        const { data: insertData, error: insertError } = await supabase
          .from("members")
          .insert({
            name: "Test User",
            email: "test@example.com"
          })
          .select()
        
        results.insert = { data: insertData, error: insertError }

        // Test 4: Check table policies
        const { data: policiesData, error: policiesError } = await supabase
          .rpc('get_table_policies', { table_name: 'members' })
          .catch(() => ({ data: null, error: "RPC not available" }))
        
        results.policies = { data: policiesData, error: policiesError }

      } catch (error) {
        console.error("RLS Test error:", error)
        results.error = error.message
      } finally {
        setIsLoading(false)
        setTestResults(results)
      }
    }

    runRLSTests()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-[#0d172b] border border-white/10 rounded-xl p-4 text-white">
        <h3 className="text-lg font-semibold mb-4">Testing RLS & Authentication...</h3>
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-[#0d172b] border border-white/10 rounded-xl p-4 text-white">
      <h3 className="text-lg font-semibold mb-4">RLS & Authentication Test Results</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-blue-400 mb-2">Authentication Status:</h4>
          <div className="bg-black/20 p-2 rounded text-xs">
            <pre>{JSON.stringify(testResults?.auth, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">Members Access ({testResults?.members?.count || 0}):</h4>
          <div className="bg-black/20 p-2 rounded text-xs max-h-40 overflow-auto">
            <pre>{JSON.stringify(testResults?.members, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">Insert Test:</h4>
          <div className="bg-black/20 p-2 rounded text-xs">
            <pre>{JSON.stringify(testResults?.insert, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">Policies:</h4>
          <div className="bg-black/20 p-2 rounded text-xs">
            <pre>{JSON.stringify(testResults?.policies, null, 2)}</pre>
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

