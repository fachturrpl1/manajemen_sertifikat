"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

type Category = "mou" | "kunjungan industri" | "magang" | "pelatihan"

const categories = [
  { value: "mou", label: "MOU" },
  { value: "kunjungan industri", label: "Kunjungan Industri" },
  { value: "magang", label: "Magang" },
  { value: "pelatihan", label: "Pelatihan" }
]

interface CategorySelectorProps {
  selectedCategory: Category | null
  onCategoryChange: (category: Category | null) => void
}

export function CategorySelector({ selectedCategory, onCategoryChange }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showHowToUse, setShowHowToUse] = useState(false)

  const selectedCategoryData = categories.find(cat => cat.value === selectedCategory)

  return (
    <div className="space-y-4">
      {/* Category Selector */}
      <div className="relative">
        <label className="block text-sm font-medium text-black mb-2 dark:text-white">
          Select Kategori
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md text-black hover:bg-black/5 focus:outline-none focus:ring-1 focus:ring-blue-500/60 dark:bg-[#0d172b] dark:border-white/10 dark:text-white dark:hover:bg-[#1a2332]"
          >
            <span className="text-sm">
              {selectedCategoryData ? selectedCategoryData.label : "Pilih kategori..."}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg dark:bg-[#0d172b] dark:border-white/10">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    onCategoryChange(category.value as Category)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-black hover:bg-black/5 flex items-center justify-between dark:text-white dark:hover:bg-white/5"
                >
                  {category.label}
                  {selectedCategory === category.value && (
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How to Use Button */}
      {selectedCategory && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHowToUse(!showHowToUse)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:text-blue-800 border border-blue-500/30 bg-blue-500/10 rounded-md hover:bg-blue-500/20 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
          >
            <HelpCircle className="h-4 w-4" />
            How to Use
          </button>
        </div>
      )}

      {/* How to Use Modal */}
      {showHowToUse && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white border border-gray-300 rounded-xl p-6 max-w-4xl max-h-[90vh] overflow-auto dark:bg-[#0d172b] dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                How to Use - {selectedCategoryData?.label}
              </h3>
              <button
                onClick={() => setShowHowToUse(false)}
                className="text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <TutorialImages category={selectedCategory} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TutorialImages({ category }: { category: Category }) {
  // Mapping untuk gambar tutorial berdasarkan kategori
  const getTutorialImages = (category: Category) => {
    const basePath = `/certificate/${category}`
    
    switch (category) {
      case "mou":
        return [
          { src: `${basePath}/mou1.png`, alt: "Tutorial MOU 1" }
        ]
      case "magang":
        return [
          { src: `${basePath}/magang1.png`, alt: "Tutorial Magang 1" }
        ]
      case "pelatihan":
        return [
          { src: `${basePath}/pelatihan1.png`, alt: "Tutorial Pelatihan 1" }
        ]
      default:
        return []
    }
  }

  const images = getTutorialImages(category)

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-black/60 dark:text-white/60">
        <p>Tutorial untuk kategori {category} belum tersedia.</p>
        <p className="text-sm mt-2">Silakan tambahkan gambar tutorial di folder public/certificate/{category}/</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative">
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-auto rounded-lg border border-gray-300 dark:border-white/10"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `
                  <div class="flex items-center justify-center h-32 bg-black/5 rounded-lg border border-gray-300 dark:bg-white/5 dark:border-white/10">
                    <p class="text-black/60 dark:text-white/60 text-sm">Gambar tidak ditemukan</p>
                  </div>
                `
              }
            }}
          />
        </div>
      ))}
    </div>
  )
}
