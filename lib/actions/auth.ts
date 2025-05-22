"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"

import { supabaseAdmin } from "../supabase/server"
import type { Database } from "../supabase/types"

export async function signIn(formData: FormData) {
  const cookieStore = await cookies()
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
  
  // Získat profil uživatele
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.user.id)
    .single()
  
  if (profileError) {
    return { error: "Chyba při načítání informací o profilu" }
  }
  
  if (!profile || !profile.is_active) {
    return { 
      error: "Váš účet zatím nebyl aktivován. Vyčkejte na schválení administrátorem.",
      pendingApproval: true
    }
  }
  
  // Získat informace o společnosti uživatele
  const { data: companyUsers, error: companyUsersError } = await supabase
    .from("company_users")
    .select(`
      company_id,
      role_in_company,
      companies (
        id,
        name,
        status,
        is_active
      )
    `)
    .eq("user_id", user.user.id)
    .single()
  
  if (companyUsersError) {
    return { error: "Chyba při načítání informací o společnosti" }
  }
  
  if (!companyUsers || !companyUsers.companies) {
    return { 
      error: "Nebyla nalezena žádná společnost pro tohoto uživatele",
      pendingApproval: true
    }
  }
  
  if (!companyUsers.companies.is_active || companyUsers.companies.status !== 'active') {
    return { 
      error: "Vaše společnost zatím nebyla aktivována. Vyčkejte na schválení administrátorem.",
      pendingApproval: true
    }
  }
  
  // Vše je v pořádku, přesměrování na dashboard
  redirect("/dashboard")
}

export async function registerCompany(data: {
  companyName: string;
  ico: string;
  dic: string;
  addressStreet: string;
  addressCity: string;
  addressZip: string;
  email: string;
  phone: string;
  contactPerson: string;
  password: string;
  terms: boolean;
}) {
  const cookieStore = await cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    // Registrace uživatele s metadaty pro trigger
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`,
        data: {
          // Metadata pro trigger v PostgreSQL
          full_name: data.contactPerson,
          company_name: data.companyName,
          ico: data.ico,
          dic: data.dic,
          address: data.addressStreet,
          city: data.addressCity,
          postal_code: data.addressZip,
          country: 'Czech Republic',
          contact_phone: data.phone
        }
      },
    })
    
    if (authError || !authData.user) {
      return { 
        success: false, 
        error: authError?.message || "Chyba při vytváření uživatele" 
      }
    }
    
    // Následující kód je zde pro případ, že by nebyly nastaveny databázové triggery
    // Normálně by tyto akce měl vykonat trigger v databázi
    
    // 1. Zkontrolujeme, zda se profil vytvořil. Pokud ne, vytvoříme ho
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .maybeSingle();
      
    if (!profile && authData.user) {
      try {
        await supabase.from('profiles').insert({
          user_id: authData.user.id,
          full_name: data.contactPerson,
          email: data.email,
          role: 'company_user',
          is_active: false
        });
      } catch (error) {
        console.error('Chyba při vytváření profilu:', error);
        // Pokračujeme, i když selže vytvoření profilu
      }
    }
    
    // 2. Vytvoříme firmu, pokud se nevytvořila triggerem
    let companyId = '';
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', authData.user.id)
      .maybeSingle();
      
    if (!company && authData.user) {
      try {
        const { data: newCompany, error: insertError } = await supabase.from('companies').insert({
          name: data.companyName,
          ico: data.ico,
          dic: data.dic,
          address: data.addressStreet,
          city: data.addressCity,
          postal_code: data.addressZip,
          country: 'Czech Republic',
          contact_email: data.email,
          contact_phone: data.phone,
          owner_id: authData.user.id,
          wallet_balance: 0,
          is_active: false,
          pricing_tier: 'no_contract'
        }).select('id').single();
        
        if (insertError) {
          console.error('Chyba při vytváření společnosti:', insertError);
          console.log('Data firmy:', {
            name: data.companyName,
            ico: data.ico,
            dic: data.dic,
            address: data.addressStreet,
            city: data.addressCity,
            postal_code: data.addressZip,
            country: 'Czech Republic',
            contact_email: data.email,
            contact_phone: data.phone,
            owner_id: authData.user.id,
            wallet_balance: 0,
            is_active: false,
            pricing_tier: 'no_contract'
          });
          return { 
            success: false, 
            error: `Chyba při vytváření firmy: ${insertError.message}` 
          };
        } else if (newCompany) {
          companyId = newCompany.id;
        }
      } catch (error) {
        console.error('Neočekávaná chyba při vytváření společnosti:', error);
      }
    } else if (company) {
      companyId = company.id;
    }
    
    // 3. Vytvoříme vazbu mezi uživatelem a firmou, pokud ještě neexistuje
    if (companyId && authData.user) {
      try {
        const { data: companyUser, error: companyUserError } = await supabase
          .from('company_users')
          .select('*')
          .eq('user_id', authData.user.id)
          .eq('company_id', companyId)
          .maybeSingle();
          
        if (!companyUser) {
          await supabase.from('company_users').insert({
            user_id: authData.user.id,
            company_id: companyId,
            role_in_company: 'owner'
          });
        }
      } catch (error) {
        console.error('Chyba při vytváření vazby uživatel-firma:', error);
      }
    }
    
    // Po insertu zkontrolujte, zda firma skutečně existuje
    const { data: checkCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', authData.user.id)
      .single();

    if (!checkCompany) {
      console.error('Firma nebyla vytvořena, ačkoliv nebyla hlášena žádná chyba');
      return { 
        success: false, 
        error: "Firma nebyla vytvořena z neznámého důvodu" 
      };
    }
    
    // Úspěšná registrace i bez audit logu
    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Neočekávaná chyba" 
    }
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  await supabase.auth.signOut()
  
  redirect("/auth/login")
} 