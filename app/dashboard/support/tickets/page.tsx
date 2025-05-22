import { Metadata } from "next"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { CreateTicketDialog } from "@/components/support/create-ticket-dialog"
import { getTickets } from "@/lib/actions/tickets"

export const metadata: Metadata = {
  title: "Ticket Systém | PassProve",
  description: "Podpora a ticket systém pro verifikační službu PassProve"
}

export default async function TicketsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }
  
  // Načtení ticketů
  const { activeTickets = [], closedTickets = [], error } = await getTickets()

  // Funkce pro formátování data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Funkce pro zobrazení správného badge podle stavu ticketu
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default">Otevřený</Badge>;
      case 'waiting':
        return <Badge variant="secondary">Čeká na odpověď</Badge>;
      case 'in_progress':
        return <Badge variant="warning">V řešení</Badge>;
      case 'closed':
        return <Badge variant="outline">Uzavřený</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  // Funkce pro zobrazení správné ikony podle stavu ticketu
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <MessageSquare className="h-4 w-4 mr-1 text-primary" />;
      case 'waiting':
        return <Clock className="h-4 w-4 mr-1 text-yellow-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 mr-1 text-orange-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 mr-1 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 mr-1" />;
    }
  }

  // Funkce pro zobrazení správné ikony podle priority
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Vysoká</Badge>;
      case 'medium':
        return <Badge variant="secondary">Střední</Badge>;
      case 'low':
        return <Badge variant="outline">Nízká</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Ticket Systém</h1>
          <p className="text-muted-foreground mt-1">
            Podpora a pomoc k verifikačnímu systému
          </p>
        </div>
        <CreateTicketDialog />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          <h3 className="font-medium">Chyba při načítání ticketů</h3>
          <p>{error}</p>
        </div>
      )}

      <Tabs defaultValue="active" className="mb-8">
        <TabsList>
          <TabsTrigger value="active">Aktivní</TabsTrigger>
          <TabsTrigger value="closed">Uzavřené</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Aktivní tickety</CardTitle>
              <CardDescription>
                Seznam vašich aktivních ticketů
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTickets.length > 0 ? (
                <div className="rounded-md border">
                  <div className="divide-y">
                    {activeTickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 hover:bg-muted/40 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {renderStatusIcon(ticket.status)}
                              <span className="font-medium">{ticket.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground ml-3">#{ticket.ticket_number}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderPriorityBadge(ticket.priority)}
                            {renderStatusBadge(ticket.status)}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <div>
                            <span>Vytvořeno: {formatDate(ticket.created_at)}</span>
                            <span className="mx-2">•</span>
                            <span>Poslední aktualizace: {formatDate(ticket.updated_at)}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-3.5 w-3.5 mr-1" />
                            <span>{ticket.message_count} zpráv</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Zatím nemáte žádné aktivní tickety</h3>
                  <p className="text-muted-foreground mb-6">
                    Vytvořte nový ticket, pokud potřebujete pomoc nebo máte dotaz
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="closed">
          <Card>
            <CardHeader>
              <CardTitle>Uzavřené tickety</CardTitle>
              <CardDescription>
                Historie vyřešených ticketů
              </CardDescription>
            </CardHeader>
            <CardContent>
              {closedTickets.length > 0 ? (
                <div className="rounded-md border">
                  <div className="divide-y">
                    {closedTickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 hover:bg-muted/40 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {renderStatusIcon(ticket.status)}
                              <span className="font-medium">{ticket.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground ml-3">#{ticket.ticket_number}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStatusBadge(ticket.status)}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <div>
                            <span>Vytvořeno: {formatDate(ticket.created_at)}</span>
                            <span className="mx-2">•</span>
                            <span>Uzavřeno: {formatDate(ticket.updated_at)}</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" />
                            <span>Vyřešeno</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Zatím nemáte žádné uzavřené tickety</h3>
                  <p className="text-muted-foreground">
                    Historie vyřešených požadavků se zobrazí zde
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 