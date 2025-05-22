"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

import type { Database } from "../supabase/types"

const topUpSchema = z.object({
  companyId: z.string().uuid(),
  amount: z.number().positive(),
})

export async function createTopUpTransaction(formData: z.infer<typeof topUpSchema>) {
    const cookieStore = cookies();
    const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });
    
    try {
        const transactionUuid = uuidv4(); // Generujeme UUID pro primární klíč
        // Nejprve ověříme, že společnost existuje
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("id")
          .eq("id", formData.companyId)
          .single();

        if (companyError || !company) {
          throw new Error("Společnost nebyla nalezena");
        }
        // Vytvoříme transakci s UUID jako ID a číselným ID jako transaction_number
        const { data, error } = await supabase
          .from("wallet_transactions")
          .insert({
            id: transactionUuid, // UUID pro primární klíč
            company_id: company.id,
            type: "credit",
            amount: formData.amount,
            description: "Dobití kreditu",
            status: "pending",
          })
          .select()
          .single();

        if (error) {
          throw new Error("Došlo k chybě při vytváření transakce: " + error.message);
        }

        await revalidatePath("/dashboard");
        return { 
          success: true, 
          data: { 
            id: data.transaction_number, 
            companyId: company.id 
          } 
        };

    } catch (error: any) {
        console.error("Chyba při vytváření transakce:", error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : "Došlo k chybě při vytváření transakce"
        };
    }
}

export async function checkTopUpStatus(transactionId: string) {
    const cookieStore = cookies();
    const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });
    
    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("status")
        .eq("transaction_number", transactionId) // Hledáme podle číselného ID
        .single();

      if (error) throw error;

      return { success: true, status: data.status };
    } catch (error) {
      console.error("Chyba při kontrole stavu transakce:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Došlo k chybě při kontrole stavu transakce" 
      };
    }
}

export async function getWalletBalance() {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: "Uživatel není přihlášen", balance: 0 }
    }
    
    // Získat společnost uživatele
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("wallet_balance")
      .eq("owner_id", user.id)
      .maybeSingle()
    
    if (companyError || !company) {
      return { error: companyError?.message || "Společnost nenalezena", balance: 0 }
    }
    
    return { balance: company.wallet_balance || 0 }
  } catch (error) {
    console.error("Error getting wallet balance:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při načítání zůstatku", 
      balance: 0 
    }
  }
}

export async function getWalletTransactions(limit = 10) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Uživatel není přihlášen", transactions: [] }
  }
  
  // Získat společnosti, kde je uživatel vlastníkem
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .maybeSingle()
  
  if (companyError || !company) {
    return { error: "Nemáte přístup k žádné aktivní společnosti", transactions: [] }
  }
  
  // Získat transakce
  const { data: transactions, error: transactionsError } = await supabase
    .from("wallet_transactions")
    .select(`
      *,
      verification_logs (
        id,
        method_code,
        user_identifier_input
      )
    `)
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(limit)
  
  if (transactionsError) {
    return { error: transactionsError.message, transactions: [] }
  }
  
  return { transactions }
}

export async function topUpWallet(amount: number) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    if (amount < 100) {
      return { error: "Minimální částka pro dobití je 100 Kč" }
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: "Uživatel není přihlášen" }
    }
    
    // Získat společnost uživatele
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
    
    if (companyError || !company) {
      return { error: companyError?.message || "Společnost nenalezena" }
    }
    
    // Vytvořit novou transakci pro dobití
    const transactionId = uuidv4()
    const { error: transactionError } = await supabase
      .from("wallet_transactions")
      .insert({
        id: transactionId,
        company_id: company.id,
        amount: amount,
        description: `Dobití kreditu ${amount} Kč`,
        transaction_type: "credit",
        status: "pending"
      })
    
    if (transactionError) {
      return { error: transactionError.message }
    }
    
    revalidatePath("/dashboard/billing")
    
    // V reálné implementaci by zde bylo přesměrování na platební bránu
    // Pro ukázku jen vracíme úspěch
    return { 
      success: true,
      transactionId: transactionId,
      // V reálné implementaci by zde byla URL platební brány
      redirectUrl: `/api/payment/${transactionId}`
    }
  } catch (error) {
    console.error("Error topping up wallet:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při dobíjení kreditu"
    }
  }
}

export async function checkAllPayments() {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: "Uživatel není přihlášen" }
    }
    
    // Získat společnost uživatele
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
    
    if (companyError || !company) {
      return { error: companyError?.message || "Společnost nenalezena" }
    }
    
    // Získat všechny čekající transakce
    const { data: pendingTransactions, error: transactionsError } = await supabase
      .from("wallet_transactions")
      .select("id")
      .eq("company_id", company.id)
      .eq("status", "pending")
    
    if (transactionsError) {
      return { error: transactionsError.message }
    }
    
    // V reálné implementaci bychom zde kontrolovali každou transakci s platební bránou
    // Pro ukázku jen simulujeme úspěch
    
    revalidatePath("/dashboard/billing")
    
    return { 
      success: true, 
      checkedCount: pendingTransactions?.length || 0 
    }
  } catch (error) {
    console.error("Error checking payments:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při kontrole plateb"
    }
  }
} 