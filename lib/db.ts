import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export async function saveContractToDB(
  req: NextApiRequest,
  res: NextApiResponse,
  contractText: string,
  pricingTier: string,
  userEmail: string
) {
  const supabase = createPagesServerClient({ req, res });

  // Upravte podle skutečné struktury vaší tabulky (např. "contracts")
  const { data, error } = await supabase
    .from("contracts")
    .insert([
      {
        contract_text: contractText,
        pricing_tier: pricingTier,
        user_email: userEmail,
        created_at: new Date().toISOString(),
      }
    ])
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}
