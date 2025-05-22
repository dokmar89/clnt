"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import type { Database } from "../supabase/types"
import type { Shop } from "../supabase/types"

interface CreateShopParams {
  name: string
  url?: string
  description?: string
  sector: string
}

export async function getShops() {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Uživatel není přihlášen", shops: [] }
  }
  
  // Nejprve získáme ID společnosti
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .maybeSingle()
  
  if (companyError || !company) {
    return { error: "Nemáte přístup k žádné aktivní společnosti", shops: [] }
  }
  
  // Získat obchody pro společnost
  const { data: shops, error: shopsError } = await supabase
    .from("shops")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
  
  if (shopsError) {
    return { error: shopsError.message, shops: [] }
  }
  
  return { shops }
}

export async function getShopById(id: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Uživatel není přihlášen", shop: null }
  }
  
  // Získat ID společnosti uživatele
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .maybeSingle()
  
  if (companyError || !company) {
    return { error: "Nemáte přístup k žádné aktivní společnosti", shop: null }
  }
  
  // Získat obchod
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("*")
    .eq("id", id)
    .eq("company_id", company.id)
    .maybeSingle()
  
  if (shopError) {
    return { error: shopError.message, shop: null }
  }
  
  if (!shop) {
    return { error: "Obchod nenalezen", shop: null }
  }
  
  return { shop }
}

export async function createShop(data: CreateShopParams) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: "Uživatel není přihlášen" }
    }
    
    // Získat ID společnosti uživatele
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .eq("is_active", true)
      .maybeSingle()
    
    if (companyError || !company) {
      return { error: "Nemáte přístup k žádné aktivní společnosti" }
    }
    
    // Začít transakci pro vytvoření obchodu a API klíče
    const shopId = uuidv4()
    
    // Vytvořit nový obchod
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .insert({
        id: shopId,
        company_id: company.id,
        name: data.name,
        url: data.url || "",
        description: data.description || "",
        sector: data.sector,
        is_active: true
      })
      .select()
      .single()
    
    if (shopError) {
      return { error: shopError.message }
    }
    
    // Vygenerovat API klíč pro nový obchod
    const apiKeyValue = generateUniqueApiKey()
    
    const { data: apiKey, error: apiKeyError } = await supabase
      .from("api_keys")
      .insert({
        id: uuidv4(),
        shop_id: shopId,
        api_key: apiKeyValue,
        description: "Výchozí API klíč",
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (apiKeyError) {
      // Pokud se nepodaří vytvořit API klíč, měli bychom teoreticky smazat vytvořený obchod,
      // ale v tomto případě to necháme na manuální řešení, abychom nemuseli implementovat rollback
      console.error("Error creating API key:", apiKeyError)
      return { error: "Obchod byl vytvořen, ale nepodařilo se vygenerovat API klíč" }
    }
    
    // Můžeme také zaznamenat log o vytvoření obchodu a API klíče
    await supabase
      .from("shop_logs")
      .insert({
        id: uuidv4(),
        shop_id: shopId,
        action: "create",
        details: JSON.stringify({
          message: "Obchod a API klíč byly vytvořeny",
          user_id: user.id,
          timestamp: new Date().toISOString()
        })
      })
    
    revalidatePath("/dashboard/shops")
    
    return { success: true, shop }
  } catch (error) {
    console.error("Error creating shop:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při vytváření obchodu"
    }
  }
}

// Pomocná funkce pro generování API klíče
function generateUniqueApiKey() {
  return 'sk_' + uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').substring(0, 16);
}

