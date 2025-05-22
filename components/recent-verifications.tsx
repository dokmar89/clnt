"use client"

import { formatDistanceToNow } from "date-fns"
import { cs } from "date-fns/locale"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  HourglassIcon 
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import type { VerificationLog } from "@/lib/supabase/types"

type LogsProps = {
  logs: (VerificationLog & {
    shops?: {
      name?: string
    }
  })[]
}

const getStatusIcon = (status: string) => {
  switch(status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "pending":
      return <Clock className="h-4 w-4 text-amber-500" />
    case "processing":
      return <HourglassIcon className="h-4 w-4 text-blue-500" />
    case "requires_action":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case "expired":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const getStatusLabel = (status: string) => {
  switch(status) {
    case "success": return "Úspěšná"
    case "failed": return "Neúspěšná"
    case "pending": return "Čeká"
    case "processing": return "Zpracovává se"
    case "requires_action": return "Vyžaduje akci"
    case "expired": return "Vypršela"
    case "error": return "Chyba"
    default: return status
  }
}

export function RecentVerifications({ logs }: LogsProps) {
  if (!logs || !logs.length) {
    return (
      <div className="bg-card border rounded-lg p-6 text-center">
        <p className="text-muted-foreground">Zatím nejsou žádné verifikace</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metoda</TableHead>
            <TableHead>E-shop</TableHead>
            <TableHead>Identifikátor</TableHead>
            <TableHead>Stav</TableHead>
            <TableHead>Čas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">
                {log.method_code}
              </TableCell>
              <TableCell>{log.shops?.name || "Neznámý e-shop"}</TableCell>
              <TableCell className="truncate max-w-[120px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">
                        {log.user_identifier_input || "-"}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {log.user_identifier_input || "-"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="gap-1 font-normal">
                  {getStatusIcon(log.status)}
                  {getStatusLabel(log.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {log.started_at 
                  ? formatDistanceToNow(new Date(log.started_at), { 
                      addSuffix: true,
                      locale: cs
                    })
                  : "-"
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 