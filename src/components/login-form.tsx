"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const emailInput = form.querySelector<HTMLInputElement>("#email")
    const email = emailInput?.value || ""
    if (email.toLowerCase().includes("admin")) {
      router.push("/admin")
    } else {
      router.push("/team")
    }
  }
  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <Input id="password" type="password" placeholder="password" required />
        </Field>
        <Field>
          <Button type="submit">Login</Button>
        </Field>
        <Link href="/all">
          <Field className="gap-1 py-0 text-blue-500">
            <Button type="submit">Continue as guest</Button>
          </Field>
        </Link>
      </FieldGroup>
    </form>
  )
}
