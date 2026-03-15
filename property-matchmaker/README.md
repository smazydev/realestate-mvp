# Property Matchmaker

Real estate buyer and property matching SaaS MVP. Next.js (App Router), TypeScript, Tailwind, Supabase.

## Setup

```bash
npm install
cp .env.example .env
# Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — Dev server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Lint

## Structure

- **app/** — Next.js App Router (dashboard layout, pages)
- **components/layout/** — Sidebar, header, breadcrumb
- **lib/** — Supabase client/server, mock data
- **types/** — Shared TypeScript types
