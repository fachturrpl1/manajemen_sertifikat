import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

export type Role = "admin" | "team" | "public"

export type CertificateTemplate = {
  id: string
  name: string
  orientation: "portrait" | "landscape"
  imageUrl: string
  fields: Array<{ key: string; x: number; y: number }>
  createdAt: string
}

export type CertificateCategory = {
  id: string
  name: string
  templateId: string
  createdAt: string
}

export type Member = {
  id: string
  name: string
  organization?: string
  phone?: string
  email?: string
  job?: string
  dateOfBirth?: string
  address?: string
  city?: string
  notes?: string
}

export type Certificate = {
  id: string
  number: string
  categoryId: string
  memberId: string
  issueDate: string
  expireDate?: string
  payload?: Record<string, unknown>
}


