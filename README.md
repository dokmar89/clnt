# PassProve — zákaznický provozní portál

Varianta zákaznického portálu v Next.js a Supabase pro firemní účty, e-shopy, fakturační přehledy a podporu.

**Stav:** Starší nebo souběžná varianta PassProve uchovaná jako reference; nejde o označení hlavní produkční verze.

## Co projekt obsahuje

- Správa účtu a firemních údajů.
- Správa e-shopů, rozhraní API klíčů a přehledy aktivity.
- Tikety podpory, znalostní báze, peněženka a fakturační komponenty.
- Přihlašovací akce a obrazovky schvalování registrací.

## Technologie

Next.js, React, TypeScript, Tailwind CSS, Supabase, Nodemailer.

## Architektura a struktura

- `app/` — stránky portálu a přihlašování
- `components/` — účet, e-shopy, fakturace a podpora
- `lib/actions/` — moduly serverových akcí
- `lib/supabase/` — klientské a serverové databázové funkce

## Lokální vývoj

Potřebujete Node.js a npm. V kořenové složce repozitáře spusťte:

```sh
npm install
npm run dev
```

Příkaz pro sestavení uvedený v projektu: `npm run build`.

Jde o příkazy deklarované v repozitáři, nikoli o potvrzení úspěšného sestavení. Instalace závislostí, sestavení ani napojení na živé služby nebyly při úpravě dokumentace spuštěny.

## Konfigurace a omezení

Před použitím zákaznických dat zkontrolujte politiky Supabase, přihlašování a serverové akce. Finanční obrazovky nedokládají auditovaný platební systém. Více konfigurací Next.js a kombinované struktury cest vyžadují ověření před sjednocením.

## Přínos pro portfolio

Reference pro nástroje zákaznické podpory a oddělení provozního rozhraní od datových služeb.

## Co doplnit do dokumentace

Snímky obrazovky s fiktivními daty, opakovatelný postup ověření a přehled skutečně otestovaných integrací. Přihlašovací údaje a konfigurace konkrétního nasazení patří mimo Git.
