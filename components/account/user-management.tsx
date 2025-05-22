"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/lib/supabase/types"

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  position: string
  role: 'user' | 'owner'
  status: 'pending' | 'active' | 'inactive'
  avatar: string
}

interface UserManagementProps {
  companyId: string
}

export function UserManagement({ companyId }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function loadUsers() {
      try {
        setIsLoading(true)
        
        // V produkční verzi bychom zde načetli seznam uživatelů z databáze
        // Pro účely ukázky používáme vzorové údaje
        
        setUsers([
          {
            id: '1',
            email: 'admin@example.com',
            first_name: 'Admin',
            last_name: 'User',
            position: 'Administrator',
            role: 'owner',
            status: 'active',
            avatar: ''
          },
          // Další vzorové údaje by mohly být zde
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Uživatelé s přístupem</h3>
        <Button className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Pozvat uživatele
        </Button>
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
            <div className="text-center">
              <p className="text-muted-foreground">Zatím nejsou žádní uživatelé</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jméno</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Pozice</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Stav</TableHead>
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.position}</TableCell>
                <TableCell>
                  {user.role === 'owner' ? 'Vlastník' : 'Uživatel'}
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status === 'active' ? 'Aktivní' : user.status === 'pending' ? 'Čekající' : 'Neaktivní'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" disabled={user.role === 'owner'}>
                    Upravit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
