"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { PlusCircle, UserPlus, X, Check, AlertCircle } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/lib/supabase/types"

interface UserAccess {
  id: string
  email: string
  full_name: string
  role_in_company: 'owner' | 'admin' | 'member' | 'viewer'
  status: 'pending' | 'active' | 'inactive'
  created_at: string
}

interface UserAccessManagementProps {
  companyId: string
}

const userFormSchema = z.object({
  email: z.string().email("Zadejte platný email"),
  full_name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  role_in_company: z.enum(["admin", "member", "viewer"], {
    required_error: "Vyberte roli pro uživatele",
  }),
});

export function UserAccessManagement({ companyId }: UserAccessManagementProps) {
  const [users, setUsers] = useState<UserAccess[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient<Database>()

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      full_name: "",
      role_in_company: "member",
    },
  })

  useEffect(() => {
    async function loadUsers() {
      try {
        setIsLoading(true)
        
        // V reálné implementaci bychom načetli skutečné uživatele
        // Pro demonstraci používáme vzorová data
        
        setUsers([
          {
            id: '1',
            email: 'admin@example.com',
            full_name: 'Jan Novák',
            role_in_company: 'owner',
            status: 'active',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            email: 'user@example.com',
            full_name: 'Petr Svoboda',
            role_in_company: 'admin',
            status: 'active',
            created_at: new Date().toISOString()
          }
        ])
      } catch (error) {
        console.error("Error loading users:", error)
        toast.error("Nepodařilo se načíst uživatele")
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [companyId, supabase])

  async function onSubmit(values: z.infer<typeof userFormSchema>) {
    setIsSubmitting(true)
    try {
      // Zde by byl skutečný kód pro vytvoření oprávnění uživatele
      console.log('Vytvářím oprávnění pro:', values)
      
      // Simulace úspěšného vytvoření
      const newUser: UserAccess = {
        id: Math.random().toString(36).substring(2, 11),
        email: values.email,
        full_name: values.full_name,
        role_in_company: values.role_in_company as any,
        status: 'pending',
        created_at: new Date().toISOString()
      }
      
      setUsers([...users, newUser])
      
      toast.success("Oprávnění bylo úspěšně vytvořeno")
      setIsDialogOpen(false)
      form.reset()
    } catch (error) {
      console.error("Error creating user access:", error)
      toast.error("Nepodařilo se vytvořit oprávnění")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge>Vlastník</Badge>
      case 'admin':
        return <Badge variant="destructive">Administrátor</Badge>
      case 'member':
        return <Badge variant="secondary">Správce</Badge>
      case 'viewer':
        return <Badge variant="outline">Prohlížeč</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="bg-green-100 text-green-800">Aktivní</Badge>
      case 'pending':
        return <Badge variant="warning" className="bg-yellow-100 text-yellow-800">Čeká na potvrzení</Badge>
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Neaktivní</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Správa oprávnění uživatelů</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <UserPlus className="h-4 w-4" />
              Vytvořit oprávnění
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vytvořit nové oprávnění</DialogTitle>
              <DialogDescription>
                Přidejte nového uživatele a nastavte mu příslušná oprávnění.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jméno a příjmení</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan Novák" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="jnovak@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role_in_company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte roli" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrátor</SelectItem>
                          <SelectItem value="member">Správce</SelectItem>
                          <SelectItem value="viewer">Prohlížeč</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Administrátor má plnou kontrolu nad účtem. Správce může spravovat některé části. 
                        Prohlížeč má pouze přístup pro čtení.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Zrušit
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Vytváření..." : "Vytvořit oprávnění"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center">
              <p>Načítání uživatelů...</p>
            </div>
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-6">
              <UserPlus className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Zatím nebyla vytvořena žádná oprávnění</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
              >
                Vytvořit první oprávnění
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jméno</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Stav</TableHead>
                  <TableHead>Vytvořeno</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role_in_company)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('cs-CZ')}</TableCell>
                    <TableCell className="text-right">
                      {user.role_in_company !== 'owner' && (
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Upravit
                          </Button>
                          {user.status === 'active' ? (
                            <Button variant="destructive" size="sm">
                              Deaktivovat
                            </Button>
                          ) : (
                            <Button variant="default" size="sm">
                              Aktivovat
                            </Button>
                          )}
                        </div>
                      )}
                      {user.role_in_company === 'owner' && (
                        <span className="text-muted-foreground text-sm">Nelze upravit</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between p-4 pt-0">
            <div className="text-sm text-muted-foreground">
              Celkem uživatelů: {users.length}
            </div>
            <div className="flex items-center text-sm gap-4">
              <div className="flex items-center gap-1">
                <Badge variant="success" className="bg-green-100 text-green-800">●</Badge>
                <span>Aktivní: {users.filter(u => u.status === 'active').length}</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="warning" className="bg-yellow-100 text-yellow-800">●</Badge>
                <span>Čekající: {users.filter(u => u.status === 'pending').length}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informace o oprávněních</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Typy rolí:</h4>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  <li><strong>Vlastník</strong> - Má plný přístup ke všem funkcím a nastavením</li>
                  <li><strong>Administrátor</strong> - Může spravovat uživatele a většinu nastavení</li>
                  <li><strong>Správce</strong> - Může pracovat s daty, ale nemůže měnit důležitá nastavení</li>
                  <li><strong>Prohlížeč</strong> - Může pouze prohlížet data bez možnosti úprav</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Vytváření oprávnění:</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Když vytvoříte nové oprávnění, uživatel obdrží e-mail s instrukcemi pro nastavení hesla a aktivaci účtu.
                  Dokud uživatel neaktivuje svůj účet, zůstává jeho stav "Čeká na potvrzení".
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}