"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { supabase } from "@/lib/supabase"

export function RLSTest() {
  const [testResults, setTestResults] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const renderJson = (data: unknown): ReactNode => {
    return JSON.stringify(data, null, 2)
  }

  useEffect(() => {
    const runRLSTests = async () => {
      const results: Record<string, unknown> = {}

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
        try {
          const { data: policiesData, error: policiesError } = await supabase
            .rpc('get_table_policies', { table_name: 'members' })
          
          results.policies = { data: policiesData, error: policiesError }
        } catch (rpcError) {
          results.policies = { data: null, error: "RPC not available" }
        }

      } catch (error) {
        console.error("RLS Test error:", error)
        results.error = error instanceof Error ? error.message : String(error)
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
            <pre>{renderJson(testResults?.auth)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">Members Access ({(testResults?.members as { count?: number })?.count || 0}):</h4>
          <div className="bg-black/20 p-2 rounded text-xs max-h-40 overflow-auto">
            <pre>{renderJson(testResults?.members)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">Insert Test:</h4>
          <div className="bg-black/20 p-2 rounded text-xs">
            <pre>{renderJson(testResults?.insert)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-400 mb-2">Policies:</h4>
          <div className="bg-black/20 p-2 rounded text-xs">
            <pre>{renderJson(testResults?.policies)}</pre>
          </div>
        </div>

        {testResults?.error != null && (
          <div>
            <h4 className="font-medium text-red-400 mb-2">Error:</h4>
            <div className="bg-red-500/10 p-2 rounded text-xs">
              {String(testResults.error) as ReactNode}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

