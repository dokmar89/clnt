"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Plus } from "lucide-react"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createShop } from "@/lib/actions/shops"

const formSchema = z.object({
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  url: z.string().url("Musí být platná URL").optional().or(z.literal("")),
  description: z.string().optional(),
})

interface AddShopDialogProps {
  companyId: string
}

export function AddShopDialog({ companyId }: AddShopDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {    
    try {
      const result = await createShop({
        companyId,
        name: values.name,
        url: values.url,
        description: values.description
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success("E-shop byl úspěšně vytvořen")
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (error) {
      toast.error("Došlo k chybě při vytváření e-shopu")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Plus className="h-4 w-4" />
          Přidat nový e-shop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Přidat nový e-shop</DialogTitle>
          <DialogDescription>
            Vytvořte nový e-shop pro integraci verifikačního systému.
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
                onClick={() => setOpen(false)}
              >
                Zrušit
              </Button>
              <Button type="submit">Vytvořit e-shop</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
