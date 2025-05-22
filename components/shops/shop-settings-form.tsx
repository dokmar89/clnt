"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Save, Trash } from "lucide-react"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { updateShop, deleteShop } from "@/lib/actions/shops"
import type { Shop } from "@/lib/supabase/types"

// Seznam sektorů zboží s věkovým omezením
const RESTRICTED_SECTORS = [
  { value: "pyrotechnika", label: "Pyrotechnika" },
  { value: "alkohol", label: "Alkohol" },
  { value: "tabak", label: "Tabák a tabákové výrobky" },
  { value: "chemie", label: "Chemie a chemické látky" },
  { value: "zbrane", label: "Zbraně a střelivo" },
  { value: "erotika", label: "Erotika" },
  { value: "gambling", label: "Sázky a gambling" },
  { value: "ostatni", label: "Ostatní věkem omezené zboží" },
]

const formSchema = z.object({
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  url: z.string().url("Musí být platná URL").optional().or(z.literal("")),
  description: z.string().optional(),
  sector: z.string({
    required_error: "Vyberte sektor zboží",
  }),
})

interface ShopSettingsFormProps {
  shop: Shop
}

export function ShopSettingsForm({ shop }: ShopSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const router = useRouter()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: shop.name,
      url: shop.url || "",
      description: shop.description || "",
      sector: shop.sector || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {    
    setIsSubmitting(true)
    
    try {
      const result = await updateShop(shop.id, {
        name: values.name,
        url: values.url,
        description: values.description,
        sector: values.sector,
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success("Nastavení obchodu bylo úspěšně aktualizováno")
      router.refresh()
    } catch (error) {
      toast.error("Došlo k chybě při aktualizaci nastavení obchodu")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteShop = async () => {
    if (deleteConfirmation !== shop.name) {
      toast.error("Názvy obchodů se neshodují")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await deleteShop(shop.id)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success(`Obchod "${shop.name}" byl úspěšně smazán`)
      setIsDeleteDialogOpen(false)
      router.push("/dashboard/shops")
    } catch (error) {
      toast.error("Došlo k chybě při mazání obchodu")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-6">Nastavení obchodu</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Název obchodu</FormLabel>
                  <FormControl>
                    <Input placeholder="Můj e-shop" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL adresa</FormLabel>
                  <FormControl>
                    <Input placeholder="https://mujeshop.cz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sektor zboží</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte sektor zboží" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RESTRICTED_SECTORS.map((sector) => (
                        <SelectItem key={sector.value} value={sector.value}>
                          {sector.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Kategorie věkově omezeného zboží, které prodáváte
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Popis</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Stručný popis obchodu" 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="gap-1">
                <Save className="h-4 w-4" />
                {isSubmitting ? "Ukládám..." : "Uložit změny"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      
      <div className="border-t pt-6 mt-8">
        <h2 className="text-lg font-medium text-destructive mb-4">Nebezpečná zóna</h2>
        <p className="text-muted-foreground mb-4">
          Smazání obchodu je nevratná akce. Budou odstraněny všechny API klíče a data spojená s tímto obchodem.
        </p>
        
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="gap-1">
              <Trash className="h-4 w-4" />
              Smazat obchod
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Smazat obchod</DialogTitle>
              <DialogDescription>
                Tato akce je nevratná. Obchod bude trvale odstraněn ze systému.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="mb-4 text-sm">
                Pro potvrzení zadejte název obchodu: <strong>{shop.name}</strong>
              </p>
              <Input 
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Zadejte název obchodu"
              />
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isSubmitting}
              >
                Zrušit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteShop}
                disabled={isSubmitting || deleteConfirmation !== shop.name}
              >
                {isSubmitting ? "Mažu..." : "Smazat obchod"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 