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
  welcome: "Welcome",
  home: "Home",
  edit: "Edit",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  add: "Add",
  title: "Title",
  description: "Description",
  date: "Date",
  position: "Position",
  font: "Font",
  color: "Color",
  size: "Size",
  // Content translations
  certificateManagement: "Certificate Management",
  memberManagement: "Member Management",
  howToUse: "How to Use the Certificate Generator",
  step1: "Upload a template image for your certificate.",
  step2: "Enter names separated by commas.",
  step3: "Click \"Generate\" to create your certificates.",
  step4: "Enter QR code data (if any) if needed.",
  step5: "Customize the font, color, and position for the name and QR code.",
  step6: "Preview and download all generated certificates as PNG files.",
  workGuide: "Work Guide",
  workStep1: "Search or create certificate data from the right panel.",
  workStep2: "Edit details in the certificate edit page.",
  workStep3: "Generate and review before publication.",
  searchPlaceholder: "Enter certificate number...",
  createNew: "Create New",
  features: "Features",
  feature1: "PDF & Email Certificate Automation",
  feature2: "Public Verification via Unique URL",
  feature3: "Dynamic Templates (Portrait/Landscape)",
  feature4: "Bulk Import from Excel",
  feature5: "Role Access: Admin & Team",
  feature6: "Multilingual: English & Indonesia",
  noCreditCard: "No credit card required",
  // Additional content
  loading: "Loading...",
  noData: "No data",
  noName: "(No name)",
  category: "Category",
  tryPublicVerification: "Try Public Verification",
  publicVerification: "Public Verification",
  // Landing page content
  creatorAndManagement: "Creator & Online Member Management",
  designDescription: "Design, issue, and manage certificates for MoUs, Internships, Training, and Industrial Visits. Choose templates, dynamically set name/QR positions, download PDFs, and send via email—all in one place.",
  // Verification page
  certificateVerification: "Certificate Verification",
  enterCertificateNumber: "Enter Your Certificate Number",
  typeCertificateNumber: "Type Certificate Number",
  verify: "Verify",
  // Login form
  loginToAccount: "Login to your account",
  enterEmailToLogin: "Enter your email below to login to your account",
  emailPlaceholder: "example@gmail.com",
  passwordPlaceholder: "password",
  loggingIn: "Logging in...",
  continueAsGuest: "Continue as guest",
  emailOrPasswordWrong: "Email or password is incorrect",
  loginError: "An error occurred during login",
}

const id: Dictionary = {
  create: "Buat",
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
  welcome: "Selamat Datang",
  home: "Beranda",
  edit: "Edit",
  save: "Simpan",
  cancel: "Batal",
  delete: "Hapus",
  add: "Tambah",
  title: "Judul",
  description: "Deskripsi",
  date: "Tanggal",
  position: "Posisi",
  font: "Font",
  color: "Warna",
  size: "Ukuran",
  // Content translations
  certificateManagement: "Manajemen Sertifikat",
  memberManagement: "Manajemen Member",
  howToUse: "Cara Menggunakan Generator Sertifikat",
  step1: "Unggah gambar template untuk sertifikat Anda.",
  step2: "Masukkan nama yang dipisahkan dengan koma.",
  step3: "Klik \"Generate\" untuk membuat sertifikat Anda.",
  step4: "Masukkan data QR code (jika ada) jika diperlukan.",
  step5: "Kustomisasi font, warna, dan posisi untuk nama dan QR code.",
  step6: "Pratinjau dan unduh semua sertifikat yang dibuat sebagai file PNG.",
  workGuide: "Panduan Kerja",
  workStep1: "Cari atau buat data sertifikat dari panel kanan.",
  workStep2: "Edit detail di halaman edit sertifikat.",
  workStep3: "Generate dan review sebelum publikasi.",
  searchPlaceholder: "Masukkan nomor sertifikat...",
  createNew: "Buat Baru",
  features: "Fitur",
  feature1: "Otomasi PDF & Email Sertifikat",
  feature2: "Verifikasi Publik via URL Unik",
  feature3: "Template Dinamis (Portrait/Landscape)",
  feature4: "Import Massal dari Excel",
  feature5: "Akses Peran: Admin & Team",
  feature6: "Multibahasa: English & Indonesia",
  noCreditCard: "Tidak diperlukan kartu kredit",
  // Additional content
  loading: "Memuat...",
  noData: "Tidak ada data",
  noName: "(Tanpa nama)",
  category: "Kategori",
  tryPublicVerification: "Coba Verifikasi Publik",
  publicVerification: "Verifikasi Publik",
  // Landing page content
  creatorAndManagement: "Pembuat & Manajemen Member Online",
  designDescription: "Rancang, terbitkan, dan kelola sertifikat untuk MoU, Magang, Pelatihan, dan Kunjungan Industri. Pilih template, atur posisi nama/QR secara dinamis, unduh PDF, dan kirim lewat email—semuanya dalam satu tempat.",
  // Verification page
  certificateVerification: "Verifikasi Sertifikat",
  enterCertificateNumber: "Masukkan Nomor Sertifikat Anda",
  typeCertificateNumber: "Ketikkan Nomor Sertifikat",
  verify: "Verifikasi",
  // Login form
  loginToAccount: "Masuk ke akun Anda",
  enterEmailToLogin: "Masukkan email Anda di bawah untuk masuk ke akun",
  emailPlaceholder: "contoh@gmail.com",
  passwordPlaceholder: "kata sandi",
  loggingIn: "Sedang masuk...",
  continueAsGuest: "Lanjut sebagai tamu",
  emailOrPasswordWrong: "Email atau kata sandi salah",
  loginError: "Terjadi kesalahan saat login",
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


