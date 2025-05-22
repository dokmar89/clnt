"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Plus, AlertCircle } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createTicket } from "@/lib/actions/tickets"

const formSchema = z.object({
  title: z.string().min(5, "Název ticketu musí mít alespoň 5 znaků").max(100, "Název ticketu může mít maximálně 100 znaků"),
  description: z.string().min(10, "Popis musí mít alespoň 10 znaků"),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Prosím vyberte prioritu ticketu",
  })
})

export function CreateTicketDialog() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
    },
  })
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    try {
      const result = await createTicket({
        title: values.title,
        description: values.description,
        priority: values.priority as 'low' | 'medium' | 'high'
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success("Ticket byl úspěšně vytvořen")
      form.reset()
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Došlo k chybě při vytváření ticketu")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Plus className="h-4 w-4" />
          Nový ticket
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Vytvořit nový ticket</DialogTitle>
          <DialogDescription>
            Vyplňte potřebné informace pro vytvoření nového požadavku pro náš tým podpory.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Název ticketu</FormLabel>
                  <FormControl>
                    <Input placeholder="Např. Problém s integrací API" {...field} />
                  </FormControl>
                  <FormDescription>
                    Stručně popište váš problém nebo požadavek
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorita</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte prioritu" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Nízká</SelectItem>
                      <SelectItem value="medium">Střední</SelectItem>
                      <SelectItem value="high">Vysoká</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Zvolte prioritu podle naléhavosti vašeho požadavku
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
                  <FormLabel>Popis problému</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailně popište váš problém nebo požadavek..." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Uveďte všechny relevantní informace, které nám pomohou lépe porozumět vašemu problému
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 rounded-sm text-sm">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-1">Reakce na ticket</h4>
                  <p className="text-amber-700 dark:text-amber-300">
                    Náš tým podpory se vám ozve co nejdříve, typicky do 24 hodin v pracovní dny.
                  </p>
                </div>
              </div>
            </div>
            
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
                {isSubmitting ? "Odesílám..." : "Odeslat ticket"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 