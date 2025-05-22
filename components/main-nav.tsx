"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  MessageSquare,
  BookOpen
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import React from "react"

// Upravená struktura navigace podle požadavků
const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "E-shopy",
    href: "/dashboard/shops",
    icon: Store,
  },
  {
    title: "Kredit a platby",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Support",
    href: "/dashboard/support",
    icon: HelpCircle,
    submenu: [
      {
        title: "Ticket systém",
        href: "/dashboard/support/tickets",
        icon: MessageSquare,
      },
      {
        title: "Znalostní báze",
        href: "/dashboard/support/knowledgebase",
        icon: BookOpen,
      }
    ]
  },
  {
    title: "Nastavení účtu",
    href: "/dashboard/account",
    icon: Settings,
  }
]

interface MainNavProps {
  isMobile?: boolean
}

export function MainNav({ isMobile = false }: MainNavProps) {
  const pathname = usePathname()
  
  // State pro rozbalené submenu
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(
    pathname.startsWith("/dashboard/support") ? "/dashboard/support" : null
  )
  
  const toggleSubmenu = (href: string) => {
    setOpenSubmenu(openSubmenu === href ? null : href)
  }

  return (
    <nav className={`w-64 min-h-screen border-r border-border/40 bg-background flex flex-col ${isMobile ? 'w-full' : ''}`}>
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center px-6 border-b border-border/40">
          <Link href="/dashboard" className="font-bold text-xl flex items-center">
            <div className="mr-2 bg-primary p-1 rounded">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            PassProve
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {navItems.map((item) => (
              <React.Fragment key={item.href}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.href)}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        (pathname === item.href || pathname.startsWith(`${item.href}/`))
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.title}
                      </div>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className={`h-4 w-4 transition-transform ${openSubmenu === item.href ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                    
                    {openSubmenu === item.href && (
                      <div className="pl-9 space-y-1 mt-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              pathname === subItem.href
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <subItem.icon className="h-4 w-4" />
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-border/40">
          <div className="flex items-center justify-between">
            <ModeToggle />
            <form action="/auth/signout" method="post">
              <Button 
                type="submit"
                variant="ghost" 
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Odhlásit se</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
} 