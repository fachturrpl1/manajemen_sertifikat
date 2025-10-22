"use client"

import { useI18n } from "@/lib/i18n"
import { getTemplates } from "@/lib/template-map"

export function TemplateChooser({ category, onChoose }: { category: string; onChoose?: (path: string, url: string) => void }) {
  const { t } = useI18n()
  const list = getTemplates(category)
  return (
    <div>
      <label className="block text-sm text-white/70 mb-2">{t('chooseTemplate')}</label>
      {(!category || list.length === 0) ? (
        <div className="text-white/60 text-sm">{t('selectCategoryToSeeTemplates')}</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {list.map((path) => {
            const url = `/${path}`
            return (
              <button
                key={path}
                type="button"
                onClick={onChoose ? () => onChoose(path, url) : undefined}
                className="rounded-md border border-white/10 bg-white/5 hover:bg-white/10 p-1 cursor-pointer"
                title={path}
              >
                <img src={url} alt={path} className="aspect-video object-cover rounded" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
