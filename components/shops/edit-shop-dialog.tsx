"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateShop } from "@/lib/actions/shops"
import type { Shop } from "@/lib/supabase/types"

const formSchema = z.object({
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  url: z.string().url("Musí být platná URL").optional().or(z.literal("")),
  description: z.string().optional(),
})

interface EditShopDialogProps {
  shop: Shop
  isOpen: boolean
  onClose: () => void
}

export function EditShopDialog({ shop, isOpen, onClose }: EditShopDialogProps) {
  const router = useRouter()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: shop.name,
      url: shop.url || "",
      description: shop.description || "",
    },
  })
  
  // Aktualizace hodnot při změně obchodu
  useEffect(() => {
    form.reset({
      name: shop.name,
      url: shop.url || "",
      description: shop.description || "",
    })
  }, [form, shop])

  async function onSubmit(values: z.infer<typeof formSchema>) {    
    try {
      const result = await updateShop({
        shopId: shop.id,
        name: values.name,
        url: values.url,
        description: values.description
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success("E-shop byl úspěšně aktualizován")
      onClose()
      router.refresh()
    } catch (error) {
      toast.error("Došlo k chybě při aktualizaci e-shopu")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upravit e-shop</DialogTitle>
          <DialogDescription>
            Upravte nastavení vašeho e-shopu.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Název e-shopu</FormLabel>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Popis</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Stručný popis e-shopu" 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
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
              <Button type="submit">Uložit změny</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 