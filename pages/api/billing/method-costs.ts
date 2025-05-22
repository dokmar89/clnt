import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pricing_tier } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!pricing_tier || typeof pricing_tier !== 'string') {
    return res.status(400).json({ message: 'Chybí nebo je neplatný parametr pricing_tier.' });
  }

  // Připojení k Supabase
  const supabase = createPagesServerClient({ req, res });

  // Načtení cen z tabulky "method_costs"
  const { data, error } = await supabase
    .from('method_costs')
    .select('id, method_code, pricing_tier, cost, created_at')
    .eq('pricing_tier', pricing_tier);

  if (error) {
    return res.status(500).json({ message: 'Chyba při načítání ceníku.' });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ message: 'Ceník nenalezen.' });
  }

  // VRACÍME POUZE DATA Z DATABÁZE!
  return res.status(200).json(data);
}