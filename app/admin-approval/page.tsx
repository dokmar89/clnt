"use client"

import { useState, useEffect } from "react"
import { approveRegistration, rejectRegistration, getPendingRegistrations } from "./actions"
import { createClient } from "@supabase/supabase-js"

interface Registration {
  id: string
  name: string
  ico: string
  dic: string
  address: string
  city: string
  postal_code: string
  country: string
  contact_email: string
  contact_phone: string
  created_at: string
  owner_id: string
}

export default function AdminApprovalPage() {
  const [pendingRegistrations, setPendingRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [allCompanies, setAllCompanies] = useState<any[]>([])

  // Načtení žádostí o registraci
  async function loadPendingRegistrations() {
    setIsLoading(true)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    
    const { data: allData } = await supabase
      .from('companies')
      .select('*')
    
    setAllCompanies(allData || [])
    
    const result = await getPendingRegistrations()
    setIsLoading(false)
    
    if (result.success) {
      setPendingRegistrations(result.data)
    } else {
      setMessage({ type: "error", text: `Chyba při načítání žádostí: ${result.error}` })
    }
  }

  useEffect(() => {
    loadPendingRegistrations()
  }, [])

  // Schválení registrace
  async function handleApprove(company: Registration) {
    try {
      setIsLoading(true)
      const result = await approveRegistration(company.id, company.owner_id)
      setIsLoading(false)
      
      if (result.success) {
        setMessage({ type: "success", text: `Firma ${company.name} byla úspěšně schválena.` })
        // Odstranění z seznamu
        setPendingRegistrations(prev => prev.filter(reg => reg.id !== company.id))
        setSelectedRegistration(null)
      } else {
        setMessage({ type: "error", text: `Chyba při schvalování: ${result.error}` })
      }
    } catch (error) {
      setIsLoading(false)
      setMessage({ type: "error", text: `Neočekávaná chyba: ${error instanceof Error ? error.message : String(error)}` })
    }
  }

  // Zamítnutí registrace
  async function handleReject(company: Registration) {
    try {
      setIsLoading(true)
      const result = await rejectRegistration(company.id, company.owner_id)
      setIsLoading(false)
      
      if (result.success) {
        setMessage({ type: "success", text: `Firma ${company.name} byla zamítnuta.` })
        // Odstranění z seznamu
        setPendingRegistrations(prev => prev.filter(reg => reg.id !== company.id))
        setSelectedRegistration(null)
      } else {
        setMessage({ type: "error", text: `Chyba při zamítnutí: ${result.error}` })
      }
    } catch (error) {
      setIsLoading(false)
      setMessage({ type: "error", text: `Neočekávaná chyba: ${error instanceof Error ? error.message : String(error)}` })
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('cs-CZ')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Schvalování registrací firem</h1>
      
      {/* Debug informace */}
      <div className="mb-6 p-4 bg-gray-100 rounded-md">
        <h2 className="font-bold mb-2">Diagnostické informace:</h2>
        <p>Celkový počet firem v databázi: {allCompanies.length}</p>
        <p>Počet nevyřízených žádostí: {pendingRegistrations.length}</p>
        
        <div className="mt-4">
          <h3 className="font-medium">Všechny firmy v databázi:</h3>
          <table className="w-full mt-2 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Název</th>
                <th className="p-2 text-left">is_active</th>
                <th className="p-2 text-left">Vytvořeno</th>
              </tr>
            </thead>
            <tbody>
              {allCompanies.map(company => (
                <tr key={company.id} className="border-b">
                  <td className="p-2">{company.name}</td>
                  <td className="p-2">{company.is_active ? "Ano" : "Ne"}</td>
                  <td className="p-2">{new Date(company.created_at).toLocaleString('cs-CZ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
          <button 
            className="ml-2 font-bold"
            onClick={() => setMessage(null)}
          >
            ×
          </button>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : pendingRegistrations.length === 0 ? (
        <div className="text-center py-10 border rounded">
          <p className="text-lg">Nejsou žádné nevyřízené žádosti o registraci.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border rounded p-4">
            <h2 className="text-xl font-semibold mb-4">Nevyřízené žádosti ({pendingRegistrations.length})</h2>
            <ul className="space-y-2">
              {pendingRegistrations.map(registration => (
                <li 
                  key={registration.id}
                  className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${selectedRegistration?.id === registration.id ? 'bg-blue-50 border-blue-200' : ''}`}
                  onClick={() => setSelectedRegistration(registration)}
                >
                  <div className="font-medium">{registration.name}</div>
                  <div className="text-sm text-gray-500">IČO: {registration.ico}</div>
                  <div className="text-sm text-gray-500">Založeno: {formatDate(registration.created_at)}</div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-2 border rounded p-4">
            {selectedRegistration ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Detail žádosti</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="font-medium text-gray-500">Firemní údaje</h3>
                    <dl className="space-y-1 mt-2">
                      <div>
                        <dt className="inline font-medium">Název:</dt>
                        <dd className="inline ml-1">{selectedRegistration.name}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">IČO:</dt>
                        <dd className="inline ml-1">{selectedRegistration.ico}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">DIČ:</dt>
                        <dd className="inline ml-1">{selectedRegistration.dic}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">Adresa:</dt>
                        <dd className="inline ml-1">{selectedRegistration.address}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">Město:</dt>
                        <dd className="inline ml-1">{selectedRegistration.city}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">PSČ:</dt>
                        <dd className="inline ml-1">{selectedRegistration.postal_code}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">Země:</dt>
                        <dd className="inline ml-1">{selectedRegistration.country}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-500">Kontaktní údaje</h3>
                    <dl className="space-y-1 mt-2">
                      <div>
                        <dt className="inline font-medium">Email:</dt>
                        <dd className="inline ml-1">{selectedRegistration.contact_email}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">Telefon:</dt>
                        <dd className="inline ml-1">{selectedRegistration.contact_phone}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">Datum registrace:</dt>
                        <dd className="inline ml-1">{formatDate(selectedRegistration.created_at)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => handleApprove(selectedRegistration)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Schválit registraci
                  </button>
                  <button
                    onClick={() => handleReject(selectedRegistration)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Zamítnout registraci
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Vyberte žádost ze seznamu pro zobrazení detailů.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 