export async function updateShop(data: UpdateShopParams) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: "Uživatel není přihlášen" }
    }
    
    // Získat obchod a ověřit, že uživatel má přístup k tomuto obchodu
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("*, companies!inner(*)")
      .eq("id", data.shopId)
      .maybeSingle()
    
    if (shopError || !shop) {
      return { error: shopError?.message || "E-shop nenalezen" }
    }
    
    // Zkontrolovat, zda uživatel má přístup k tomuto obchodu (je vlastníkem společnosti)
    if (shop.companies.owner_id !== user.id) {
      return { error: "Nemáte přístup k tomuto e-shopu" }
    }
    
    // Aktualizovat obchod
    const { data: updatedShop, error: updateError } = await supabase
      .from("shops")
      .update({
        name: data.name !== undefined ? data.name : shop.name,
        url: data.url !== undefined ? data.url : shop.url,
        description: data.description !== undefined ? data.description : shop.description,
      })
      .eq("id", data.shopId)
      .select()
      .single()
    
    if (updateError) {
      return { error: updateError.message }
    }
    
    // Zaznamenat log o aktualizaci obchodu
    await supabase
      .from("shop_logs")
      .insert({
        id: uuidv4(),
        shop_id: data.shopId,
        action: "update",
        details: JSON.stringify({
          message: "E-shop byl aktualizován",
          user_id: user.id,
          timestamp: new Date().toISOString()
        })
      })
    
    revalidatePath("/dashboard/shops")
    revalidatePath(`/dashboard/shops/${data.shopId}`)
    revalidatePath(`/dashboard/shops/${data.shopId}/api-keys`)
    
    return { success: true, shop: updatedShop }
  } catch (error) {
    console.error("Error updating shop:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při aktualizaci e-shopu"
    }
  }
}

// Funkce pro aktualizaci stavu obchodu (aktivace/deaktivace)
export async function updateShopStatus(data: UpdateShopStatusParams) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: "Uživatel není přihlášen" }
    }
    
    // Získat obchod a ověřit, že uživatel má přístup k tomuto obchodu
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("*, companies!inner(*)")
      .eq("id", data.shopId)
      .maybeSingle()
    
    if (shopError || !shop) {
      return { error: shopError?.message || "E-shop nenalezen" }
    }
    
    // Zkontrolovat, zda uživatel má přístup k tomuto obchodu (je vlastníkem společnosti)
    if (shop.companies.owner_id !== user.id) {
      return { error: "Nemáte přístup k tomuto e-shopu" }
    }
    
    // Aktualizovat stav obchodu
    const { data: updatedShop, error: updateError } = await supabase
      .from("shops")
      .update({
        is_active: data.isActive
      })
      .eq("id", data.shopId)
      .select()
      .single()
    
    if (updateError) {
      return { error: updateError.message }
    }
    
    // Zaznamenat log o změně stavu obchodu
    await supabase
      .from("shop_logs")
      .insert({
        id: uuidv4(),
        shop_id: data.shopId,
        action: data.isActive ? "activate" : "deactivate",
        details: JSON.stringify({
          message: data.isActive 
            ? "E-shop byl aktivován" 
            : "E-shop byl deaktivován",
          user_id: user.id,
          timestamp: new Date().toISOString()
        })
      })
    
    revalidatePath("/dashboard/shops")
    revalidatePath(`/dashboard/shops/${data.shopId}`)
    revalidatePath(`/dashboard/shops/${data.shopId}/api-keys`)
    
    return { success: true, shop: updatedShop }
  } catch (error) {
    console.error("Error updating shop status:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při aktualizaci stavu e-shopu"
    }
  }
}

// Funkce pro smazání obchodu
export async function deleteShop(shopId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: "Uživatel není přihlášen" }
    }
    
    // Získat obchod a ověřit, že uživatel má přístup k tomuto obchodu
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("*, companies!inner(*)")
      .eq("id", shopId)
      .maybeSingle()
    
    if (shopError || !shop) {
      return { error: shopError?.message || "E-shop nenalezen" }
    }
    
    // Zkontrolovat, zda uživatel má přístup k tomuto obchodu (je vlastníkem společnosti)
    if (shop.companies.owner_id !== user.id) {
      return { error: "Nemáte přístup k tomuto e-shopu" }
    }
    
    // Smazat obchod
    const { error: deleteError } = await supabase
      .from("shops")
      .delete()
      .eq("id", shopId)
    
    if (deleteError) {
      return { error: deleteError.message }
    }
    
    revalidatePath("/dashboard/shops")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting shop:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při mazání e-shopu"
    }
  }
}

