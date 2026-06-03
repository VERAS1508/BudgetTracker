# Budget Tracker

Eine persönliche Budgetverwaltungs-App zum Erfassen und Analysieren von Ausgaben.


## Features

- Anmeldung & Registrierung per E-Mail
- Ausgaben hinzufügen mit Betrag, Beschreibung, Kategorie und Datum
- Eigene Kategorien mit Farbwahl erstellen
- Dashboard mit Monatsübersicht, Charts und Statistiken
- Mehrsprachig: Deutsch & Englisch

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) (Auth + PostgreSQL)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [Lucide Icons](https://lucide.dev)

## Lokale Entwicklung

1. Repository klonen
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
3. `.env.local` aus der Vorlage erstellen:
   ```bash
   cp .env.local.example .env.local
   ```
4. Supabase-Zugangsdaten in `.env.local` eintragen
5. Datenbankschema in Supabase ausführen (`supabase/schema.sql`)
6. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```

App läuft unter [http://localhost:3000](http://localhost:3000)
