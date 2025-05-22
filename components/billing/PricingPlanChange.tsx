'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface MethodCost {
  method_code: string;
  cost: number;
}

const vyhodyTarifu = {
  no_contract: {
    nazev: "Bez smlouvy",
    vyhody: [
      "Okamžitá změna tarifu",
      "Žádný dlouhodobý závazek",
    ],
    podminky: "Vyšší cena za ověření, platba měsíčně.",
  },
  contract: {
    nazev: "Smlouva",
    vyhody: [
      "Výrazně nižší cena za ověření",
      "Garance ceny po dobu smlouvy",
    ],
    podminky: "Závazek na dobu smlouvy, změna pouze po potvrzení.",
  },
};

export default function PricingPlanChange({ currentTier, userEmail, hasContract }: { currentTier: 'no_contract' | 'contract', userEmail: string, hasContract: boolean }) {
  const [krok, setKrok] = useState(1);
  const [vybranyTarif, setVybranyTarif] = useState<'no_contract' | 'contract'>(currentTier);
  const [ceny, setCeny] = useState<MethodCost[]>([]);
  const [cenyLoading, setCenyLoading] = useState<boolean>(false);
  const [cenyError, setCenyError] = useState<string | null>(null);
  const [souhlas, setSouhlas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/billing/method-costs?pricing_tier=${vybranyTarif}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Chyba při načítání ceníku');
        }
        return res.json();
      })
      .then(data => setCeny(data))
      .catch(error => console.error(error));
  }, [vybranyTarif]);

  // Návrh smlouvy (může být dynamický, zde pro ukázku staticky)
  const navrhSmlouvy = `
    Smlouva o poskytování služby na 2 roky
    --------------------------------------
    Smluvní strany: [Vaše společnost] a [Uživatel]
    Předmět: Poskytování služby za zvýhodněných podmínek po dobu 2 let.
    Cena za ověření dle aktuálního ceníku.
    Závazek: Smlouva je závazná na 2 roky od data uzavření.
    ...
  `;

  // Odeslání žádosti o změnu tarifu a potvrzení smlouvy
  const handlePotvrditSmlouvu = async () => {
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/billing/confirm-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractText: navrhSmlouvy,
          pricingTier: vybranyTarif,
          userEmail,
        }),
      });
      if (res.ok) {
        setKrok(3);
      } else {
        const errorData = await res.json().catch(() => null);
        setSubmitError(errorData?.message || `Nastala chyba při potvrzení smlouvy (${res.status}).`);
      }
    } catch (error: any) {
      console.error("Contract confirmation error:", error);
      setSubmitError(error.message || "Došlo k neočekávané chybě při odesílání.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadContract = () => {
    const blob = new Blob([navrhSmlouvy], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'navrh_smlouvy.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  if (hasContract) {
    return (
      <div className="p-4 bg-green-100 border border-green-300 rounded text-green-800">
        <h2 className="text-lg font-bold mb-2">Smlouva již byla podána</h2>
        <p>Vaše žádost o smlouvu je již evidována. Opakovaná žádost není možná.</p>
      </div>
    );
  }

  return (
    <div>
      {krok === 1 && (
        <>
          <h2>Cenový tarif</h2>
          <div>
            <label style={{ marginRight: '10px' }}>
              <input
                type="radio"
                checked={vybranyTarif === 'no_contract'}
                onChange={() => setVybranyTarif('no_contract')}
                disabled={currentTier === 'contract'}
              />
              Bez smlouvy
            </label>
            <label>
              <input
                type="radio"
                checked={vybranyTarif === 'contract'}
                onChange={() => setVybranyTarif('contract')}
                disabled={currentTier === 'contract'}
              />
              Smlouva
            </label>
          </div>
          <div style={{ marginTop: '20px', marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px' }}>
            <h3>{vyhodyTarifu[vybranyTarif].nazev}</h3>
            <ul style={{ paddingLeft: '20px' }}>
              {vyhodyTarifu[vybranyTarif].vyhody.map(v => <li key={v}>{v}</li>)}
            </ul>
            <p><strong>Podmínky:</strong> {vyhodyTarifu[vybranyTarif].podminky}</p>
          </div>
          <h4>Ceník ověření</h4>
          {cenyLoading && <p>Načítání ceníku...</p>}
          {cenyError && <p style={{ color: 'red' }}>{cenyError}</p>}
          {!cenyLoading && !cenyError && ceny.length > 0 && (
            <Table className="w-full mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Kód metody</TableHead>
                  <TableHead className="text-right">Cena</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ceny.map((c) => (
                  <TableRow key={c.method_code} className="hover:bg-muted transition">
                    <TableCell className="font-medium">{c.method_code}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('cs-CZ', {
                        style: 'currency',
                        currency: 'CZK',
                        maximumFractionDigits: 0
                      }).format(c.cost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!cenyLoading && !cenyError && ceny.length === 0 && !cenyError && <p>Ceník není momentálně k dispozici.</p>}
          {vybranyTarif === 'contract' && currentTier !== 'contract' && (
            <button 
              onClick={() => setKrok(2)}
              style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Pokračovat k uzavření smlouvy
            </button>
          )}
        </>
      )}

      {krok === 2 && (
        <>
          <h2>Návrh smlouvy</h2>
          <pre style={{ maxHeight: 300, overflow: "auto", background: "#f8f8f8", padding: 16, border: '1px solid #ccc', borderRadius: '4px' }}>
            {navrhSmlouvy}
          </pre>
          <button 
            onClick={handleDownloadContract} 
            style={{ marginTop: 8, marginBottom: 16, padding: '8px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Stáhnout návrh smlouvy
          </button>
          <div style={{ marginTop: '10px', marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={souhlas}
                onChange={e => setSouhlas(e.target.checked)}
                style={{ marginRight: '5px' }}
              />
              Přečetl(a) jsem si smlouvu a souhlasím s podmínkami.
            </label>
          </div>
          <button
            disabled={!souhlas || loading}
            onClick={handlePotvrditSmlouvu}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: (!souhlas || loading) ? '#ccc' : '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: (!souhlas || loading) ? 'not-allowed' : 'pointer' 
            }}
          >
            {loading ? "Odesílám..." : "Souhlasím a uzavírám smlouvu"}
          </button>
          {submitError && <p style={{ color: 'red', marginTop: '10px' }}>{submitError}</p>}
        </>
      )}

      {krok === 3 && (
        <>
          <h2>Smlouva byla uzavřena</h2>
          <div style={{ padding: '15px', border: '1px solid #28a745', borderRadius: '5px', backgroundColor: '#d4edda', color: '#155724' }}>
            <p>
              Smlouva byla úspěšně uzavřena a čeká na schválení administrátorem.
              Po schválení bude smlouva dostupná ke stažení v sekci <b>Dokumenty</b>.
              O průběhu budete informováni e-mailem.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