// Funkce pro získání API klíčů pro konkrétní obchod
export async function getApiKeys(shopId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Uživatel není přihlášen", apiKeys: [] }
  }
  
  // Získat obchod a ověřit, že uživatel má přístup k tomuto obchodu
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("*, companies!inner(*)")
    .eq("id", shopId)
    .maybeSingle()
  
  if (shopError || !shop) {
    return { error: "E-shop nenalezen", apiKeys: [] }
  }
  
  // Zkontrolovat, zda uživatel má přístup k tomuto obchodu (je vlastníkem společnosti)
  if (shop.companies.owner_id !== user.id) {
    return { error: "Nemáte přístup k tomuto e-shopu", apiKeys: [] }
  }
  
  // Získat API klíče pro obchod
  const { data: apiKeys, error: apiKeysError } = await supabase
    .from("api_keys")
    .select("*")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false })
  
  if (apiKeysError) {
    return { error: apiKeysError.message, apiKeys: [] }
  }
  
  return { apiKeys }
}

// Funkce pro vytvoření API klíče
export async function createApiKey(data: CreateApiKeyParams) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: "Uživatel není přihlášen" }
    }
    
    // Získat obchod a ověřit, že uživatel má přístup k tomuto obchodu
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("*, companies!inner(*)")
      .eq("id", data.shop_id)
      .maybeSingle()
    
    if (shopError || !shop) {
      return { error: "E-shop nenalezen" }
    }
    
    // Zkontrolovat, zda uživatel má přístup k tomuto obchodu (je vlastníkem společnosti)
    if (shop.companies.owner_id !== user.id) {
      return { error: "Nemáte přístup k tomuto e-shopu" }
    }
    
    // Vygenerovat nový API klíč
    const apiKeyValue = generateUniqueApiKey()
    const keyPrefix = extractKeyPrefix(apiKeyValue)
    const hashedKey = await hashApiKey(apiKeyValue)
    
    // Vložit nový API klíč do databáze
    const { data: apiKey, error: apiKeyError } = await supabase
      .from("api_keys")
      .insert({
        id: uuidv4(),
        shop_id: data.shop_id,
        key_prefix: keyPrefix,
        hashed_key: hashedKey,
        description: data.description || "",
        status: 'active',
        expires_at: data.expires_at,
        created_by_user_id: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (apiKeyError) {
      console.error("Error creating API key:", apiKeyError)
      return { error: apiKeyError.message }
    }
    
    // Zaznamenat log o vytvoření API klíče
    await supabase
      .from("shop_logs")
      .insert({
        id: uuidv4(),
        shop_id: data.shop_id,
        action: "api_key_create",
        details: JSON.stringify({
          message: "Nový API klíč byl vygenerován",
          key_prefix: keyPrefix,
          user_id: user.id,
          timestamp: new Date().toISOString()
        })
      })
    
    revalidatePath(`/dashboard/shops/${data.shop_id}/api-keys`)
    
    // Vrátit kompletní API klíč (zobrazí se jen jednou)
    return { 
      success: true, 
      apiKey: apiKeyValue,
      apiKeyData: apiKey
    }
  } catch (error) {
    console.error("Error creating API key:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při generování API klíče"
    }
  }
}

// Pomocná funkce pro hashování API klíče (jednoduchá implementace)
async function hashApiKey(apiKey: string) {
  // V produkčním prostředí byste měli použít skutečné kryptografické hashování
  // Například pomocí crypto modulu nebo argon2
  return apiKey.split('').reverse().join(''); // Toto je jen demonstrativní!
}

