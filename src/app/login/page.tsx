import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-gradient-to-b from-[#0b1220] to-[#0f1c35]">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-blue-600 text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            UBIG
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-500/10 backdrop-blur">
            <LoginForm />
          </div>
        </div>
        
      </div>
      <div className="relative hidden lg:block">
        <img
          src="/window.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover opacity-10"
        />
      </div>
    </div>
  )
}
