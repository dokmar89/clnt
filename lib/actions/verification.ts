"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"

import type { Database } from "../supabase/types"

// Typy pro verifikační statistiky
interface VerificationStats {
  total: number
  successful: number
  failed: number
  todayTotal: number
  todaySuccessful: number
}

// Typy pro záznamy o verifikacích
interface VerificationLog {
  id: string
  created_at: string
  shop_name: string
  method: string
  result: 'success' | 'failure'
  transaction_id: string
}

export async function getRecentVerifications(limit = 5) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Uživatel není přihlášen", logs: [] }
  }
  
  // Získat společnosti, kde je uživatel vlastníkem
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .maybeSingle()
  
  if (companyError || !company) {
    return { error: companyError?.message || "Společnost nenalezena", logs: [] }
  }
  
  // Získat všechny obchody patřící společnosti
  const { data: shops, error: shopsError } = await supabase
    .from("shops")
    .select("id, name")
    .eq("company_id", company.id)
  
  if (shopsError || !shops || shops.length === 0) {
    return { logs: [] }
  }
  
  // Získat reálná data z verification_logs, pokud existují
  const { data: verificationLogs, error: logsError } = await supabase
    .from("verification_logs")
    .select(`
      *,
      shops:shop_id (
        name
      )
    `)
    .in('shop_id', shops.map(shop => shop.id))
    .order('started_at', { ascending: false })
    .limit(limit)
  
  if (logsError) {
    console.error("Error fetching verification logs:", logsError)
    return { logs: [] }
  }
  
  return { logs: verificationLogs || [] }
}

export async function getVerificationMethods() {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  // Získat všechny aktivní metody verifikace
  const { data: methods, error: methodsError } = await supabase
    .from("verification_methods")
    .select("*")
    .eq("is_enabled", true)
    .order("name", { ascending: true })
  
  if (methodsError) {
    return { error: methodsError.message, methods: [] }
  }
  
  return { methods }
}

export async function getVerificationStats() {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: "Uživatel není přihlášen", stats: null }
    }
    
    // Získat společnost uživatele
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .eq("is_active", true)
      .maybeSingle()
    
    if (companyError || !company) {
      return { error: companyError?.message || "Společnost nenalezena", stats: null }
    }
    
    // Získat všechny obchody společnosti
    const { data: shops, error: shopsError } = await supabase
      .from("shops")
      .select("id")
      .eq("company_id", company.id)
    
    if (shopsError || !shops || shops.length === 0) {
      // Vrátíme prázdné statistiky, pokud nejsou žádné obchody
      return { 
        stats: {
          total: 0,
          success: 0,
          failed: 0,
          byMethod: []
        } 
      }
    }
    
    const shopIds = shops.map(shop => shop.id)
    
    // Získat počet verifikací podle statutu
    const { data: totalCount, error: totalError } = await supabase
      .from("verification_logs")
      .select("status", { count: 'exact', head: true })
      .in("shop_id", shopIds)
    
    const { data: successCount, error: successError } = await supabase
      .from("verification_logs")
      .select("status", { count: 'exact', head: true })
      .in("shop_id", shopIds)
      .eq("status", "success")
    
    const { data: failedCount, error: failedError } = await supabase
      .from("verification_logs")
      .select("status", { count: 'exact', head: true })
      .in("shop_id", shopIds)
      .eq("status", "failed")
    
    // Získat počet verifikací podle metody
    const { data: methodStats, error: methodError } = await supabase
      .from("verification_logs")
      .select("method_code, count")
      .in("shop_id", shopIds)
      .group("method_code")
    
    if (totalError || successError || failedError || methodError) {
      console.error("Error fetching verification stats:", 
        totalError || successError || failedError || methodError)
    }
    
    return { 
      stats: {
        total: totalCount?.count || 0,
        success: successCount?.count || 0,
        failed: failedCount?.count || 0,
        byMethod: methodStats || []
      } 
    }
  } catch (error) {
    console.error("Error getting verification stats:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při načítání statistik", 
      stats: null 
    }
  }
} 