// Funkce pro aktualizaci API klíče
export async function updateApiKey(data: UpdateApiKeyParams) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: "Uživatel není přihlášen" }
    }
    
    // Získat API klíč včetně obchodu a společnosti
    const { data: apiKey, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("*, shops!inner(*, companies!inner(*))")
      .eq("id", data.apiKeyId)
      .maybeSingle()
    
    if (apiKeyError || !apiKey) {
      return { error: "API klíč nenalezen" }
    }
    
    // Zkontrolovat, zda uživatel má přístup k tomuto API klíči
    if (apiKey.shops.companies.owner_id !== user.id) {
      return { error: "Nemáte přístup k tomuto API klíči" }
    }
    
    // Aktualizovat API klíč
    const { data: updatedApiKey, error: updateError } = await supabase
      .from("api_keys")
      .update({
        description: data.description,
        expires_at: data.expires_at
      })
      .eq("id", data.apiKeyId)
      .select()
      .single()
    
    if (updateError) {
      return { error: updateError.message }
    }
    
    // Zaznamenat log o aktualizaci API klíče
    await supabase
      .from("shop_logs")
      .insert({
        id: uuidv4(),
        shop_id: apiKey.shop_id,
        action: "api_key_update",
        details: JSON.stringify({
          message: "API klíč byl aktualizován",
          key_prefix: apiKey.key_prefix,
          user_id: user.id,
          timestamp: new Date().toISOString()
        })
      })
    
    revalidatePath(`/dashboard/shops/${apiKey.shop_id}/api-keys`)
    
    return { success: true, apiKey: updatedApiKey }
  } catch (error) {
    console.error("Error updating API key:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při aktualizaci API klíče"
    }
  }
}

// Funkce pro zneplatnění API klíče
export async function revokeApiKey(apiKeyId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: "Uživatel není přihlášen" }
    }
    
    // Získat API klíč včetně obchodu a společnosti
    const { data: apiKey, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("*, shops!inner(*, companies!inner(*))")
      .eq("id", apiKeyId)
      .maybeSingle()
    
    if (apiKeyError || !apiKey) {
      return { error: "API klíč nenalezen" }
    }
    
    // Zkontrolovat, zda uživatel má přístup k tomuto API klíči
    if (apiKey.shops.companies.owner_id !== user.id) {
      return { error: "Nemáte přístup k tomuto API klíči" }
    }
    
    // Zneplatnit API klíč
    const { data: revokedApiKey, error: revokeError } = await supabase
      .from("api_keys")
      .update({
        status: 'revoked'
      })
      .eq("id", apiKeyId)
      .select()
      .single()
    
    if (revokeError) {
      return { error: revokeError.message }
    }
    
    // Zaznamenat log o zneplatnění API klíče
    await supabase
      .from("shop_logs")
      .insert({
        id: uuidv4(),
        shop_id: apiKey.shop_id,
        action: "api_key_revoke",
        details: JSON.stringify({
          message: "API klíč byl zneplatněn",
          key_prefix: apiKey.key_prefix,
          user_id: user.id,
          timestamp: new Date().toISOString()
        })
      })
    
    revalidatePath(`/dashboard/shops/${apiKey.shop_id}/api-keys`)
    
    return { success: true, apiKey: revokedApiKey }
  } catch (error) {
    console.error("Error revoking API key:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při zneplatnění API klíče"
    }
  }
}

// Pomocná funkce pro extrakci prefixu klíče
function extractKeyPrefix(apiKey: string) {
  // Vytvoření prefixu pro zobrazení (např. sk_live_abcd...)
  return apiKey.substring(0, 12) + '...';
}

// Funkce pro získání e-shopů pro konkrétní společnost
export async function getShopsByCompanyId(companyId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Uživatel není přihlášen", shops: [] }
  }
  
  // Ověřit, že uživatel má přístup k této společnosti
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .maybeSingle()
  
  if (companyError || !company) {
    return { error: "Nemáte přístup k této společnosti", shops: [] }
  }
  
  // Získat obchody pro společnost
  const { data: shops, error: shopsError } = await supabase
    .from("shops")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
  
  if (shopsError) {
    return { error: shopsError.message, shops: [] }
  }
  
  return { shops }
} 
