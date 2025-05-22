import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./types"

export async function uploadLogo(file: File) {
  const supabase = createClientComponentClient<Database>()
  
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase
      .storage
      .from('logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase
      .storage
      .from('logos')
      .getPublicUrl(fileName)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Error uploading logo:', error)
    return { success: false, error: "Nepodařilo se nahrát logo" }
  }
} 