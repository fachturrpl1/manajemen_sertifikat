"use client"

import { useState } from "react"
import { CategorySelector } from "@/components/category-selector"

type Category = "mou" | "kunjungan industri" | "magang" | "pelatihan"

export default function CategoryDemoPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#0f1c35] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Category Selector Demo</h1>
        
        <div className="bg-[#0d172b] border border-white/10 rounded-xl p-6">
          <CategorySelector 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          {selectedCategory && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Selected Category:</h3>
              <p className="text-blue-400 capitalize">{selectedCategory}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

