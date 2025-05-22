import { Metadata } from "next"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { Search, BookOpen, Bookmark, FileText, ArrowRight, Star, TrendingUp, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getKnowledgeCategories, getFeaturedArticles } from "@/lib/actions/knowledgebase"

export const metadata: Metadata = {
  title: "Znalostní báze | PassProve",
  description: "Dokumentace a návody pro verifikační službu PassProve"
}

// Mapování ikon podle typu kategorie
const categoryIcons = {
  "getting-started": BookOpen,
  "api-integration": FileText,
  "verification-methods": Bookmark,
  "billing": TrendingUp,
  "faq": HelpCircle,
  "security": Star
}

// Mapování barev podle typu kategorie
const categoryColors = {
  "getting-started": "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  "api-integration": "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
  "verification-methods": "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  "billing": "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  "faq": "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  "security": "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
}

export default async function KnowledgebasePage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }
  
  // Načtení kategorií a doporučených článků z backendu
  const { categories = [], error: categoriesError } = await getKnowledgeCategories()
  const { articles = [], error: articlesError } = await getFeaturedArticles()

  // Formátování dat pro zobrazení
  const formattedCategories = categories.map(category => {
    const type = category.slug as keyof typeof categoryIcons || "getting-started"
    return {
      ...category,
      icon: categoryIcons[type] || BookOpen,
      color: categoryColors[type] || categoryColors["getting-started"],
      articles: category.kb_articles_count || 0
    }
  })
  
  // Formátování článků pro zobrazení
  const formattedArticles = articles.map(article => ({
    id: article.id,
    title: article.title,
    description: article.description,
    category: article.kb_categories?.title || "",
    date: new Date(article.created_at).toLocaleDateString('cs-CZ'),
    readTime: `${article.read_time || 5} min`
  }))

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Znalostní báze</h1>
        <p className="text-muted-foreground mt-1">
          Dokumentace, návody a odpovědi na časté dotazy
        </p>
      </div>

      <div className="relative mb-12">
        <div className="relative w-full max-w-2xl mx-auto">
          <div className="absolute left-3 top-3 h-5 w-5 text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <Input 
            className="pl-10 py-6 text-base" 
            placeholder="Hledat v dokumentaci..." 
          />
          <Button className="absolute right-1 top-1.5">
            Hledat
          </Button>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-6">Kategorie</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formattedCategories.map((category, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className={`${category.color} w-10 h-10 flex items-center justify-center rounded-full mb-2`}>
                  <category.icon className="h-5 w-5" />
                </div>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardFooter className="border-t p-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {category.articles} článků
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  Zobrazit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-6">Doporučené články</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formattedArticles.map((article, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {article.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{article.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {article.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 flex justify-between border-t mt-3 pt-3 text-xs text-muted-foreground">
                <span>{article.date}</span>
                <span>{article.readTime} čtení</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <HelpCircle className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-semibold mb-2">Nenašli jste, co hledáte?</h3>
              <p className="text-muted-foreground mb-0">
                Kontaktujte naši podporu a náš tým vám rád pomůže s jakýmkoli dotazem
              </p>
            </div>
            <Button size="lg" className="whitespace-nowrap">
              Kontaktovat podporu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 