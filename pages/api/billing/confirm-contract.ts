import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '../../../lib/email'; // Předpokládám, že máš funkci pro odesílání e-mailů
import { saveContractToDB } from '../../../lib/db'; // Funkce pro uložení smlouvy do DB
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { contractText, pricingTier, userEmail } = req.body;

    const supabase = createPagesServerClient({ req, res });
    const { data: existingContract } = await supabase
      .from("contracts")
      .select("id")
      .eq("user_email", userEmail)
      .maybeSingle();

    if (existingContract) {
      return res.status(400).json({ message: "Smlouva již byla podána. Opakovaná žádost není možná." });
    }

    // Uložení smlouvy do databáze
    const contractId = await saveContractToDB(req, res, contractText, pricingTier, userEmail);

    // E-mail administrátora z .env
    const adminEmail = process.env.ADMIN_EMAIL || "podpora@passprove.cz";

    if (!userEmail) {
      return res.status(400).json({ message: "Chybí e-mail uživatele." });
    }
    if (!adminEmail) {
      return res.status(500).json({ message: "Chybí e-mail administrátora." });
    }

    // Odeslání e-mailu administrátorovi
    await sendEmail(
      adminEmail,
      'Nová smlouva k potvrzení',
      `Nová smlouva byla uzavřena. ID smlouvy: ${contractId}`
    );

    // Odeslání e-mailu uživateli (dynamicky)
    await sendEmail(
      userEmail,
      'Smlouva byla uzavřena',
      `Vaše smlouva byla úspěšně uzavřena a čeká na schválení administrátorem.`
    );

    res.status(200).json({ message: 'Smlouva byla úspěšně zpracována.' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 