"use client"

import { useState } from "react"
import { FileText, Download, Eye, Calendar } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Company } from "@/lib/supabase/types"

interface Document {
  id: string
  name: string
  type: 'contract' | 'terms' | 'pricelist' | 'other'
  file_path: string
  created_at: string
  status?: 'pending' | 'active' | 'expired'
}

interface CompanyDocumentsProps {
  company: Company
  documents: Document[]
}

export function CompanyDocuments({ company, documents }: CompanyDocumentsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ')
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'contract':
        return 'Smlouva'
      case 'terms':
        return 'Obchodní podmínky'
      case 'pricelist':
        return 'Ceník'
      case 'other':
        return 'Ostatní'
      default:
        return type
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'pending':
        return 'warning'
      case 'expired':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktivní'
      case 'pending':
        return 'Čeká na podpis'
      case 'expired':
        return 'Vypršel'
      default:
        return status
    }
  }

  const handleDownload = async (filePath: string, fileName: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath)
      
      if (error) {
        throw error
      }
      
      const blob = new Blob([data])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success('Dokument byl úspěšně stažen')
    } catch (error) {
      console.error('Chyba při stahování dokumentu:', error)
      toast.error('Nepodařilo se stáhnout dokument')
    } finally {
      setIsLoading(false)
    }
  }

  const staticDocuments: Document[] = [
    {
      id: '1',
      name: 'Obchodní podmínky PassProve',
      type: 'terms',
      file_path: 'terms/terms_of_service.pdf',
      created_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '2',
      name: 'Ceník služeb',
      type: 'pricelist',
      file_path: 'terms/price_list.pdf',
      created_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '3',
      name: 'Podmínky ochrany osobních údajů',
      type: 'terms',
      file_path: 'terms/privacy_policy.pdf',
      created_at: new Date().toISOString(),
      status: 'active'
    }
  ]

  // Kombinujeme statické dokumenty s dokumenty z DB
  const allDocuments = [...staticDocuments, ...documents]

  return (
    <div className="space-y-6">
      {allDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nejsou k dispozici žádné dokumenty</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Název dokumentu</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Stav</TableHead>
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {doc.name}
                  </div>
                </TableCell>
                <TableCell>{getDocumentTypeLabel(doc.type)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(doc.created_at)}
                  </div>
                </TableCell>
                <TableCell>
                  {doc.status && (
                    <Badge variant={getStatusBadgeVariant(doc.status)}>
                      {getStatusLabel(doc.status)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc.file_path, doc.name)}
                      disabled={isLoading}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Stáhnout
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Zobrazit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
} 