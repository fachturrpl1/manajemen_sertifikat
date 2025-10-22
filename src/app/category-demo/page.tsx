"use client"

import { useState } from "react"
import { CategorySelector } from "@/components/category-selector"

type Category = "mou" | "kunjungan industri" | "magang" | "pelatihan"

export default function CategoryDemoPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gradient-to-b dark:from-[#0b1220] dark:to-[#0f1c35] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Category Selector Demo</h1>
        
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#0d172b]">
          <CategorySelector 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          {selectedCategory && (
            <div className="mt-6 p-4 rounded-lg border border-gray-200 bg-black/5 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">Selected Category:</h3>
              <p className="text-blue-700 dark:text-blue-400 capitalize">{selectedCategory}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

