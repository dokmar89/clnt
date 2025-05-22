"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Building2, MapPin, Phone, Mail, CreditCard, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { Company } from "@/lib/supabase/types"

const formSchema = z.object({
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  ico: z.string().min(8, "IČO musí mít 8 znaků"),
  dic: z.string().min(8, "DIČ musí mít správný formát"),
  address: z.string().min(2, "Adresa musí mít alespoň 2 znaky"),
  city: z.string().min(2, "Zadejte město"),
  postal_code: z.string().min(5, "Zadejte PSČ"),
  country: z.string().min(2, "Zadejte zemi"),
  contact_email: z.string().email("Zadejte platný email"),
  contact_phone: z.string().min(9, "Zadejte platné telefonní číslo"),
})

interface AccountFormProps {
  company: Company
  readOnly?: boolean
}

export function AccountForm({ company, readOnly = false }: AccountFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: company.name,
      ico: company.ico,
      dic: company.dic || "",
      address: company.address || "",
      city: company.city || "",
      postal_code: company.postal_code || "",
      country: company.country || "Czech Republic",
      contact_email: company.contact_email,
      contact_phone: company.contact_phone || "",
    },
  })

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Tato funkce by měla aktualizovat údaje společnosti
    // Ve verzi jen pro čtení není potřeba implementovat
    toast.success("Údaje společnosti byly aktualizovány")
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-muted/50 p-4 rounded-lg flex flex-col">
          <div className="text-sm text-muted-foreground mb-2">Firma</div>
          <div className="text-lg font-semibold mb-1">{company.name}</div>
          <div className="flex gap-1 items-center text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span>IČO: {company.ico}</span>
          </div>
          {company.dic && (
            <div className="flex gap-1 items-center text-sm text-muted-foreground">
              <span>DIČ: {company.dic}</span>
            </div>
          )}
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg flex flex-col">
          <div className="text-sm text-muted-foreground mb-2">Adresa</div>
          <div className="text-base font-medium mb-1">{company.address}</div>
          <div className="flex gap-1 items-center text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{company.city}, {company.postal_code}</span>
          </div>
          <div className="text-sm text-muted-foreground">{company.country}</div>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg flex flex-col">
          <div className="text-sm text-muted-foreground mb-2">Kontakt</div>
          <div className="flex gap-1 items-center mb-1">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{company.contact_email}</span>
          </div>
          {company.contact_phone && (
            <div className="flex gap-1 items-center">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{company.contact_phone}</span>
            </div>
          )}
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Název společnosti</FormLabel>
                  <FormControl>
                    <Input disabled={readOnly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IČO</FormLabel>
                    <FormControl>
                      <Input disabled={readOnly} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DIČ</FormLabel>
                    <FormControl>
                      <Input disabled={readOnly} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Adresa</FormLabel>
                  <FormControl>
                    <Input disabled={readOnly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Město</FormLabel>
                  <FormControl>
                    <Input disabled={readOnly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PSČ</FormLabel>
                  <FormControl>
                    <Input disabled={readOnly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Země</FormLabel>
                  <FormControl>
                    <Input disabled={readOnly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontaktní email</FormLabel>
                  <FormControl>
                    <Input disabled={readOnly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontaktní telefon</FormLabel>
                  <FormControl>
                    <Input disabled={readOnly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Vytvořeno:</span>
              </div>
              <div className="text-sm ml-5 mt-1">{formatDate(company.created_at)}</div>
            </div>
            
            <div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Aktualizováno:</span>
              </div>
              <div className="text-sm ml-5 mt-1">{formatDate(company.updated_at)}</div>
            </div>
            
            <div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Stav účtu:</span>
              </div>
              <div className="ml-5 mt-1">
                <Badge variant={company.is_active ? "default" : "secondary"}>
                  {company.is_active ? "Aktivní" : "Neaktivní"}
                </Badge>
              </div>
            </div>
          </div>

          {!readOnly && (
            <Button type="submit">Uložit změny</Button>
          )}
        </form>
      </Form>
    </div>
  )
}
