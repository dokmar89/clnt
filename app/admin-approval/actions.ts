"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/types"
import { supabaseAdmin } from "@/lib/supabase/server"

// Funkce pro získání všech nevyřízených žádostí o registraci
export async function getPendingRegistrations() {
  const supabase = createServerActionClient<Database>({ cookies: () => cookies() })
  
  // Nejprve získáme všechny firmy pro diagnostiku
  const { data: allCompanies, error: allError } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false })
  
  console.log("Všechny firmy:", allCompanies) // Debug informace o všech firmách
  
  // Pak získáme nevyřízené žádosti
  const { data, error } = await supabase
    .from("companies")
    .select(`
      id,
      name,
      ico,
      dic,
      address,
      city,
      postal_code,
      country,
      contact_email,
      contact_phone,
      created_at,
      owner_id,
      is_active
    `)
    .eq("is_active", false)
    .order("created_at", { ascending: false })
  
  console.log("Nevyřízené žádosti:", data) // Debug informace o filtrovaných firmách
  
  if (error) {
    console.error("Chyba při načítání žádostí:", error)
    return { success: false, error: error.message, data: [] }
  }
  
  return { success: true, data: data || [] }
}

// Funkce pro schválení registrace
export async function approveRegistration(companyId: string, ownerId: string) {
  const supabase = createServerActionClient<Database>({ cookies: () => cookies() })
  
  try {
    // 1. Aktualizace společnosti na aktivní
    const { error: companyError } = await supabase
      .from("companies")
      .update({
        is_active: true
      })
      .eq("id", companyId)
    
    if (companyError) throw companyError
    
    // 2. Aktualizace profilu uživatele na aktivní
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        is_active: true
      })
      .eq("user_id", ownerId)
    
    if (profileError) throw profileError
    
    // 3. Potvrzení emailu uživatele pro vývojové účely
    try {
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({
        filter: { id: ownerId }
      });
      
      if (users && users.length > 0) {
        await supabaseAdmin.auth.admin.updateUserById(ownerId, {
          email_confirmed_at: new Date().toISOString()
        });
        console.log("Vývojový režim: Email byl automaticky potvrzen při schválení");
      }
    } catch (error) {
      console.error("Chyba při potvrzování emailu:", error);
      // Pokračujeme i při neúspěchu
    }
    
    // 4. Volitelné - vytvoření auditního záznamu
    try {
      await supabase.from("audit_logs").insert({
        user_id: ownerId,
        action: "company_approved",
        target_entity: "companies",
        target_id: companyId,
        target_company_id: companyId,
        details: {
          approved_at: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error("Chyba při vytváření audit logu (nekritická):", error)
      // Nezastavíme proces schválení, i když selže zápis do audit_logs
    }
    
    return { success: true }
  } catch (error) {
    console.error("Chyba při schvalování registrace:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Neočekávaná chyba"
    }
  }
}

// Funkce pro zamítnutí registrace
export async function rejectRegistration(companyId: string, ownerId: string) {
  const supabase = createServerActionClient<Database>({ cookies: () => cookies() })
  
  try {
    // 1. Aktualizace společnosti na zamítnutou
    const { error: companyError } = await supabase
      .from("companies")
      .update({
        status: "inactive",
        is_active: false
      })
      .eq("id", companyId)
    
    if (companyError) throw companyError
    
    // 2. Vytvoření auditního záznamu
    await supabase.from("audit_logs").insert({
      user_id: ownerId,
      action: "company_rejected",
      target_entity: "companies",
      target_id: companyId,
      target_company_id: companyId,
      details: {
        rejected_at: new Date().toISOString()
      }
    })
    
    return { success: true }
  } catch (error) {
    console.error("Chyba při zamítnutí registrace:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Neočekávaná chyba"
    }
  }
} 