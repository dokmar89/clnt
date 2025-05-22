"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import type { Database } from "../supabase/types"

interface ContactSupportParams {
  subject: string
  message: string
}

export async function contactSupport(data: ContactSupportParams) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: "Uživatel není přihlášen" }
    }
    
    // Získání profilu uživatele
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
    
    if (profileError) {
      console.error("Error getting user profile:", profileError)
      return { error: "Nepodařilo se načíst profil uživatele" }
    }
    
    // Vytvoření nového ticketu z formuláře kontaktní podpory
    const ticketNumber = Math.floor(1000 + Math.random() * 9000)
    const ticketId = `TICKET-${ticketNumber}`
    
    // Vytvoření nového ticketu
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        id: uuidv4(),
        ticket_number: ticketId,
        user_id: user.id,
        company_id: profile.company_id,
        title: data.subject,
        status: 'open',
        priority: 'medium', // Výchozí priorita
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (ticketError) {
      console.error("Error creating ticket:", ticketError)
      return { error: "Nepodařilo se vytvořit ticket" }
    }
    
    // Přidání první zprávy do ticketu
    const { error: messageError } = await supabase
      .from("support_ticket_messages")
      .insert({
        id: uuidv4(),
        ticket_id: ticket.id,
        user_id: user.id,
        user_name: profile.full_name || user.email,
        is_from_support: false,
        message: data.message,
        created_at: new Date().toISOString()
      })
    
    if (messageError) {
      console.error("Error creating ticket message:", messageError)
      return { error: "Ticket byl vytvořen, ale zpráva se nepodařila uložit" }
    }
    
    revalidatePath("/dashboard/support/tickets")
    
    return { success: true, ticket }
  } catch (error) {
    console.error("Error contacting support:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při kontaktování podpory"
    }
  }
} 