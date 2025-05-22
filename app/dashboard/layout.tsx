import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { LogOut, Menu } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { Database } from "@/lib/supabase/types"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Načtení profilu uživatele
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  return (
    <div className="flex min-h-screen">
      {/* Desktop navigace */}
      <div className="hidden md:block">
        <MainNav />
      </div>
      
      {/* Mobilní navigace */}
      <div className="md:hidden flex items-center absolute top-3 left-3 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <MainNav isMobile />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          userName={profile?.full_name || session.user.email?.split('@')[0] || 'Uživatel'} 
          userEmail={session.user.email || ''}
        />
        
        <main className="flex-1 bg-muted/20">
          {children}
        </main>
        
        <footer className="p-4 text-center text-sm text-muted-foreground border-t">
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            &copy; {new Date().getFullYear()} PassProve - Všechna práva vyhrazena
          </div>
        </footer>
      </div>
    </div>
  )
} 