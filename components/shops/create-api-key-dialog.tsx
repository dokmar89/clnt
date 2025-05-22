"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Key, Copy, AlertCircle } from "lucide-react"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createApiKey } from "@/lib/actions/shops"

// Schéma formuláře pro vytvoření API klíče
const formSchema = z.object({
  description: z.string().min(2, "Popis musí mít alespoň 2 znaky"),
  expires_at: z.string().optional(),
})

interface CreateApiKeyDialogProps {
  shopId: string
}

export function CreateApiKeyDialog({ shopId }: CreateApiKeyDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      expires_at: "",
    },
  })
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    try {
      const result = await createApiKey({
        shop_id: shopId,
        description: values.description,
        expires_at: values.expires_at || undefined
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      // Zobrazíme úspěšnou zprávu a nastavíme API klíč pro zobrazení
      toast.success("Nový API klíč byl úspěšně vygenerován")
      if (result.apiKey) {
        setNewApiKey(result.apiKey)
      }
      form.reset()
    } catch (error) {
      toast.error("Došlo k chybě při generování API klíče")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  function handleClose() {
    if (newApiKey) {
      // Pokud uzavíráme s novým klíčem, obnovíme stránku aby se zobrazil v seznamu
      setIsOpen(false)
      setNewApiKey(null)
      router.refresh()
    } else {
      // Jinak jen zavřeme dialog
      setIsOpen(false)
    }
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("API klíč byl zkopírován do schránky")
      })
      .catch(() => {
        toast.error("Nepodařilo se zkopírovat API klíč")
      })
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Key className="h-4 w-4" />
          Vygenerovat nový klíč
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {newApiKey ? "API klíč vygenerován" : "Vygenerovat nový API klíč"}
          </DialogTitle>
          <DialogDescription>
            {newApiKey 
              ? "Zkopírujte si tento API klíč. Z bezpečnostních důvodů nebude později zobrazen v celém znění."
              : "Vyplňte informace pro vygenerování nového API klíče."
            }
          </DialogDescription>
        </DialogHeader>
        
        {newApiKey ? (
          <div className="py-4 space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-sm">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-700 mb-1">Důležité upozornění</h3>
                  <p className="text-sm text-yellow-600">
                    Tento API klíč bude zobrazen pouze jednou. Zkopírujte si jej a 
                    uložte na bezpečné místo. Z bezpečnostních důvodů nebude později 
                    možné zobrazit celý klíč.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-sm">Váš nový API klíč</div>
              <div className="relative">
                <code className="bg-muted p-3 text-xs rounded block w-full font-mono break-all">
                  {newApiKey}
                </code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-2"
                  onClick={() => copyToClipboard(newApiKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button onClick={handleClose}>
                Zavřít
              </Button>
            </DialogFooter>
          </div>
        ) : (
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
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Zrušit
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Generuji..." : "Vygenerovat klíč"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
