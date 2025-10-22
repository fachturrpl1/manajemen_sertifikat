"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type TestBlock = { data: unknown; error: unknown }
type CountBlock = TestBlock & { count: number }
interface SupabaseTestResults {
  connection?: TestBlock
  allMembers?: CountBlock
  specificMembers?: CountBlock
  structure?: TestBlock
  error?: string
}

export function SupabaseTest() {
  const [testResults, setTestResults] = useState<SupabaseTestResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const runTests = async () => {
      const results: SupabaseTestResults = {}

      try {
        // Test 1: Basic connection
        console.log("Testing Supabase connection...")
        const { data: testData, error: testError } = await supabase
          .from("members")
          .select("count")
          .limit(1)
        
        results.connection = { data: testData, error: testError }

        // Test 2: Get all data
        console.log("Testing get all members...")
        const { data: allMembers, error: allError } = await supabase
          .from("members")
          .select("*")
        
        results.allMembers = { data: allMembers, error: allError, count: Array.isArray(allMembers) ? allMembers.length : 0 }

        // Test 3: Get specific columns
        console.log("Testing specific columns...")
        const { data: specificMembers, error: specificError } = await supabase
          .from("members")
          .select("id,name,organization,phone,email,job,dob,address,city,notes")
        
        results.specificMembers = { data: specificMembers, error: specificError, count: Array.isArray(specificMembers) ? specificMembers.length : 0 }

        // Test 4: Check table structure
        console.log("Testing table structure...")
        const { data: structureData, error: structureError } = await supabase
          .from("members")
          .select("*")
          .limit(0)
        
        results.structure = { data: structureData, error: structureError }

      } catch (error) {
        console.error("Test error:", error)
        results.error = error instanceof Error ? error.message : String(error)
      } finally {
        setIsLoading(false)
        setTestResults(results)
      }
    }

    runTests()
  }, [])

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-black dark:border-white/10 dark:bg-[#0d172b] dark:text-white">
        <h3 className="text-lg font-semibold mb-4">Testing Supabase Connection...</h3>
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-black dark:border-white/10 dark:bg-[#0d172b] dark:text-white">
      <h3 className="text-lg font-semibold mb-4">Supabase Test Results</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-blue-700 mb-2 dark:text-blue-400">Connection Test:</h4>
          <div className="bg-black/5 dark:bg-black/20 p-2 rounded text-xs">
            <pre>{JSON.stringify(testResults?.connection, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-700 mb-2 dark:text-blue-400">All Members ({testResults?.allMembers?.count || 0}):</h4>
          <div className="bg-black/5 dark:bg-black/20 p-2 rounded text-xs max-h-40 overflow-auto">
            <pre>{JSON.stringify(testResults?.allMembers, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-700 mb-2 dark:text-blue-400">Specific Columns ({testResults?.specificMembers?.count || 0}):</h4>
          <div className="bg-black/5 dark:bg-black/20 p-2 rounded text-xs max-h-40 overflow-auto">
            <pre>{JSON.stringify(testResults?.specificMembers, null, 2)}</pre>
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

