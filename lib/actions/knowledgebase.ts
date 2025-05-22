"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import type { Database } from "../supabase/types"

export async function getKnowledgeCategories() {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    // Načtení kategorií
    const { data: categories, error: categoriesError } = await supabase
      .from("kb_categories")
      .select("*, kb_articles(count)")
      .order("order", { ascending: true })
    
    if (categoriesError) {
      console.error("Error fetching kb categories:", categoriesError)
      return { error: categoriesError.message, categories: [] }
    }
    
    return { categories: categories || [] }
  } catch (error) {
    console.error("Error in getKnowledgeCategories:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při načítání kategorií znalostní báze", 
      categories: [] 
    }
  }
}

export async function getFeaturedArticles() {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    // Načtení doporučených článků
    const { data: articles, error: articlesError } = await supabase
      .from("kb_articles")
      .select("*, kb_categories(title)")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(3)
    
    if (articlesError) {
      console.error("Error fetching featured articles:", articlesError)
      return { error: articlesError.message, articles: [] }
    }
    
    return { articles: articles || [] }
  } catch (error) {
    console.error("Error in getFeaturedArticles:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při načítání doporučených článků", 
      articles: [] 
    }
  }
}

export async function searchKnowledgebase(query: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })
  
  try {
    if (!query || query.trim().length < 2) {
      return { error: "Příliš krátký vyhledávací dotaz", articles: [] }
    }
    
    // Vyhledávání článků
    const { data: articles, error: articlesError } = await supabase
      .from("kb_articles")
      .select("*, kb_categories(title)")
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order("created_at", { ascending: false })
    
    if (articlesError) {
      console.error("Error searching kb articles:", articlesError)
      return { error: articlesError.message, articles: [] }
    }
    
    return { articles: articles || [] }
  } catch (error) {
    console.error("Error in searchKnowledgebase:", error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Nastala chyba při vyhledávání", 
      articles: [] 
    }
  }
} 