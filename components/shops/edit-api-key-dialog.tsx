"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { updateApiKey } from "@/lib/actions/shops"

// Schéma formuláře pro úpravu API klíče
const formSchema = z.object({
  description: z.string().min(2, "Popis musí mít alespoň 2 znaky"),
  expires_at: z.string().optional(),
})

interface ApiKey {
  id: string
  shop_id: string
  api_key: string
  key_prefix?: string
  description?: string
  is_active: boolean
  created_at: string
  expires_at?: string
  last_used_at?: string
}

interface EditApiKeyDialogProps {
  apiKey: ApiKey
  isOpen: boolean
  onClose: () => void
}

export function EditApiKeyDialog({ apiKey, isOpen, onClose }: EditApiKeyDialogProps) {
  const router = useRouter()
  
  // Formátování data expirace pro input type="date"
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return ""
    
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: apiKey.description || "",
      expires_at: formatDateForInput(apiKey.expires_at),
    },
  })
  
  // Aktualizace hodnot při změně API klíče
  useEffect(() => {
    form.reset({
      description: apiKey.description || "",
      expires_at: formatDateForInput(apiKey.expires_at),
    })
  }, [form, apiKey])
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await updateApiKey({
        apiKeyId: apiKey.id,
        description: values.description,
        expires_at: values.expires_at || undefined
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success("API klíč byl úspěšně aktualizován")
      onClose()
      router.refresh()
    } catch (error) {
      toast.error("Došlo k chybě při aktualizaci API klíče")
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit API klíč</DialogTitle>
          <DialogDescription>
            Změňte popis nebo expiraci API klíče
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Popis</FormLabel>
                  <FormControl>
                    <Input placeholder="Např. Produkční klíč" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identifikace účelu klíče (např. "Testovací prostředí", "Produkce")
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Datum expirace (volitelné)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Datum, kdy klíč automaticky expiruje. Ponechte prázdné pro klíč bez expirace.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Zrušit
              </Button>
              <Button type="submit">
                Uložit změny
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 