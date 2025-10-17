import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="relative min-h-svh bg-gradient-to-b from-[#0b1220] to-[#0f1c35]">
      <div className="absolute left-6 top-6 z-20">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <div className="bg-blue-600 font-bold text-primary-white flex size-7 items-center justify-center rounded-md">
            S
          </div>
          <span className="text-lg font-semibold tracking-wide">
            <span className="text-white">Sertiku</span>
            <span className="text-blue-400">.co.id</span>
          </span>
        </Link>
      </div>
      <div className="flex min-h-svh items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-500/10 backdrop-blur">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
