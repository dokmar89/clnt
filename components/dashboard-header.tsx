"use client"

import { useEffect, useState } from "react"
import { Bell, Key, Store, Search, PlusCircle, CreditCard, LogOut, HelpCircle, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"

type DashboardHeaderProps = {
  userName: string
  userEmail: string
  avatarUrl?: string
}

export function DashboardHeader({ userName, userEmail, avatarUrl }: DashboardHeaderProps) {
  const [date, setDate] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])
  
  const formatDate = () => {
    return date.toLocaleDateString('cs-CZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="h-16 border-b flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Hledat v systému..."
            className="w-64 pl-9 rounded-full bg-muted/40 focus-visible:bg-background"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:block text-sm text-muted-foreground">
          {formatDate()}
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Vytvořit</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Nová položka</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Store className="mr-2 h-4 w-4" />
                  <span>E-shop</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Key className="mr-2 h-4 w-4" />
                  <span>API klíč</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Dobít kredit</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                2
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-2">
              <h4 className="font-medium">Notifikace</h4>
              <div className="border rounded-lg divide-y">
                <div className="p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-2">
                    <Badge className="mt-0.5">Nové</Badge>
                    <div>
                      <p className="text-sm font-medium">Přidán nový e-shop</p>
                      <p className="text-xs text-muted-foreground">Váš e-shop byl úspěšně přidán a je připraven k použití.</p>
                      <p className="text-xs text-muted-foreground mt-1">Před 2 hodinami</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Info</Badge>
                    <div>
                      <p className="text-sm font-medium">Kredit byl připsán</p>
                      <p className="text-xs text-muted-foreground">Na váš účet bylo připsáno 1 000 Kč.</p>
                      <p className="text-xs text-muted-foreground mt-1">Před 1 dnem</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full">
                Zobrazit všechny notifikace
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                {avatarUrl && <AvatarImage src={avatarUrl} />}
              </Avatar>
              <div className="hidden md:block text-left mr-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs text-muted-foreground leading-none mt-1">{userEmail}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Můj účet</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Nastavení účtu</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Platby a fakturace</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Nápověda a podpora</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <form action="/auth/signout" method="post" className="w-full">
              <Button 
                type="submit"
                variant="ghost" 
                className="w-full h-8 justify-start px-2 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Odhlásit se</span>
              </Button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}