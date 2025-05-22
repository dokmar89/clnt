import { Metadata } from "next"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MessageSquare, BookOpen, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Podpora | PassProve",
  description: "Centrum podpory pro verifikační službu PassProve"
}

export default async function SupportPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Centrum podpory</h1>
        <p className="text-muted-foreground mt-1">
          Získejte pomoc, informace a odpovědi na vaše otázky
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>Ticket systém</CardTitle>
            <CardDescription>
              Kontaktujte náš tým podpory a založte nový ticket s vaším dotazem nebo problémem
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-2 text-blue-600 dark:text-blue-400">1</span>
                Založte nový ticket s popisem vašeho požadavku
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-2 text-blue-600 dark:text-blue-400">2</span>
                Náš tým podpory vám odpoví co nejdříve
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-2 text-blue-600 dark:text-blue-400">3</span>
                Sledujte stav vašeho ticketu v přehledu
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button asChild className="gap-1 w-full sm:w-auto">
              <Link href="/dashboard/support/tickets">
                Přejít do ticket systému
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
          <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle>Znalostní báze</CardTitle>
            <CardDescription>
              Prozkoumejte naše návody, dokumentaci a odpovědi na časté dotazy
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mr-2 text-emerald-600 dark:text-emerald-400">1</span>
                Vyhledávejte v dokumentaci pomocí klíčových slov
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mr-2 text-emerald-600 dark:text-emerald-400">2</span>
                Procházejte kategorie a tematické celky
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mr-2 text-emerald-600 dark:text-emerald-400">3</span>
                Najděte rychlé odpovědi na vaše otázky
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button asChild variant="outline" className="gap-1 w-full sm:w-auto">
              <Link href="/dashboard/support/knowledgebase">
                Přejít do znalostní báze
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
          <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-3xl" />
        </Card>
      </div>

      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-6 border border-muted shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Potřebujete okamžitou pomoc?</h3>
            <p className="text-muted-foreground">
              Kontaktujte nás přímo na naší zákaznické lince v pracovní dny od 9:00 do 17:00.
            </p>
          </div>
          <Button variant="default" size="lg" className="whitespace-nowrap">
            +420 123 456 789
          </Button>
        </div>
      </div>
    </div>
  )
} 