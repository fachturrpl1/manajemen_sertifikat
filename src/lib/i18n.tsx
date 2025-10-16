"use client"

import React from "react"

type Locale = "en" | "id"

type Dictionary = Record<string, string>

const en: Dictionary = {
  create: "Create",
  manage: "Manage",
  dashboard: "Dashboard",
  generate: "Generate",
  login: "Login",
  logout: "Logout",
  templates: "Templates",
  categories: "Categories",
  members: "Members",
  certificates: "Certificates",
  searchCertificate: "Search Certificate",
  about: "About",
  faq: "FAQ",
}

const id: Dictionary = {
  crete: "Buat",
  manage: "Kelola",
  dashboard: "Dasbor",
  generate: "Generate",
  login: "Masuk",
  logout: "Keluar",
  templates: "Template",
  categories: "Kategori",
  members: "Member",
  certificates: "Sertifikat",
  searchCertificate: "Cari Sertifikat",
  about: "Tentang",
  faq: "FAQ",
}

const dictionaries: Record<Locale, Dictionary> = { en, id }

type I18nContextValue = {
  locale: Locale
  t: (key: keyof typeof en) => string
  setLocale: (l: Locale) => void
}

const I18nContext = React.createContext<I18nContextValue | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState<Locale>("en")
  const value = React.useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key) => dictionaries[locale][key],
  }), [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = React.useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}


