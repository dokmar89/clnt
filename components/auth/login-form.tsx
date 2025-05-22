"use client"

import { useState } from "react"
import { signIn } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPendingApproval, setIsPendingApproval] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsPendingApproval(false)
    setIsLoading(true)
    
    const formData = new FormData(event.currentTarget)
    const result = await signIn(formData)
    
    setIsLoading(false)
    
    if (result?.error) {
      setError(result.error)
      
      if (result.pendingApproval) {
        setIsPendingApproval(true)
      }
    }
  }
  
  return (
    <div className="grid gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isPendingApproval && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Váš účet čeká na schválení administrátorem. Vyčkejte prosím na potvrzovací e-mail.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="vas@email.cz"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Heslo</Label>
              <a
                href="/auth/reset-password"
                className="text-sm text-primary underline underline-offset-4"
              >
                Zapomenuté heslo?
              </a>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Přihlašování..." : "Přihlásit se"}
          </Button>
        </div>
      </form>
    </div>
  )
} 