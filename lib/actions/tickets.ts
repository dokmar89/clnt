"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import type { Database } from "../supabase/types"

interface CreateTicketParams {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
}

export async function createTicket(data: CreateTicketParams) {
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
    
    // Získání společnosti uživatele
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .eq("is_active", true)
      .maybeSingle()
    
    if (companyError) {
      console.error("Error getting company:", companyError)
      return { error: "Nepodařilo se načíst společnost" }
    }
    
    // Generování ID ticketu ve formátu TICKET-XXXX
    const ticketNumber = Math.floor(1000 + Math.random() * 9000)
    const ticketId = `TICKET-${ticketNumber}`
    
    // Vytvoření nového ticketu
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        id: uuidv4(),
        ticket_number: ticketId,
        user_id: user.id,
        company_id: company?.id,
        title: data.title,
        status: 'open',
        priority: data.priority,
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
        message: data.description,
        created_at: new Date().toISOString()
      })
    
    if (messageError) {
      console.error("Error creating ticket message:", messageError)
      return { error: "Ticket byl vytvořen, ale zpráva se nepodařila uložit" }
    }
    
    revalidatePath("/dashboard/support/tickets")
    
    return { success: true, ticket }
  } catch (error) {
    console.error("Error creating ticket:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při vytváření ticketu"
    }
  }
}

export async function getTickets() {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: "Uživatel není přihlášen", tickets: [] }
    }
    
    // Získání ticketů pro uživatele
    const { data: tickets, error: ticketsError } = await supabase
      .from("support_tickets")
      .select(`
        *,
        support_ticket_messages:support_ticket_messages(
          id,
          created_at
        )
      `)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
    
    if (ticketsError) {
      console.error("Error fetching tickets:", ticketsError)
      return { error: ticketsError.message, tickets: [] }
    }
    
    // Upravíme data, aby obsahovala počet zpráv
    const ticketsWithMessageCount = tickets.map(ticket => ({
      ...ticket,
      message_count: ticket.support_ticket_messages?.length || 0,
      // Odstraníme detailní data o zprávách, potřebujeme jen počet
      support_ticket_messages: undefined
    }))
    
    // Oddělíme aktivní a uzavřené tickety
    const activeTickets = ticketsWithMessageCount.filter(
      ticket => ticket.status !== 'closed'
    )
    
    const closedTickets = ticketsWithMessageCount.filter(
      ticket => ticket.status === 'closed'
    )
    
    return { 
      activeTickets, 
      closedTickets 
    }
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při načítání ticketů",
      activeTickets: [],
      closedTickets: []
    }
  }
} 