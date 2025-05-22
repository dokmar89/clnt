import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import type { Database } from "@/lib/supabase/types"

export async function signIn(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  // Získat informace o uživateli
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) {
    return { error: "Nastala chyba s identifikací uživatele" }
  }
  
  // Získat informace o společnosti uživatele
  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user.user.id)
    .maybeSingle()
  
  if (companiesError) {
    return { error: "Chyba při načítání informací o společnosti" }
  }
  
  if (!companies) {
    return { error: "Nebyla nalezena žádná společnost pro tohoto uživatele" }
  }
  
  // Kontrola statusu společnosti
  if (!companies.is_active) {
    return { 
      error: "Váš účet zatím nebyl aktivován. Vyčkejte na schválení administrátorem.",
      pendingApproval: true
    }
  }
  
  // Vše je v pořádku, přesměrování na dashboard
  redirect("/dashboard")
} 