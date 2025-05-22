"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "../supabase/types"

// Funkce pro získání aktivní společnosti uživatele
export async function getCompany() {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Uživatel není přihlášen", company: null }
  }
  
  // Získat aktivní společnost uživatele
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .maybeSingle()
  
  if (companyError) {
    return { error: companyError.message, company: null }
  }
  
  if (!company) {
    return { error: "Uživatel nemá žádnou aktivní společnost", company: null }
  }
  
  return { company }
} 